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
  Clock,
  Target
} from 'lucide-react';
import type { Route } from './+types/index';
import { makeSSRClient, getAuthUser } from '~/supa-client';

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
  
  if (user) {
    try {
      // Get user's recent sessions
      const { data: sessions } = await client
        .from('view_session_dashboard')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      userSessions = sessions || [];
      
      // Check session limits
      const { data: limitCheck } = await client
        .rpc('rpc_can_open_new_session');
      
      if (limitCheck && typeof limitCheck === 'object' && 'allowed' in limitCheck) {
        canCreateNewSession = limitCheck as { allowed: boolean; active_count: number; limit: number; };
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }
  
  return { 
    user,
    userSessions,
    canCreateNewSession
  };
};

export default function LetGoBuddyIndex({ loaderData }: Route.ComponentProps) {
  const { user, userSessions, canCreateNewSession } = loaderData;

  const scenarios = [
    {
      id: 'A',
      title: 'Keep vs Sell Helper',
      description: 'Get AI guidance on whether to keep, sell, donate, or dispose of your items',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-green-500',
      features: ['Photo analysis', 'Smart recommendations', 'Price suggestions'],
      time: '5-10 min per item'
    },
    {
      id: 'E',
      title: 'Quick Listing Generator',
      description: 'Create marketplace-ready listings in English and Korean',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-blue-500',
      features: ['AI listing copy', 'Multi-language', 'Copy & paste ready'],
      time: '2-3 min per item'
    },
    {
      id: 'D',
      title: 'Category Focus',
      description: 'Declutter specific categories like closets, books, or kitchen items',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-purple-500',
      features: ['Batch processing', 'Category tips', 'Bundle suggestions'],
      time: '10-20 min per session'
    },
    {
      id: 'B',
      title: 'Moving Assistant',
      description: 'Plan your move or departure with week-by-week action plans',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-orange-500',
      features: ['Timeline planning', 'Multi-channel posting', 'Translation help'],
      time: '20-30 min setup'
    },
    {
      id: 'C',
      title: 'Declutter Challenge',
      description: 'Daily habits to gradually declutter with streak tracking',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-pink-500',
      features: ['Daily missions', 'Streak rewards', 'Progress tracking'],
      time: '5 min daily'
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Decluttering Assistant
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Let Go with Confidence,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Live Lighter
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Get smart, personalized guidance on what to keep, sell, donate, or dispose of. 
              Turn decluttering from overwhelming to empowering.
            </p>

            {user && (
              <div className="space-y-6 pt-4">
                {/* Session Explanation */}
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What is a Decluttering Session?</h3>
                    <p className="text-gray-600 mb-4">
                      A session helps you organize one specific area or life transition. Upload photos of items, 
                      get AI recommendations, and make smart decisions about what to keep, sell, donate, or dispose of.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-600" />
                        <span>Upload item photos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Get AI recommendations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-purple-600" />
                        <span>Make informed decisions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span>Track your progress</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                    disabled={!canCreateNewSession.allowed}
                  >
                    <Link to="/let-go-buddy/new">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start New Session
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
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
                <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                  <Link to="/auth/join">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  No credit card required • 2 free sessions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Sessions */}
      {user && userSessions && userSessions.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Recent Sessions</h2>
            <p className="text-gray-600">Pick up where you left off</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span>{session.item_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Decided:</span>
                      <span>{session.decided_count}/{session.item_count}</span>
                    </div>
                    {session.expected_revenue > 0 && (
                      <div className="flex justify-between">
                        <span>Expected:</span>
                        <span className="font-medium text-green-600">
                          ${session.expected_revenue.toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {completion > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  )}
                  
                  <Button asChild className="w-full">
                    <Link to={`/let-go-buddy/session/${session.session_id}`}>
                      Continue Session
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              Active sessions: {canCreateNewSession.active_count}/{canCreateNewSession.limit} 
              {!canCreateNewSession.allowed && " (limit reached)"}
            </p>
          </div>
        </div>
      )}

      {/* Scenarios */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Approach</h2>
          <p className="text-xl text-gray-600">Different scenarios for different needs</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${scenario.color} mr-4`}>
                  <div className="text-white">
                    {scenario.icon}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {scenario.time}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {scenario.title}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {scenario.description}
              </p>

              <div className="space-y-2 mb-6">
                {scenario.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                    {feature}
                  </div>
                ))}
              </div>

              <Button 
                asChild 
                className="w-full group-hover:scale-105 transition-transform"
                disabled={user && !canCreateNewSession.allowed}
              >
                <Link to={`/let-go-buddy/new?scenario=${scenario.id}`}>
                  Start {scenario.title}
                  <ArrowRight className="w-4 h-4 ml-2" />
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

          <div className="grid md:grid-cols-3 gap-8">
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