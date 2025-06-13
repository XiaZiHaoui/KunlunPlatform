import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertConversationSchema, insertMessageSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";
import { aiService } from "./aiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize AI models data
  await initializeAiModels();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // AI Models routes
  app.get('/api/models', async (req, res) => {
    try {
      const models = await storage.getActiveModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  app.get('/api/models/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const model = await storage.getModelById(id);
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }
      res.json(model);
    } catch (error) {
      console.error("Error fetching model:", error);
      res.status(500).json({ message: "Failed to fetch model" });
    }
  });

  // Conversations routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationData = insertConversationSchema.parse({
        ...req.body,
        userId,
      });
      
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversationById(conversationId);
      
      if (!conversation || conversation.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Messages routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check usage limits for non-VIP users
      if (user.role !== 'vip' && user.role !== 'admin') {
        const dailyUsage = await storage.getUserDailyUsage(userId);
        if (dailyUsage >= 10) {
          return res.status(429).json({ message: "Daily usage limit exceeded. Upgrade to VIP for unlimited access." });
        }
      }

      const messageData = insertMessageSchema.parse(req.body);
      
      // Verify user owns the conversation
      const conversation = await storage.getConversationById(messageData.conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const message = await storage.addMessage(messageData);

      // Get AI response for user messages
      if (messageData.role === 'user') {
        // Get the AI model details
        const aiModel = await storage.getModelById(conversation.modelId);
        if (!aiModel) {
          return res.status(404).json({ message: "AI model not found" });
        }

        // Get conversation history for context
        const conversationMessages = await storage.getConversationMessages(messageData.conversationId);
        
        // Format messages for AI service
        const chatMessages = conversationMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        try {
          // Call the AI service
          const aiResponse = await aiService.chat(aiModel, chatMessages);
          
          // Only increment usage if AI service call is successful
          await storage.incrementUsage(userId, conversation.modelId);
          
          // Save AI response to database
          const aiMessage = await storage.addMessage({
            conversationId: messageData.conversationId,
            role: 'assistant',
            content: aiResponse.content,
          });
          
          res.json([message, aiMessage]);
        } catch (error) {
          console.error('AI service error:', error);
          
          // Don't increment usage on error, provide fallback response
          const fallbackMessage = await storage.addMessage({
            conversationId: messageData.conversationId,
            role: 'assistant',
            content: `抱歉，${aiModel.displayName}暂时无法响应，请稍后重试。此次调用不会计入使用次数。`,
          });
          
          res.json([message, fallbackMessage]);
        }
      } else {
        res.json(message);
      }
      
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(500).json({ message: "Failed to add message" });
    }
  });

  // Payment routes
  app.post('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      const payment = await storage.createPayment(paymentData);
      
      // TODO: Integrate with actual payment providers (Alipay, WeChat Pay)
      // For now, simulate successful payment
      setTimeout(async () => {
        await storage.updatePaymentStatus(payment.id, 'completed');
        await storage.updateUserRole(userId, 'vip', paymentData.expiresAt);
      }, 1000);

      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.get('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getUserPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Usage routes
  app.get('/api/usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dailyUsage = await storage.getUserDailyUsage(userId);
      res.json({ dailyUsage });
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      const { role } = req.body;
      
      let vipExpiresAt;
      if (role === 'vip') {
        vipExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }

      await storage.updateUserRole(userId, role, vipExpiresAt);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize AI models data
async function initializeAiModels() {
  const models = await storage.getAllModels();
  if (models.length === 0) {
    // Insert default AI models with real API endpoints
    const defaultModels = [
      {
        name: 'deepseek-chat',
        displayName: '深度求索DeepSeek',
        provider: 'DeepSeek',
        description: '免费开源的中文大语言模型，擅长代码生成、逻辑推理和中文对话',
        accuracy: 92,
        speed: 'fast',
        category: 'text',
        isActive: true,
        requiresVip: false,
      },
      {
        name: 'qwen2.5-72b',
        displayName: '通义千问Qwen2.5',
        provider: 'Alibaba',
        description: '阿里巴巴最新开源模型，在中文理解和生成方面表现优异',
        accuracy: 94,
        speed: 'fast',
        category: 'text',
        isActive: true,
        requiresVip: false,
      },
      {
        name: 'glm-4-9b',
        displayName: '智谱清言GLM-4',
        provider: 'Zhipu AI',
        description: '智谱AI开源模型，支持多轮对话和复杂推理任务',
        accuracy: 91,
        speed: 'medium',
        category: 'text',
        isActive: true,
        requiresVip: false,
      },
      {
        name: 'llama3.1-8b',
        displayName: '美洲驼Llama3.1',
        provider: 'Meta',
        description: 'Meta开源的先进语言模型，在多种任务上表现出色',
        accuracy: 90,
        speed: 'fast',
        category: 'text',
        isActive: true,
        requiresVip: false,
      },
      {
        name: 'gpt-4o-mini',
        displayName: '龙神GPT-4o Mini',
        provider: 'OpenAI',
        description: 'OpenAI轻量版模型，平衡性能与成本，适合日常对话',
        accuracy: 88,
        speed: 'fast',
        category: 'text',
        isActive: true,
        requiresVip: true,
      },
      {
        name: 'claude-3-haiku',
        displayName: '凤凰Claude Haiku',
        provider: 'Anthropic',
        description: 'Anthropic快速响应模型，注重安全性和准确性',
        accuracy: 89,
        speed: 'fast',
        category: 'text',
        isActive: true,
        requiresVip: true,
      },
    ];

    // Actually insert the models into the database
    try {
      await storage.insertModels(defaultModels);
      console.log('Successfully initialized AI models');
    } catch (error) {
      console.error('Error initializing models:', error);
    }
  }
}
