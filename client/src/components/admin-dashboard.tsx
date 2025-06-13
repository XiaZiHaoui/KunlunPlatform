import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Edit, 
  Trash2,
  Crown,
  Shield,
  User as UserIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminStats {
  totalUsers: number;
  vipUsers: number;
  todayCalls: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest('PUT', `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "用户角色已更新",
        description: "用户权限已成功修改",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
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
        title: "更新失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "用户已删除",
        description: "用户账户已成功删除",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
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
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'vip':
        return { text: 'VIP用户', color: 'bg-kunlun-gold/20 text-kunlun-bronze', icon: Star };
      case 'admin':
        return { text: '管理员', color: 'bg-kunlun-red/20 text-kunlun-red', icon: Crown };
      default:
        return { text: '普通用户', color: 'bg-gray-100 text-gray-600', icon: UserIcon };
    }
  };

  const getUserInitial = (user: User) => {
    if (user.firstName) return user.firstName[0];
    if (user.email) return user.email[0].toUpperCase();
    return '用';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId: string, userEmail: string) => {
    if (confirm(`确定要删除用户 ${userEmail} 吗？此操作不可撤销。`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-kunlun-blue mb-4 font-serif">管理员面板</h2>
          <p className="text-lg text-gray-600">系统管理和数据统计</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总用户数</p>
                  <p className="text-2xl font-bold text-kunlun-blue">
                    {statsLoading ? '-' : stats?.totalUsers || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-kunlun-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">VIP用户</p>
                  <p className="text-2xl font-bold text-kunlun-gold">
                    {statsLoading ? '-' : stats?.vipUsers || 0}
                  </p>
                </div>
                <Crown className="w-8 h-8 text-kunlun-gold" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">管理员</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statsLoading ? '-' : stats?.adminUsers || 0}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">今日调用</p>
                  <p className="text-2xl font-bold text-kunlun-jade">
                    {statsLoading ? '-' : stats?.todayCalls || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-kunlun-jade" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">月收入</p>
                  <p className="text-2xl font-bold text-green-600">
                    ¥{statsLoading ? '-' : stats?.monthlyRevenue || 0}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Model Usage Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-kunlun-blue">AI模型使用统计</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.modelUsage?.map((model, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{model.modelName}</span>
                      <span className="text-sm font-bold text-kunlun-blue">{model.usageCount} 次</span>
                    </div>
                  ))}
                  {(!stats?.modelUsage || stats.modelUsage.length === 0) && (
                    <p className="text-gray-500 text-center py-4">今日暂无使用记录</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-kunlun-blue">7天使用趋势</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.weeklyTrend?.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{day.date}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-kunlun-blue h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (day.count / Math.max(...(stats?.weeklyTrend?.map(d => d.count) || [1]))) * 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-kunlun-blue">{day.count}</span>
                      </div>
                    </div>
                  ))}
                  {(!stats?.weeklyTrend || stats.weeklyTrend.length === 0) && (
                    <p className="text-gray-500 text-center py-4">暂无趋势数据</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-kunlun-blue">用户管理</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kunlun-blue"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>VIP到期</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => {
                    const roleInfo = getRoleDisplay(user.role);
                    const RoleIcon = roleInfo.icon;

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-kunlun-blue text-white">
                                {getUserInitial(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.firstName || user.email?.split('@')[0] || '未知用户'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleInfo.color}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleInfo.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {user.role === 'vip' ? formatDate(user.vipExpiresAt) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={user.role}
                              onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                              disabled={updateRoleMutation.isPending}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">普通用户</SelectItem>
                                <SelectItem value="vip">VIP用户</SelectItem>
                                <SelectItem value="admin">管理员</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.email || '未知')}
                              disabled={deleteUserMutation.isPending}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}