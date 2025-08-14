import { Link, Form, useActionData, redirect } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  Plus,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { Route } from './+types/challenges';
import { makeSSRClient, getAuthUser } from '~/supa-client';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Daily Challenges - Let Go Buddy | Lemore" },
    { name: "description", content: "Build decluttering habits with daily challenges and streak tracking." },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  
  // Check if user is authenticated (with development bypass)
  const { data: { user } } = await getAuthUser(client);
  if (!user) {
    throw redirect('/auth/login?redirect=/let-go-buddy/challenges');
  }

  // Get user's challenges
  const { data: challenges } = await client
    .from('challenge_calendar_items')
    .select(`*`)
    .eq('user_id', user.id)
    .order('scheduled_date', { ascending: false });

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
    if (action === 'complete_item') {
      const reflection = formData.get('reflection') as string;
      
      const { error } = await client
        .from('challenge_calendar_items')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          reflection: reflection || null
        })
        .eq('item_id', parseInt(challengeId));

      if (error) throw error;
      
      return { success: true, message: 'Challenge item completed!' };
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

  const getStatusColor = (completed: boolean) => {
    return completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getDaysFromScheduled = (scheduledDate: string) => {
    const scheduled = new Date(scheduledDate);
    const today = new Date();
    const daysDiff = Math.ceil((today.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff;
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
              const completed = challenge.completed;
              const daysSinceScheduled = getDaysFromScheduled(challenge.scheduled_date);

              return (
                <Card key={challenge.item_id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Challenge Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-pink-100 p-2 rounded-lg">
                          <Calendar className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">
                            {challenge.name || 'Daily Challenge'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Scheduled for {new Date(challenge.scheduled_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(completed)}>
                          {completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>

                      {/* Status Info */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {daysSinceScheduled === 0 && 'Today'}
                          {daysSinceScheduled > 0 && `${daysSinceScheduled} days ago`}
                          {daysSinceScheduled < 0 && `In ${Math.abs(daysSinceScheduled)} days`}
                        </div>
                      </div>

                      {/* Reflection */}
                      {challenge.reflection && (
                        <div className="bg-green-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-green-800">
                            <strong>Reflection:</strong> {challenge.reflection}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      {!completed && (
                        <Form method="post" className="space-y-3">
                          <input type="hidden" name="action" value="complete_item" />
                          <input type="hidden" name="challengeId" value={challenge.item_id.toString()} />
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Reflection (optional):
                            </label>
                            <textarea
                              name="reflection"
                              rows={2}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="How did this challenge go?"
                            />
                          </div>
                          
                          <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Challenge
                          </Button>
                        </Form>
                      )}

                      {completed && (
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-800">
                            Completed!
                          </p>
                          {challenge.completed_at && (
                            <p className="text-xs text-green-600 mt-1">
                              {new Date(challenge.completed_at).toLocaleDateString()}
                            </p>
                          )}
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
            <Calendar className="w-5 h-5 mr-2 text-pink-600" />
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
              <strong>Track Progress:</strong> Reflections help you see patterns and wins
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}