import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface VipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VipUpgradeModal({ isOpen, onClose }: VipUpgradeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');

  const paymentMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      const response = await apiRequest('POST', '/api/payments', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "支付成功",
        description: "恭喜您升级为VIP会员！正在刷新页面...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
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
        title: "支付失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });

  const handlePayment = () => {
    paymentMutation.mutate({
      amount: 20,
      method: selectedPaymentMethod,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="bg-gradient-to-br from-kunlun-gold to-yellow-400 p-6 text-center -m-6 mb-6 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-kunlun-blue">
              升级VIP会员
            </DialogTitle>
          </DialogHeader>
          <p className="text-kunlun-blue opacity-80 mt-2">解锁全部AI功能</p>
        </div>
        
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-kunlun-blue mb-2">¥20</div>
          <div className="text-gray-600">每月订阅</div>
        </div>
        
        <ul className="space-y-3 mb-6">
          <li className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
            无限次AI模型调用
          </li>
          <li className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
            访问所有高级AI模型
          </li>
          <li className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
            优先处理速度
          </li>
          <li className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
            24/7专属客服支持
          </li>
        </ul>

        <div className="space-y-3 mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">选择支付方式:</div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedPaymentMethod === 'alipay' ? 'default' : 'outline'}
              onClick={() => setSelectedPaymentMethod('alipay')}
              className="flex items-center justify-center space-x-2 h-12"
            >
              <CreditCard className="w-4 h-4" />
              <span>支付宝</span>
            </Button>
            
            <Button
              variant={selectedPaymentMethod === 'wechat' ? 'default' : 'outline'}
              onClick={() => setSelectedPaymentMethod('wechat')}
              className="flex items-center justify-center space-x-2 h-12"
            >
              <Smartphone className="w-4 h-4" />
              <span>微信支付</span>
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            disabled={paymentMutation.isPending}
          >
            取消
          </Button>
          <Button 
            onClick={handlePayment}
            className="flex-1 bg-kunlun-blue hover:bg-blue-800 text-white"
            disabled={paymentMutation.isPending}
          >
            {paymentMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>处理中...</span>
              </div>
            ) : (
              `确认支付 ¥20`
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          <p>注意：这是演示支付流程，实际支付功能需要接入真实的支付平台</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
