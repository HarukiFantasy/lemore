import { Link } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { 
  Sparkles, 
  Heart, 
  Calendar, 
  Package,
  Zap,
  Users,
  ArrowRight,
  Target,
  Lock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Route } from './+types/index';
import { makeSSRClient, getAuthUser } from '~/supa-client';
import { getAIUsageCount } from '../utils/aiUsage';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Let Go Buddy - AI Decluttering Assistant | Lemore" },
    { name: "description", content: "Your AI companion for mindful decluttering. Get smart guidance on what to keep, sell, donate, or dispose of." },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  
  // Check if user is authenticated (with development bypass)
  const { data: { user } } = await getAuthUser(client).catch(() => ({ data: { user: null } }));
  
  let userSessions = null;
  let canCreateNewSession = { allowed: true, active_count: 0, limit: 2 };
  let aiUsage = null;
  
  if (user) {
    try {
      // Get user's recent sessions with plan counts for Moving Assistant
      const { data: sessions } = await client
        .from('view_session_dashboard')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      const { data: directSessions } = await client
        .from('lgb_sessions')
        .select('session_id, ai_plan_generated, ai_plan_generated_at, title, scenario')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
  
      
      userSessions = sessions || [];
      
      // Check session limits
      const { data: limitCheck } = await client
        .rpc('rpc_can_open_new_session');
      
      if (limitCheck && typeof limitCheck === 'object' && 'allowed' in limitCheck) {
        canCreateNewSession = limitCheck as { allowed: boolean; active_count: number; limit: number; };
      }
      
      // Check AI usage limits for browser-based usage tracking
      // Note: This requires browserClient, so we'll pass user ID to component for client-side check
      aiUsage = { userId: user.id };
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }
  
  return { 
    user,
    userSessions,
    canCreateNewSession,
    aiUsage
  };
};

