import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mountain, Star, Settings, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

interface NavigationProps {
  onUpgrade?: () => void;
}

export default function Navigation({ onUpgrade }: NavigationProps) {
  const { user } = useAuth();

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'vip':
        return { text: 'VIP用户', color: 'bg-kunlun-gold/20 text-kunlun-bronze', icon: Star };
      case 'admin':
        return { text: '管理员', color: 'bg-kunlun-red/20 text-kunlun-red', icon: Settings };
      default:
        return { text: '普通用户', color: 'bg-gray-100 text-gray-600', icon: User };
    }
  };

  const getUserInitial = (user: any) => {
    if (user?.firstName) return user.firstName[0];
    if (user?.email) return user.email[0].toUpperCase();
    return '用';
  };

  const roleInfo = user ? getRoleDisplay(user.role) : null;
  const RoleIcon = roleInfo?.icon || User;

  return (
    <nav className="bg-white shadow-lg border-b-2 border-kunlun-bronze">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer">
              <Mountain className="w-10 h-10 text-kunlun-blue" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-kunlun-blue font-serif">昆仑</h1>
                <span className="text-xs text-gray-500">AI智能平台</span>
              </div>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#models" className="text-gray-700 hover:text-kunlun-blue transition-colors">AI模型</a>
            <a href="#pricing" className="text-gray-700 hover:text-kunlun-blue transition-colors">会员服务</a>
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-gray-700 hover:text-kunlun-blue transition-colors">
                管理后台
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                {roleInfo && (
                  <Badge className={roleInfo.color}>
                    <RoleIcon className="w-4 h-4 mr-1" />
                    {roleInfo.text}
                  </Badge>
                )}
                
                {user.role !== 'vip' && user.role !== 'admin' && onUpgrade && (
                  <Button 
                    onClick={onUpgrade}
                    className="bg-kunlun-gold hover:bg-yellow-500 text-kunlun-blue"
                    size="sm"
                  >
                    升级VIP
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-kunlun-blue text-white text-sm">
                          {getUserInitial(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.firstName || user.email}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>退出登录</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
