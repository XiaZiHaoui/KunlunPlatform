import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertConversationSchema, insertMessageSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";

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
      
      // Increment usage if it's a user message
      if (messageData.role === 'user') {
        await storage.incrementUsage(userId, conversation.modelId);
      }

      // TODO: Integrate with actual AI models here
      // For now, return a mock response
      if (messageData.role === 'user') {
        const aiResponse = await storage.addMessage({
          conversationId: messageData.conversationId,
          role: 'assistant',
          content: `这是来自AI模型的回复：${messageData.content}`,
        });
        res.json([message, aiResponse]);
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
    // Insert default AI models
    const defaultModels = [
      {
        name: 'gpt-4',
        displayName: '龙神GPT-4',
        provider: 'OpenAI',
        description: '最强大的语言理解与生成模型，擅长复杂推理、创意写作和代码生成',
        accuracy: 95,
        speed: 'fast',
        category: 'text',
        isActive: true,
        requiresVip: false,
      },
      {
        name: 'claude',
        displayName: '凤凰Claude',
        provider: 'Anthropic',
        description: '注重安全性和有用性的AI助手，擅长深度分析、学术研究和安全对话',
        accuracy: 93,
        speed: 'medium',
        category: 'text',
        isActive: true,
        requiresVip: false,
      },
      {
        name: 'gemini',
        displayName: '麒麟Gemini',
        provider: 'Google',
        description: '支持文本、图像、音频多模态处理的先进AI模型，适合综合性任务处理',
        accuracy: 91,
        speed: 'fast',
        category: 'multimodal',
        isActive: true,
        requiresVip: true,
      },
      {
        name: 'dall-e',
        displayName: '神笔DALL-E',
        provider: 'OpenAI',
        description: '革命性的文本到图像生成模型，能够创造出惊人的艺术作品和概念图像',
        accuracy: 88,
        speed: 'medium',
        category: 'image',
        isActive: true,
        requiresVip: true,
      },
      {
        name: 'midjourney',
        displayName: '幻境Midjourney',
        provider: 'Midjourney',
        description: '专业级艺术图像生成工具，特别擅长创造富有想象力的艺术作品',
        accuracy: 92,
        speed: 'slow',
        category: 'image',
        isActive: true,
        requiresVip: true,
      },
      {
        name: 'codex',
        displayName: '文曲星CodeX',
        provider: 'OpenAI',
        description: '专门优化的代码生成和理解模型，支持多种编程语言和框架',
        accuracy: 96,
        speed: 'fast',
        category: 'code',
        isActive: true,
        requiresVip: false,
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
