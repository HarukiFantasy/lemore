import { Link, Form, useActionData, redirect, useNavigation } from 'react-router';
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
  ChevronRight,
  Loader2
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
  const navigation = useNavigation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const isSubmitting = navigation.state === 'submitting';

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
    if (viewMode === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
      return days;
    }
    
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
      if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  const getDateRangeText = () => {
    if (viewMode === 'week') {
      const days = getCalendarDays(currentDate);
      const start = days[0];
      const end = days[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
      } else {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
      }
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
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
              <p className="text-xl text-gray-600 mb-6">
                Build consistent decluttering habits with daily goals
              </p>
              
              {/* Challenge Tips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Badge variant="outline" className="w-fit bg-blue-50 border-blue-200 text-blue-700">
                  Start Small: Even 1 item per day builds momentum
                </Badge>
                <Badge variant="outline" className="w-fit bg-green-50 border-green-200 text-green-700">
                  Be Consistent: Daily action beats weekend marathons
                </Badge>
                <Badge variant="outline" className="w-fit bg-purple-50 border-purple-200 text-purple-700">
                  Track Progress: Reflections help you see patterns and wins
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowCalendar(!showCalendar)}
                size="lg" 
                variant={showCalendar ? "default" : "outline"}
                className={showCalendar ? "bg-purple-500 hover:bg-purple-600 text-white" : ""}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {showCalendar ? "List View" : "Calendar View"}
              </Button>
              
              <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white">
                <Link to="/let-go-buddy/new?scenario=C">
                  <Plus className="w-5 h-5 mr-2" />
                  New Challenge
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
          <Card className="p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Task Calendar</h2>
              
              {/* Mobile-first controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                      viewMode === 'week' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                      viewMode === 'month' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Month
                  </button>
                </div>
                
                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => navigateMonth('prev')}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-2 sm:px-4 py-2 font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                    {getDateRangeText()}
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
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center py-1 sm:py-2 font-semibold text-gray-600 text-xs sm:text-sm">
                  {viewMode === 'week' ? day.slice(0, 1) : day.slice(0, 3)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {getCalendarDays(currentDate).map((day, index) => {
                const isCurrentMonth = viewMode === 'week' || day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                const dayTasks = getTasksForDate(day);
                const hasMovingTasks = dayTasks.some(t => t.name.startsWith('📦') || t.name.startsWith('⚡'));
                const hasRegularTasks = dayTasks.some(t => !t.name.startsWith('📦') && !t.name.startsWith('⚡'));
                const completedTasks = dayTasks.filter(t => t.completed).length;
                
                return (
                  <div
                    key={index}
                    className={`
                      ${viewMode === 'week' ? 'min-h-[100px] sm:min-h-[120px]' : 'min-h-[60px] sm:min-h-[80px]'} 
                      p-1 sm:p-2 border rounded-md sm:rounded-lg cursor-pointer transition-colors
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                      ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                      ${dayTasks.length > 0 ? 'hover:bg-gray-50' : ''}
                    `}
                  >
                    <div className={`text-xs sm:text-sm font-medium ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'text-blue-600' : ''} mb-1`}>
                      {day.getDate()}
                    </div>
                    
                    {dayTasks.length > 0 && (
                      <div className="space-y-0.5 sm:space-y-1">
                        {hasMovingTasks && (
                          <div className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-1 rounded truncate">
                            📦 {viewMode === 'week' ? 'Moving' : 'M'} ({dayTasks.filter(t => t.name.startsWith('📦') || t.name.startsWith('⚡')).length})
                          </div>
                        )}
                        {hasRegularTasks && (
                          <div className="text-[10px] sm:text-xs bg-pink-100 text-pink-700 px-1 rounded truncate">
                            🎯 {viewMode === 'week' ? 'Challenge' : 'C'} ({dayTasks.filter(t => !t.name.startsWith('📦') && !t.name.startsWith('⚡')).length})
                          </div>
                        )}
                        {completedTasks > 0 && (
                          <div className="text-[10px] sm:text-xs text-green-600">
                            ✓ {completedTasks}
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Moving Plan Tasks</h2>
                </div>
                <Badge className="bg-purple-100 text-purple-800 self-start sm:self-auto">
                  {movingTasks.filter(t => t.completed).length}/{movingTasks.length} completed
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {movingTasks.map((task) => {
                  const completed = task.completed;
                  const daysSinceScheduled = getDaysFromScheduled(task.scheduled_date);
                  const isOverdue = daysSinceScheduled > 0 && !completed;
                  const isToday = daysSinceScheduled === 0;
                  const isPriority = task.name.startsWith('⚡');

                  return (
                    <Card key={task.item_id} className={`p-3 sm:p-4 ${
                      isPriority ? 'border-orange-300 bg-orange-50' :
                      isOverdue ? 'border-red-300 bg-red-50' :
                      isToday ? 'border-blue-300 bg-blue-50' :
                      completed ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2">
                            <h3 className={`font-medium text-sm sm:text-base ${completed ? 'line-through text-gray-500' : ''}`}>
                              {task.name?.replace(/^(📦|⚡)\s/, '') || 'Moving Task'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isPriority && <Badge variant="destructive" className="text-xs text-white">Priority</Badge>}
                              {isToday && !completed && <Badge className="bg-blue-600 text-white text-xs">Today</Badge>}
                              {isOverdue && <Badge variant="destructive" className="text-xs text-white">Overdue</Badge>}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-2">
                            {isToday ? 'Today' : 
                             daysSinceScheduled > 0 ? `${daysSinceScheduled} days ago` :
                             `In ${Math.abs(daysSinceScheduled)} days`} • 
                            {new Date(task.scheduled_date).toLocaleDateString()}
                          </p>
                          {task.reflection && (
                            <p className="text-xs sm:text-sm text-green-700 mt-2 italic">"{task.reflection}"</p>
                          )}
                          {(task as any).tip && (
                            <div className="text-xs sm:text-sm text-blue-700 mt-2 pl-3 border-l-2 border-blue-300 bg-blue-50 p-2 rounded-r">
                              💡 <strong>Tip:</strong> {(task as any).tip}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
                          {!completed ? (
                            <Form method="post" className="flex items-center gap-2">
                              <input type="hidden" name="action" value="complete_item" />
                              <input type="hidden" name="challengeId" value={task.item_id.toString()} />
                              <Button type="submit" size="sm" className="bg-purple-500 hover:bg-purple-600 text-white" disabled={isSubmitting}>
                                {isSubmitting && navigation.formData?.get('challengeId') === task.item_id.toString() ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                            </Form>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-xs font-medium">Done</span>
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

          {/* Regular Challenges Section */}
          {regularChallenges.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Daily Challenges</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                          
                          {/* Tip */}
                          {(challenge as any).tip && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-4">
                              <p className="text-sm text-blue-800">
                                💡 <strong>Tip:</strong> {(challenge as any).tip}
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
                              
                              <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white" disabled={isSubmitting}>
                                {isSubmitting && navigation.formData?.get('action') === 'complete_challenge' ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Completing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Complete Challenge
                                  </>
                                )}
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
                <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600">
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

      </div>
    </div>
  );
}