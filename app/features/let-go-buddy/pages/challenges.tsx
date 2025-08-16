import { Link, Form, useActionData, redirect } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
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

  // Get user's challenges and moving tasks
  const { data: challenges } = await client
    .from('challenge_calendar_items')
    .select(`*`)
    .eq('user_id', user.id)
    .order('scheduled_date', { ascending: true });

  // Separate challenges from moving tasks (identify by name prefix)
  const regularChallenges = challenges?.filter(c => !c.name.startsWith('📦') && !c.name.startsWith('⚡')) || [];
  const movingTasks = challenges?.filter(c => c.name.startsWith('📦') || c.name.startsWith('⚡')) || [];

  return { 
    user,
    challenges: challenges || [],
    regularChallenges,
    movingTasks
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
  const { challenges, regularChallenges, movingTasks } = loaderData;
  const actionData = useActionData<typeof action>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getStatusColor = (completed: boolean) => {
    return completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getDaysFromScheduled = (scheduledDate: string) => {
    const scheduled = new Date(scheduledDate);
    const today = new Date();
    const daysDiff = Math.ceil((today.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  // Calendar helper functions
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return challenges.filter(task => {
      const taskDate = new Date(task.scheduled_date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
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
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowCalendar(!showCalendar)}
                size="lg" 
                variant={showCalendar ? "default" : "outline"}
                className={showCalendar ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {showCalendar ? "List View" : "Calendar View"}
              </Button>
              
              <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700">
                <Link to="/let-go-buddy/new?scenario=C">
                  <Plus className="w-5 h-5 mr-2" />
                  New Challenge
                </Link>
              </Button>
            </div>
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

        {/* Calendar View */}
        {showCalendar && challenges.length > 0 && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Task Calendar</h2>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => navigateMonth('prev')}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button 
                  onClick={() => navigateMonth('next')}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center py-2 font-semibold text-gray-600 text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays(currentDate).map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                const dayTasks = getTasksForDate(day);
                const hasMovingTasks = dayTasks.some(t => t.name.startsWith('📦') || t.name.startsWith('⚡'));
                const hasRegularTasks = dayTasks.some(t => !t.name.startsWith('📦') && !t.name.startsWith('⚡'));
                const completedTasks = dayTasks.filter(t => t.completed).length;
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                      ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                      ${dayTasks.length > 0 ? 'hover:bg-gray-50' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>
                    
                    {dayTasks.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {hasMovingTasks && (
                          <div className="text-xs bg-purple-100 text-purple-700 px-1 rounded truncate">
                            📦 Moving ({dayTasks.filter(t => t.name.startsWith('📦') || t.name.startsWith('⚡')).length})
                          </div>
                        )}
                        {hasRegularTasks && (
                          <div className="text-xs bg-pink-100 text-pink-700 px-1 rounded truncate">
                            🎯 Challenge ({dayTasks.filter(t => !t.name.startsWith('📦') && !t.name.startsWith('⚡')).length})
                          </div>
                        )}
                        {completedTasks > 0 && (
                          <div className="text-xs text-green-600">
                            ✓ {completedTasks} done
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="space-y-8">
          {/* Moving Tasks Section */}
          {movingTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Moving Plan Tasks</h2>
                <Badge className="bg-purple-100 text-purple-800">
                  {movingTasks.filter(t => t.completed).length}/{movingTasks.length} completed
                </Badge>
              </div>

              <div className="grid gap-4">
                {movingTasks.map((task) => {
                  const completed = task.completed;
                  const daysSinceScheduled = getDaysFromScheduled(task.scheduled_date);
                  const isOverdue = daysSinceScheduled > 0 && !completed;
                  const isToday = daysSinceScheduled === 0;
                  const isPriority = task.name.startsWith('⚡');

                  return (
                    <Card key={task.item_id} className={`p-4 ${
                      isPriority ? 'border-orange-300 bg-orange-50' :
                      isOverdue ? 'border-red-300 bg-red-50' :
                      isToday ? 'border-blue-300 bg-blue-50' :
                      completed ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${completed ? 'line-through text-gray-500' : ''}`}>
                              {task.name?.replace(/^(📦|⚡)\s/, '') || 'Moving Task'}
                            </h3>
                            {isPriority && <Badge variant="destructive" className="text-xs">Priority</Badge>}
                            {isToday && !completed && <Badge className="bg-blue-600 text-xs">Today</Badge>}
                            {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {isToday ? 'Today' : 
                             daysSinceScheduled > 0 ? `${daysSinceScheduled} days ago` :
                             `In ${Math.abs(daysSinceScheduled)} days`} • 
                            {new Date(task.scheduled_date).toLocaleDateString()}
                          </p>
                          {task.reflection && (
                            <p className="text-sm text-green-700 mt-2 italic">"{task.reflection}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!completed ? (
                            <Form method="post" className="flex items-center gap-2">
                              <input type="hidden" name="action" value="complete_item" />
                              <input type="hidden" name="challengeId" value={task.item_id.toString()} />
                              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </Form>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-xs font-medium">Done</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Moving Progress */}
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 mt-6">
                <h3 className="font-semibold mb-2">Moving Progress</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-purple-500 h-3 rounded-full transition-all"
                        style={{ 
                          width: `${(movingTasks.filter(t => t.completed).length / movingTasks.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round((movingTasks.filter(t => t.completed).length / movingTasks.length) * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {movingTasks.filter(t => t.completed).length} of {movingTasks.length} tasks completed
                </p>
              </Card>
            </div>
          )}

          {/* Regular Challenges Section */}
          {regularChallenges.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Daily Challenges</h2>
              <div className="space-y-6">
                {regularChallenges.map((challenge) => {
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
            </div>
          )}

          {/* Empty State */}
          {challenges.length === 0 && (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                No challenges yet
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your first decluttering challenge or create a moving plan to get organized tasks in your calendar.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700">
                  <Link to="/let-go-buddy/new?scenario=C">
                    <Plus className="w-5 h-5 mr-2" />
                    Start Challenge
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/let-go-buddy/new?scenario=B">
                    <Calendar className="w-5 h-5 mr-2" />
                    Moving Assistant
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </div>

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