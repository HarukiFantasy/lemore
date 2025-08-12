import React from 'react';
import { Link, Form, useActionData, redirect } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  Target,
  Trophy,
  Flame,
  Plus,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { Route } from './+types/challenges';
import { makeSSRClient } from '~/supa-client';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Daily Challenges - Let Go Buddy | Lemore" },
    { name: "description", content: "Build decluttering habits with daily challenges and streak tracking." },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  
  // Check if user is authenticated
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    throw redirect('/auth/login?redirect=/let-go-buddy/challenges');
  }

  // Get user's challenges
  const { data: challenges } = await client
    .from('lgb_challenges')
    .select(`
      *,
      lgb_challenge_entries (
        entry_id,
        entry_date,
        items_processed,
        notes
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return { 
    user,
    challenges: challenges || []
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  
  const formData = await request.formData();
  const action = formData.get('action') as string;
  const challengeId = formData.get('challengeId') as string;

  try {
    if (action === 'log_entry') {
      const itemsProcessed = parseInt(formData.get('itemsProcessed') as string) || 0;
      const notes = formData.get('notes') as string;
      
      const { error } = await client
        .from('lgb_challenge_entries')
        .insert({
          challenge_id: challengeId,
          entry_date: new Date().toISOString().split('T')[0],
          items_processed: itemsProcessed,
          notes: notes || null
        });

      if (error) throw error;
      
      return { success: true, message: 'Entry logged successfully!' };
    }

    if (action === 'complete_challenge') {
      const { error } = await client
        .from('lgb_challenges')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('challenge_id', challengeId);

      if (error) throw error;
      
      return { success: true, message: 'Challenge completed!' };
    }

    return { success: true };

  } catch (error) {
    console.error('Challenge action error:', error);
    return {
      error: error instanceof Error ? error.message : 'Action failed',
      action
    };
  }
};

export default function ChallengesPage({ loaderData }: Route.ComponentProps) {
  const { challenges } = loaderData;
  const actionData = useActionData<typeof action>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentStreak = (challenge: any) => {
    if (!challenge.lgb_challenge_entries?.length) return 0;
    
    const entries = challenge.lgb_challenge_entries.sort((a: any, b: any) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    
    for (const entry of entries) {
      const entryDate = new Date(entry.entry_date);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getTotalItemsProcessed = (challenge: any) => {
    return challenge.lgb_challenge_entries?.reduce((sum: number, entry: any) => 
      sum + (entry.items_processed || 0), 0) || 0;
  };

  const getDaysRemaining = (challenge: any) => {
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(startDate.getTime() + (challenge.days * 24 * 60 * 60 * 1000));
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const hasEntryToday = (challenge: any) => {
    const today = new Date().toISOString().split('T')[0];
    return challenge.lgb_challenge_entries?.some((entry: any) => 
      entry.entry_date === today
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/let-go-buddy">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Let Go Buddy
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Daily Challenges
              </h1>
              <p className="text-xl text-gray-600">
                Build consistent decluttering habits with daily goals
              </p>
            </div>
            
            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700">
              <Link to="/let-go-buddy/new?scenario=C">
                <Plus className="w-5 h-5 mr-2" />
                New Challenge
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Success/Error Messages */}
        {actionData?.success && (
          <Card className="p-4 border-green-200 bg-green-50 mb-6">
            <p className="text-green-600 text-sm">{actionData.message}</p>
          </Card>
        )}

        {actionData?.error && (
          <Card className="p-4 border-red-200 bg-red-50 mb-6">
            <p className="text-red-600 text-sm">{actionData.error}</p>
          </Card>
        )}

        {challenges.length === 0 ? (
          // Empty State
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No challenges yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start your first decluttering challenge to build consistent habits. 
              Choose from 7, 14, or 30-day challenges.
            </p>
            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700">
              <Link to="/let-go-buddy/new?scenario=C">
                <Plus className="w-5 h-5 mr-2" />
                Start Your First Challenge
              </Link>
            </Button>
          </Card>
        ) : (
          // Challenges List
          <div className="space-y-6">
            {challenges.map((challenge) => {
              const streak = getCurrentStreak(challenge);
              const totalItems = getTotalItemsProcessed(challenge);
              const daysLeft = getDaysRemaining(challenge);
              const hasToday = hasEntryToday(challenge);
              const completionRate = challenge.lgb_challenge_entries?.length || 0;

              return (
                <Card key={challenge.challenge_id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Challenge Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-pink-100 p-2 rounded-lg">
                          <Calendar className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">
                            {challenge.days}-Day Declutter Challenge
                          </h3>
                          <p className="text-gray-600">
                            Started {new Date(challenge.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(challenge.status)}>
                          {challenge.status}
                        </Badge>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Flame className="w-5 h-5 text-orange-500 mr-1" />
                            <span className="text-2xl font-bold">{streak}</span>
                          </div>
                          <span className="text-sm text-gray-600">Day Streak</span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Target className="w-5 h-5 text-blue-500 mr-1" />
                            <span className="text-2xl font-bold">{totalItems}</span>
                          </div>
                          <span className="text-sm text-gray-600">Items Processed</span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Clock className="w-5 h-5 text-purple-500 mr-1" />
                            <span className="text-2xl font-bold">{daysLeft}</span>
                          </div>
                          <span className="text-sm text-gray-600">Days Left</span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Trophy className="w-5 h-5 text-yellow-500 mr-1" />
                            <span className="text-2xl font-bold">{completionRate}</span>
                          </div>
                          <span className="text-sm text-gray-600">Entries</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (completionRate / challenge.days) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      {challenge.status === 'active' && !hasToday && (
                        <Form method="post" className="space-y-3">
                          <input type="hidden" name="action" value="log_entry" />
                          <input type="hidden" name="challengeId" value={challenge.challenge_id} />
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Items processed today:
                            </label>
                            <input
                              type="number"
                              name="itemsProcessed"
                              min="0"
                              defaultValue="1"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Notes (optional):
                            </label>
                            <textarea
                              name="notes"
                              rows={2}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="What did you declutter today?"
                            />
                          </div>
                          
                          <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Log Today's Progress
                          </Button>
                        </Form>
                      )}

                      {challenge.status === 'active' && hasToday && (
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-800">
                            Today's entry logged!
                          </p>
                        </div>
                      )}

                      {challenge.status === 'active' && daysLeft === 0 && (
                        <Form method="post">
                          <input type="hidden" name="action" value="complete_challenge" />
                          <input type="hidden" name="challengeId" value={challenge.challenge_id} />
                          <Button type="submit" variant="outline" className="w-full">
                            <Trophy className="w-4 h-4 mr-2" />
                            Complete Challenge
                          </Button>
                        </Form>
                      )}

                      {challenge.status === 'completed' && (
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-yellow-800">
                            Challenge Completed!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tips Section */}
        <Card className="p-6 mt-8 bg-gradient-to-r from-pink-50 to-purple-50">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-pink-600" />
            Challenge Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <strong>Start Small:</strong> Even 1 item per day builds momentum
            </div>
            <div>
              <strong>Be Consistent:</strong> Daily action beats weekend marathons
            </div>
            <div>
              <strong>Track Progress:</strong> Notes help you see patterns and wins
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}