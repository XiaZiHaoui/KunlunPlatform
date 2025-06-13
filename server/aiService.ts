import type { AiModel } from "@shared/schema";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  content: string;
  model: string;
}

export class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async chat(model: AiModel, messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      switch (model.name) {
        case 'deepseek-chat':
          return await this.callDeepSeek(messages);
        case 'qwen2.5-72b':
          return await this.callQwen(messages);
        case 'glm-4-9b':
          return await this.callGLM(messages);
        case 'llama3.1-8b':
          return await this.callLlama(messages);
        case 'gpt-4o-mini':
          return await this.callOpenAI(messages, 'gpt-4o-mini');
        case 'claude-3-haiku':
          return await this.callClaude(messages);
        default:
          return await this.mockResponse(model, messages);
      }
    } catch (error) {
      console.error(`Error calling AI model ${model.name}:`, error);
      return await this.mockResponse(model, messages);
    }
  }

  private async callDeepSeek(messages: ChatMessage[]): Promise<ChatResponse> {
    // DeepSeek API integration
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return this.mockResponse({ name: 'deepseek-chat', displayName: '深度求索DeepSeek' } as AiModel, messages);
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: 'deepseek-chat',
    };
  }

  private async callQwen(messages: ChatMessage[]): Promise<ChatResponse> {
    // Qwen API integration (using Alibaba Cloud or Hugging Face)
    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      return this.mockResponse({ name: 'qwen2.5-72b', displayName: '通义千问Qwen2.5' } as AiModel, messages);
    }

    // This would be the actual Qwen API call
    // For now, return a mock response
    return this.mockResponse({ name: 'qwen2.5-72b', displayName: '通义千问Qwen2.5' } as AiModel, messages);
  }

  private async callGLM(messages: ChatMessage[]): Promise<ChatResponse> {
    // GLM-4 API integration
    const apiKey = process.env.GLM_API_KEY;
    if (!apiKey) {
      return this.mockResponse({ name: 'glm-4-9b', displayName: '智谱清言GLM-4' } as AiModel, messages);
    }

    // This would be the actual GLM API call
    return this.mockResponse({ name: 'glm-4-9b', displayName: '智谱清言GLM-4' } as AiModel, messages);
  }

  private async callLlama(messages: ChatMessage[]): Promise<ChatResponse> {
    // Llama API integration (via Hugging Face or local deployment)
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return this.mockResponse({ name: 'llama3.1-8b', displayName: '美洲驼Llama3.1' } as AiModel, messages);
    }

    // This would be the actual Llama API call
    return this.mockResponse({ name: 'llama3.1-8b', displayName: '美洲驼Llama3.1' } as AiModel, messages);
  }

  private async callOpenAI(messages: ChatMessage[], model: string): Promise<ChatResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return this.mockResponse({ name: model, displayName: '龙神GPT-4o Mini' } as AiModel, messages);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: model,
    };
  }

  private async callClaude(messages: ChatMessage[]): Promise<ChatResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return this.mockResponse({ name: 'claude-3-haiku', displayName: '凤凰Claude Haiku' } as AiModel, messages);
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: messages.filter(msg => msg.role !== 'system'),
        system: messages.find(msg => msg.role === 'system')?.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: 'claude-3-haiku',
    };
  }

  private async mockResponse(model: AiModel, messages: ChatMessage[]): Promise<ChatResponse> {
    const lastMessage = messages[messages.length - 1];
    const responses = [
      `我是${model.displayName}，您好！我收到了您的问题："${lastMessage.content}"。`,
      `作为${model.displayName}，我很高兴为您服务。关于您的问题，我建议...`,
      `${model.displayName}为您分析：您提到的"${lastMessage.content}"是一个很有意思的话题。`,
      `感谢您选择${model.displayName}！我理解您想了解关于"${lastMessage.content}"的信息。`,
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return {
      content: randomResponse + "\n\n注意：这是演示回复。要使用真实AI模型，请配置相应的API密钥。",
      model: model.name,
    };
  }
}

export const aiService = AIService.getInstance();