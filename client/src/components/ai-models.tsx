import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Sparkles, Palette, Mountain, Code, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { AiModel } from "@shared/schema";

interface AiModelsProps {
  onSelectModel: (modelId: number) => void;
}

const modelIcons: Record<string, any> = {
  'gpt-4': Brain,
  'claude': Shield,
  'gemini': Sparkles,
  'dall-e': Palette,
  'midjourney': Mountain,
  'codex': Code,
};

const modelCategories: Record<string, { color: string; label: string }> = {
  'text': { color: 'bg-blue-100 text-blue-800', label: '文本' },
  'image': { color: 'bg-purple-100 text-purple-800', label: '图像' },
  'code': { color: 'bg-green-100 text-green-800', label: '代码' },
  'multimodal': { color: 'bg-orange-100 text-orange-800', label: '多模态' },
};

export default function AiModels({ onSelectModel }: AiModelsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: models, isLoading } = useQuery<AiModel[]>({
    queryKey: ['/api/models'],
  });

  const handleSelectModel = (model: AiModel) => {
    if (model.requiresVip && user?.role !== 'vip' && user?.role !== 'admin') {
      toast({
        title: "需要VIP权限",
        description: `${model.displayName} 需要VIP会员才能使用，请先升级您的账户。`,
        variant: "destructive",
      });
      return;
    }
    onSelectModel(model.id);
    toast({
      title: "模型已选择",
      description: `已选择 ${model.displayName}，可以开始对话了！`,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-kunlun-blue font-serif">AI模型</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-kunlun-blue font-serif">精选AI模型</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {models?.map((model) => {
            const IconComponent = modelIcons[model.name] || Brain;
            const categoryInfo = modelCategories[model.category || 'text'];
            const isLocked = model.requiresVip && user?.role !== 'vip' && user?.role !== 'admin';
            
            return (
              <Card 
                key={model.id} 
                className={`border transition-all duration-200 hover:shadow-md ${
                  isLocked ? 'opacity-75' : 'hover:border-kunlun-bronze cursor-pointer'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-8 h-8 text-kunlun-blue" />
                      <div>
                        <h3 className="font-semibold text-kunlun-blue text-sm">{model.displayName}</h3>
                        <p className="text-xs text-gray-500">{model.provider}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={categoryInfo.color} variant="secondary">
                        {categoryInfo.label}
                      </Badge>
                      {model.requiresVip && (
                        <Crown className="w-4 h-4 text-kunlun-gold" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {model.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3 text-xs">
                    <div className="text-gray-500">
                      精度: <span className="text-kunlun-blue font-semibold">{model.accuracy}%</span>
                    </div>
                    <div className="text-gray-500">
                      速度: <span className="text-kunlun-jade font-semibold">{model.speed}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSelectModel(model)}
                    className="w-full bg-kunlun-blue hover:bg-blue-800 text-white"
                    size="sm"
                    disabled={isLocked}
                  >
                    {isLocked ? '需要VIP' : '选择使用'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