export default function LetGoBuddyIndex({ loaderData }: Route.ComponentProps) {
  const { user, userSessions, canCreateNewSession, aiUsage } = loaderData;
  const [aiUsageData, setAiUsageData] = useState<{ canUse: boolean; total: number; maxFree: number } | null>(null);
  
  // Check AI usage limits on component mount
  useEffect(() => {
    if (user && aiUsage?.userId) {
      getAIUsageCount(aiUsage.userId).then(usage => {
        setAiUsageData({
          canUse: usage.canUse,
          total: usage.total,
          maxFree: usage.maxFree
        });
      });
    }
  }, [user, aiUsage]);

  const scenarios = [
    {
      id: 'A',
      title: 'Keep vs Sell Helper',
      description: 'Get AI guidance on whether to keep, sell, donate, or dispose of your items',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-green-500',
      features: ['Photo analysis', 'Smart recommendations', 'Price suggestions'],
    },
    {
      id: 'E',
      title: 'Quick Listing Generator',
      description: 'Create marketplace-ready listings in English quickly',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-blue-500',
      features: ['AI listing copy', 'Professional tone', 'Copy & paste ready'],
    },
    {
      id: 'B',
      title: 'Moving Assistant',
      description: 'Plan your move or departure with week-by-week action plans',
      icon: <Target className="w-6 h-6 " />,
      color: 'bg-orange-500',
      features: ['Timeline planning', 'Multi-channel posting', 'Translation help'],
    }
  ];

  const getCompletionPercentage = (session: any) => {
    if (session.item_count === 0) return 0;
    
    return Math.round((session.decided_count / session.item_count) * 100);
  };

  const getStatusBadge = (status: string, completion: number) => {
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (status === 'archived') {
      return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
    }
    if (completion > 0) {
      return <Badge className="bg-blue-100 text-blue-800">{completion}% Done</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Started</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/searchbar_bg2.png" 
            alt="Let Go Buddy Background" 
            className="w-full h-full object-cover opacity-70"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-white/50"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100/80 backdrop-blur-sm rounded-full text-purple-700 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Decluttering Assistant
          </div>
          
          {/* Main Heading */}
          <div className="relative">
            {/* Subtle background accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10 blur-2xl transform scale-110 opacity-50"></div>
            
            <h1 
              className="relative text-2xl sm:text-3xl md:text-5xl font-light leading-[1.1] tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span className="inline font-normal text-transparent bg-clip-text bg-gradient-to-br from-stone-800 via-stone-700 to-stone-800">Let Go with Confidence, </span>
              <br />
              <span className="inline font-light bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                Live Lighter
              </span>
              <br />
            </h1>
            
            {/* Subtle underline accent */}
            <div className="mx-auto mt-3 w-20 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-50"></div>
          </div>

          {user && (
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-stone-800 hover:bg-stone-700 text-white px-8 py-3 rounded-full"
                  disabled={!canCreateNewSession.allowed}
                >
                  <Link to="/let-go-buddy/new">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start New Session
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full border-stone-300 text-stone-700 hover:bg-stone-50">
                  <Link to="/let-go-buddy/challenges">
                    <Calendar className="w-5 h-5 mr-2" />
                    Daily Challenges
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {!user && (
            <div className="pt-4">
              <Button asChild size="lg" className="bg-stone-800 hover:bg-stone-700 text-white px-8 py-3 rounded-full">
                <Link to="/auth/join">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <p className="text-sm text-stone-500 mt-2">
                No credit card required • 2 free sessions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Sessions */}
      {user && userSessions && userSessions.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Recent Sessions</h2>
            <p className="text-gray-600">Pick up where you left off</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {userSessions.map((session: any) => {
              const completion = getCompletionPercentage(session);
              const scenario = scenarios.find(s => s.id === session.scenario);
              
              return (
                <Card key={session.session_id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${scenario?.color || 'bg-gray-500'}`}>
                      {scenario?.icon || <Package className="w-6 h-6 text-white" />}
                    </div>
                    {getStatusBadge(session.status, completion)}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">
                    {session.title || scenario?.title || 'Untitled Session'}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {session.scenario === 'B' ? (
                      // Moving Assistant specific display
                      <>
                        <div className="flex justify-between">
                          <span>Tasks:</span>
                          <span>{session.item_count || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span>{session.decided_count || 0}/{session.item_count || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Move Date:</span>
                          <span className="font-medium text-blue-600">
                            {session.move_date ? new Date(session.move_date).toLocaleDateString() : 'Not set'}
                          </span>
                        </div>
                      </>
                    ) : (
                      // Other scenarios display
                      <>
                        <div className="flex justify-between">
                          <span>Items:</span>
                          <span>{session.item_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Decided:</span>
                          <span>{session.decided_count}/{session.item_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected:</span>
                          <span className="font-medium text-green-600">
                            ${session.expected_revenue ? session.expected_revenue.toFixed(0) : '0'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  
                  <Button asChild variant="outline" className="w-full `bg-teal-50 text-teal-600 hover:bg-teal-400 hover:text-teal-50 ">
                    <Link to={`/let-go-buddy/session/${session.session_id}`}>
                      {session.status === 'completed' ? 'Session Completed' : 'Continue Session'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Scenarios */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Approach</h2>
          <p className="text-xl text-gray-600">Different scenarios for different needs</p>
          {user && aiUsageData && !aiUsageData.canUse && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-amber-800">
                <Lock className="w-5 h-5" />
                <span className="font-medium">
                  AI Analysis Limit Reached ({aiUsageData.total}/{aiUsageData.maxFree})
                </span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                You've used all your free AI analyses. You can still create sessions and make manual decisions.
              </p>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 ${
          user && aiUsageData && !aiUsageData.canUse ? 'opacity-50' : ''
        }`}>
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className={`p-6 transition-all duration-300 group ${
              user && aiUsageData && !aiUsageData.canUse 
                ? 'bg-gray-50 cursor-not-allowed' 
                : 'hover:shadow-xl'
            }`}>
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-lg ${
                  user && aiUsageData && !aiUsageData.canUse 
                    ? 'bg-gray-400' 
                    : scenario.color
                }`}>
                  <div className="text-white">
                    {user && aiUsageData && !aiUsageData.canUse ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      scenario.icon
                    )}
                  </div>
                </div>
              </div>
              
              <h3 className={`text-xl font-semibold mb-2 ${
                user && aiUsageData && !aiUsageData.canUse ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {scenario.title}
              </h3>
              
              <p className={`mb-4 leading-relaxed ${
                user && aiUsageData && !aiUsageData.canUse ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {scenario.description}
              </p>

              <div className="space-y-2 mb-6">
                {scenario.features.map((feature, index) => (
                  <div key={index} className={`flex items-center text-sm ${
                    user && aiUsageData && !aiUsageData.canUse ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                      user && aiUsageData && !aiUsageData.canUse ? 'bg-gray-400' : 'bg-green-500'
                    }`} />
                    {feature}
                  </div>
                ))}
              </div>

              <Button 
                asChild 
                variant="outline"
                className={`bg-teal-50 text-teal-600 hover:bg-teal-400 hover:text-teal-50 w-full transition-transform ${
                  user && aiUsageData && !aiUsageData.canUse 
                    ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed pointer-events-none' 
                    : 'group-hover:scale-105'
                }`}
                disabled={user && (!canCreateNewSession.allowed || (aiUsageData && !aiUsageData.canUse))}
              >
                <Link to={user && aiUsageData && !aiUsageData.canUse ? '#' : `/let-go-buddy/new?scenario=${scenario.id}`}>
                  {user && aiUsageData && !aiUsageData.canUse ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      AI Limit Reached
                    </>
                  ) : (
                    <>
                      Start {scenario.title}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Let Go Buddy?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">Smart analysis of your items with personalized recommendations</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600">Connect with others and find new homes for your items</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Goal Focused</h3>
              <p className="text-gray-600">Structured approach to achieve your decluttering goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}