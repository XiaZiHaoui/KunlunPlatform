import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mountain, Sparkles, Crown, Shield, Zap, Code, Palette, Brain } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b-2 border-kunlun-bronze">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Mountain className="w-10 h-10 text-kunlun-blue" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-kunlun-blue font-serif">昆仑</h1>
                <span className="text-xs text-gray-500">AI智能平台</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#models" className="text-gray-700 hover:text-kunlun-blue transition-colors">AI模型</a>
              <a href="#pricing" className="text-gray-700 hover:text-kunlun-blue transition-colors">会员服务</a>
              <a href="#about" className="text-gray-700 hover:text-kunlun-blue transition-colors">关于我们</a>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-kunlun-blue hover:bg-blue-800 text-white"
              >
                立即登录
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-96 bg-kunlun-blue bg-kunlun-pattern">
        <div className="absolute inset-0 bg-gradient-to-r from-kunlun-blue/90 to-kunlun-blue/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-center w-full">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-serif">
              驾驭AI之力，探索<span className="text-kunlun-gold">无限可能</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              汇聚全球顶尖AI大模型，为您提供智能化解决方案。从文本生成到图像创作，昆仑平台助您开启AI新纪元。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-kunlun-gold hover:bg-yellow-500 text-kunlun-blue font-semibold px-8 py-3 text-lg"
                size="lg"
              >
                立即开始体验
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-kunlun-blue font-semibold px-8 py-3 text-lg"
                size="lg"
              >
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section id="models" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-kunlun-blue mb-4 font-serif">精选AI模型</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">汇聚全球领先的AI大模型，满足您的多样化需求</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* GPT-4 Model Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-kunlun-bronze">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-12 h-12 text-kunlun-blue" />
                    <div>
                      <h3 className="text-xl font-bold text-kunlun-blue">龙神GPT-4</h3>
                      <span className="text-sm text-gray-500">OpenAI</span>
                    </div>
                  </div>
                  <Badge className="bg-kunlun-gold/20 text-kunlun-bronze">热门</Badge>
                </div>
                <p className="text-gray-600 mb-4">最强大的语言理解与生成模型，擅长复杂推理、创意写作和代码生成</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span>精度: </span><span className="text-kunlun-blue font-semibold">95%</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>速度: </span><span className="text-kunlun-jade font-semibold">快速</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Claude Model Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-kunlun-bronze">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-12 h-12 text-kunlun-jade" />
                    <div>
                      <h3 className="text-xl font-bold text-kunlun-blue">凤凰Claude</h3>
                      <span className="text-sm text-gray-500">Anthropic</span>
                    </div>
                  </div>
                  <Badge className="bg-kunlun-jade/20 text-kunlun-jade">安全</Badge>
                </div>
                <p className="text-gray-600 mb-4">注重安全性和有用性的AI助手，擅长深度分析、学术研究和安全对话</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span>精度: </span><span className="text-kunlun-blue font-semibold">93%</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>速度: </span><span className="text-kunlun-jade font-semibold">中等</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gemini Model Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-kunlun-bronze">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-12 h-12 text-blue-600" />
                    <div>
                      <h3 className="text-xl font-bold text-kunlun-blue">麒麟Gemini</h3>
                      <span className="text-sm text-gray-500">Google</span>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">多模态</Badge>
                </div>
                <p className="text-gray-600 mb-4">支持文本、图像、音频多模态处理的先进AI模型，适合综合性任务处理</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span>精度: </span><span className="text-kunlun-blue font-semibold">91%</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>速度: </span><span className="text-kunlun-jade font-semibold">快速</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DALL-E Model Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-kunlun-bronze">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Palette className="w-12 h-12 text-purple-600" />
                    <div>
                      <h3 className="text-xl font-bold text-kunlun-blue">神笔DALL-E</h3>
                      <span className="text-sm text-gray-500">OpenAI</span>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">图像生成</Badge>
                </div>
                <p className="text-gray-600 mb-4">革命性的文本到图像生成模型，能够创造出惊人的艺术作品和概念图像</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span>精度: </span><span className="text-kunlun-blue font-semibold">88%</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>速度: </span><span className="text-yellow-600 font-semibold">中等</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Midjourney Model Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-kunlun-bronze">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Mountain className="w-12 h-12 text-pink-600" />
                    <div>
                      <h3 className="text-xl font-bold text-kunlun-blue">幻境Midjourney</h3>
                      <span className="text-sm text-gray-500">Midjourney</span>
                    </div>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800">艺术创作</Badge>
                </div>
                <p className="text-gray-600 mb-4">专业级艺术图像生成工具，特别擅长创造富有想象力的艺术作品</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span>精度: </span><span className="text-kunlun-blue font-semibold">92%</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>速度: </span><span className="text-yellow-600 font-semibold">较慢</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Model Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-kunlun-bronze">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Code className="w-12 h-12 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-kunlun-blue">文曲星CodeX</h3>
                      <span className="text-sm text-gray-500">OpenAI</span>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">代码专用</Badge>
                </div>
                <p className="text-gray-600 mb-4">专门优化的代码生成和理解模型，支持多种编程语言和框架</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span>精度: </span><span className="text-kunlun-blue font-semibold">96%</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>速度: </span><span className="text-kunlun-jade font-semibold">极快</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-kunlun-blue mb-4 font-serif">会员服务</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">选择适合您的服务套餐，解锁更多AI功能</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">普通用户</h3>
                <div className="text-4xl font-bold text-gray-600 mb-6">免费</div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-green-500 mr-3" />
                    每日10次免费调用
                  </li>
                  <li className="flex items-center">
                    <Brain className="w-5 h-5 text-green-500 mr-3" />
                    基础AI模型访问
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-green-500 mr-3" />
                    社区支持
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  variant="outline" 
                  className="w-full"
                >
                  免费使用
                </Button>
              </CardContent>
            </Card>

            {/* VIP Tier (Highlighted) */}
            <Card className="bg-gradient-to-br from-kunlun-gold to-yellow-400 border-2 border-kunlun-bronze transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-kunlun-red text-white">推荐</Badge>
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-kunlun-blue mb-2">VIP会员</h3>
                <div className="text-4xl font-bold text-kunlun-blue mb-1">¥20</div>
                <div className="text-kunlun-blue opacity-80 mb-6">每月</div>
                <ul className="text-left space-y-3 mb-8 text-kunlun-blue">
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-kunlun-blue mr-3" />
                    无限次数调用
                  </li>
                  <li className="flex items-center">
                    <Brain className="w-5 h-5 text-kunlun-blue mr-3" />
                    所有AI模型访问
                  </li>
                  <li className="flex items-center">
                    <Crown className="w-5 h-5 text-kunlun-blue mr-3" />
                    优先处理速度
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-kunlun-blue mr-3" />
                    专属客服支持
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-kunlun-blue hover:bg-blue-800 text-white"
                >
                  立即升级
                </Button>
              </CardContent>
            </Card>

            {/* Admin Tier */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">管理员</h3>
                <div className="text-4xl font-bold text-gray-600 mb-6">企业级</div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <Crown className="w-5 h-5 text-green-500 mr-3" />
                    全部VIP功能
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-green-500 mr-3" />
                    用户管理权限
                  </li>
                  <li className="flex items-center">
                    <Brain className="w-5 h-5 text-green-500 mr-3" />
                    数据统计分析
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-green-500 mr-3" />
                    系统配置管理
                  </li>
                </ul>
                <Button variant="secondary" className="w-full">
                  联系我们
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-kunlun-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="w-8 h-8" />
                <h3 className="text-xl font-bold font-serif">昆仑</h3>
              </div>
              <p className="text-gray-300 text-sm">
                探索AI的无限可能，开启智能化新时代。昆仑平台致力于为用户提供最优质的人工智能服务。
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">产品服务</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">AI模型</a></li>
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">API接口</a></li>
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">开发工具</a></li>
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">技术文档</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">支持帮助</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">使用指南</a></li>
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">常见问题</a></li>
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">联系客服</a></li>
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">意见反馈</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">关于我们</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">公司简介</a></li>
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">服务条款</a></li>
                <li><a href="#" className="hover:text-kunlun-gold transition-colors">加入我们</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">© 2024 昆仑AI平台. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
