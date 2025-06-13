import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { AiModel, Conversation, Message } from "@shared/schema";

interface ChatInterfaceProps {
  selectedModelId: number | null;
}

export default function ChatInterface({ selectedModelId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get selected model details
  const { data: selectedModel } = useQuery<AiModel>({
    queryKey: ['/api/models', selectedModelId],
    enabled: !!selectedModelId,
  });

  // Get usage stats
  const { data: usage } = useQuery({
    queryKey: ['/api/usage'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Get conversation messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/conversations', currentConversation?.id, 'messages'],
    enabled: !!currentConversation?.id,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { modelId: number; title: string }) => {
      const response = await apiRequest('POST', '/api/conversations', data);
      return response.json();
    },
    onSuccess: (conversation) => {
      setCurrentConversation(conversation);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "未授权",
          description: "您已退出登录，正在重新登录...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "创建对话失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; role: string; content: string }) => {
      const response = await apiRequest('POST', '/api/messages', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', currentConversation?.id, 'messages'] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/usage'] });
      setInput("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "未授权",
          description: "您已退出登录，正在重新登录...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "发送失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });

  // Start new conversation when model is selected
  useEffect(() => {
    if (selectedModelId && selectedModel && !currentConversation) {
      createConversationMutation.mutate({
        modelId: selectedModelId,
        title: `与${selectedModel.displayName}的对话`,
      });
    }
  }, [selectedModelId, selectedModel]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation || sendMessageMutation.isPending) {
      return;
    }

    const messageContent = input.trim();
    sendMessageMutation.mutate({
      conversationId: currentConversation.id,
      role: 'user',
      content: messageContent,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRemainingCalls = () => {
    if (!user || !usage) return null;
    
    if (user.role === 'vip' || user.role === 'admin') {
      return '无限';
    }
    
    const remaining = Math.max(0, 10 - usage.dailyUsage);
    return remaining.toString();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="bg-kunlun-blue text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 bg-kunlun-gold">
              <AvatarFallback className="text-kunlun-blue">
                <Bot className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-white">
                {selectedModel?.displayName || '请选择AI模型'}
              </CardTitle>
              <span className="text-xs opacity-80">
                {selectedModel ? '在线' : '等待中'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm opacity-80">剩余调用:</span>
            <Badge className="bg-kunlun-gold text-kunlun-blue">
              {getRemainingCalls() || '...'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedModel ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">欢迎使用昆仑AI平台</p>
                <p className="text-sm">请从左侧选择一个AI模型开始对话</p>
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kunlun-blue"></div>
            </div>
          ) : (
            <>
              {/* Welcome Message */}
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8 bg-kunlun-blue">
                  <AvatarFallback className="text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                  <p className="text-gray-800">
                    您好！我是{selectedModel.displayName}，您的AI助手。
                    {selectedModel.description}
                    请问有什么可以为您服务的吗？
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              {messages?.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 bg-kunlun-blue">
                      <AvatarFallback className="text-white">
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                    message.role === 'user' 
                      ? 'bg-kunlun-blue text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 bg-kunlun-gold">
                      <AvatarFallback className="text-kunlun-blue">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8 bg-kunlun-blue">
                    <AvatarFallback className="text-white">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <span className="text-gray-500 text-sm">AI正在思考...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedModel ? "输入您的问题..." : "请先选择AI模型"}
              disabled={!selectedModel || sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!selectedModel || !input.trim() || sendMessageMutation.isPending}
              className="bg-kunlun-blue hover:bg-blue-800 text-white"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
