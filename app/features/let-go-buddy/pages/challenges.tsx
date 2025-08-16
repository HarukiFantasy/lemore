import { Link, Form, useActionData, redirect, useNavigation } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  Plus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useState, useMemo, memo, useCallback } from 'react';
import type { Route } from './+types/challenges';
import { makeSSRClient, getAuthUser } from '~/supa-client';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Challenges - Let Go Buddy | Lemore" },
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

  // Get only relevant challenges (limit to recent and upcoming)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const sixtyDaysAhead = new Date(today);
  sixtyDaysAhead.setDate(today.getDate() + 60);

  // Query unified lgb_items table for both Moving tasks and regular challenges
  const { data: challenges } = await client
    .from('lgb_items')
    .select(`
      item_id, 
      session_id,
      title,
      scheduled_date, 
      completed, 
      completed_at, 
      reflection,
      tip,
      lgb_sessions!inner(user_id, scenario)
    `)
    .eq('lgb_sessions.user_id', user.id)
    .not('scheduled_date', 'is', null) // Only items with scheduled dates (calendar items)
    .gte('scheduled_date', thirtyDaysAgo.toISOString())
    .lte('scheduled_date', sixtyDaysAhead.toISOString())
    .order('scheduled_date', { ascending: true });

  // Separate challenges from moving tasks (identify by scenario type)
  const regularChallenges = challenges?.filter(c => c.lgb_sessions.scenario !== 'B') || [];
  const movingTasks = challenges?.filter(c => c.lgb_sessions.scenario === 'B') || [];

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
        .from('lgb_items')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          reflection: reflection || null,
          updated_at: new Date().toISOString()
        })
        .eq('item_id', challengeId); // item_id is UUID in lgb_items, not integer

      if (error) throw error;
      
      return { success: true, message: 'Task completed!' };
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

// Memoized task card component
const TaskCard = memo(({ task, isSubmitting, navigation, getDaysFromScheduled }: any) => {
  const completed = task.completed;
  const daysSinceScheduled = getDaysFromScheduled(task.scheduled_date);
  const isOverdue = daysSinceScheduled > 0 && !completed;
  const isToday = daysSinceScheduled === 0;
  const isPriority = task.title.startsWith('⚡');

  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      completed ? 'border-emerald-200 bg-emerald-50/50' :
      isPriority ? 'border-orange-200 bg-orange-50/50' :
      isOverdue ? 'border-red-200 bg-red-50/50' :
      isToday ? 'border-blue-200 bg-blue-50/50' :
      'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-sm ${completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title?.replace(/^(📦|⚡)\s/, '') || 'Moving Task'}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {isPriority && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                  ⚡ Priority
                </span>
              )}
              {isToday && !completed && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                  Today
                </span>
              )}
              {isOverdue && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                  Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {new Date(task.scheduled_date).toLocaleDateString()}
            </p>
          </div>
          
          {!completed ? (
            <Form method="post">
              <input type="hidden" name="action" value="complete_item" />
              <input type="hidden" name="challengeId" value={task.item_id.toString()} />
              <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-emerald-100" disabled={isSubmitting}>
                {isSubmitting && navigation.formData?.get('challengeId') === task.item_id.toString() ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-gray-400 hover:text-emerald-600" />
                )}
              </Button>
            </Form>
          ) : (
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
        </div>
        
        {task.reflection && (
          <div className="text-xs text-emerald-700 italic bg-emerald-50 p-2 rounded-lg">
            "{task.reflection}"
          </div>
        )}
        
        {(task as any).tip && (
          <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg border-l-2 border-blue-300">
            💡 {(task as any).tip}
          </div>
        )}
      </div>
    </div>
  );
});

export default function ChallengesPage({ loaderData }: Route.ComponentProps) {
  const { challenges, regularChallenges, movingTasks } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const isSubmitting = navigation.state === 'submitting';


  const getDaysFromScheduled = useCallback((scheduledDate: string) => {
    const scheduled = new Date(scheduledDate);
    const today = new Date();
    const daysDiff = Math.ceil((today.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff;
  }, []);

  // Memoize expensive computations
  const weeklyTasks = useMemo(() => {
    const today = new Date();
    const weeks: { [key: string]: typeof movingTasks } = {};
    
    movingTasks.forEach(task => {
      const taskDate = new Date(task.scheduled_date!);
      const daysDiff = Math.floor((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let weekKey;
      if (daysDiff < -7) {
        weekKey = 'past';
      } else if (daysDiff < 0) {
        weekKey = 'thisWeek';
      } else if (daysDiff < 7) {
        weekKey = 'nextWeek';
      } else {
        weekKey = 'future';
      }
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(task);
    });
    
    return weeks;
  }, [movingTasks]);
  
  const getWeekTitle = useCallback((weekKey: string) => {
    switch (weekKey) {
      case 'past': return 'Past Due';
      case 'thisWeek': return 'This Week';
      case 'nextWeek': return 'Next Week';
      case 'future': return 'Future';
      default: return 'Other';
    }
  }, []);

  // Calendar helper functions - memoized
  const getCalendarDays = useCallback((date: Date) => {
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
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  }, [viewMode]);

  const getTasksForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return challenges.filter(task => {
      const taskDate = new Date(task.scheduled_date!).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  }, [challenges]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  }, [viewMode]);

  const getDateRangeText = useMemo(() => {
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
      
      const start = days[0];
      const end = days[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
      } else {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
      }
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate, viewMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Button variant="ghost" asChild className="mb-6 text-gray-600 hover:text-gray-900">
            <Link to="/let-go-buddy">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Let Go Buddy
            </Link>
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-light text-gray-900 tracking-tight">
                Challenges
              </h1>
              <p className="text-lg text-gray-600 font-light max-w-2xl">
                Build consistent decluttering habits with daily goals and organized moving tasks
              </p>
              
              {/* Challenge Tips */}
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200/50">
                  🌱 Start Small: Even 1 item per day builds momentum
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200/50">
                  🔄 Be Consistent: Daily action beats weekend marathons
                </div>
                <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200/50">
                  📊 Track Progress: Reflections help you see patterns
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-lg font-medium">
                <Link to="/let-go-buddy/new?scenario=C">
                  <Plus className="w-4 h-4 mr-2" />
                  New Challenge
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
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

        {/* Calendar Section */}
        {challenges.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-light text-gray-900">Calendar Overview</h2>
                
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex rounded-lg bg-gray-100 p-1">
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        viewMode === 'week' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setViewMode('month')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        viewMode === 'month' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Month
                    </button>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => navigateMonth('prev')}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 font-medium text-gray-900 text-sm min-w-[140px] text-center">
                      {getDateRangeText}
                    </span>
                    <Button 
                      onClick={() => navigateMonth('next')}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-gray-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center py-3 font-medium text-gray-500 text-sm">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {useMemo(() => getCalendarDays(currentDate), [currentDate, getCalendarDays]).map((day, index) => {
                  const isCurrentMonth = viewMode === 'week' || day.getMonth() === currentDate.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dayTasks = getTasksForDate(day);
                  const hasMovingTasks = dayTasks.some(t => t.lgb_sessions.scenario === 'B');
                  const hasRegularTasks = dayTasks.some(t => t.lgb_sessions.scenario !== 'B');
                  const completedTasks = dayTasks.filter(t => t.completed).length;
                  
                  return (
                    <div
                      key={index}
                      className={`
                        ${viewMode === 'week' ? 'min-h-[120px]' : 'min-h-[80px]'} 
                        p-3 rounded-xl transition-all hover:bg-gray-50 cursor-pointer
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}
                        ${isToday ? 'bg-emerald-50 border-2 border-emerald-200' : 'border border-gray-100'}
                      `}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-emerald-700' : ''}`}>
                        {day.getDate()}
                      </div>
                      
                      {dayTasks.length > 0 && (
                        <div className="space-y-1">
                          {hasMovingTasks && (
                            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                              📦 Moving ({dayTasks.filter(t => t.lgb_sessions.scenario === 'B').length})
                            </div>
                          )}
                          {hasRegularTasks && (
                            <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-medium">
                              🎯 Challenges ({dayTasks.filter(t => t.lgb_sessions.scenario !== 'B').length})
                            </div>
                          )}
                          {completedTasks > 0 && (
                            <div className="text-xs text-gray-600 font-medium">
                              ✓ {completedTasks} completed
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-12">
          {/* Moving Tasks Section */}
          {movingTasks.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-gray-900">Moving Plan</h2>
                    <p className="text-gray-600 font-light">Organized by timeline</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200/50">
                  {movingTasks.filter(t => t.completed).length}/{movingTasks.length} completed
                </div>
              </div>

              {Object.entries(weeklyTasks).map(([weekKey, tasks]) => (
                <div key={weekKey} className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{getWeekTitle(weekKey)}</h3>
                      <div className="text-sm text-gray-500 font-medium">
                        {tasks.filter(t => t.completed).length} of {tasks.length} completed
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                      <TaskCard 
                        key={task.item_id}
                        task={task}
                        isSubmitting={isSubmitting}
                        navigation={navigation}
                        getDaysFromScheduled={getDaysFromScheduled}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regular Challenges Section */}
          {regularChallenges.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <Calendar className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-light text-gray-900">Daily Challenges</h2>
                      <p className="text-gray-600 font-light">Build consistent habits</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200/50">
                    {regularChallenges.filter(c => c.completed).length}/{regularChallenges.length} completed
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {regularChallenges.map((challenge) => {
                  const completed = challenge.completed;
                  const daysSinceScheduled = getDaysFromScheduled(challenge.scheduled_date!);
                  const isOverdue = daysSinceScheduled > 0 && !completed;
                  const isToday = daysSinceScheduled === 0;

                  return (
                    <Card key={challenge.item_id} className={`p-3 sm:p-4 ${
                      isOverdue ? 'border-red-200 bg-red-50' :
                      isToday ? 'border-blue-200 bg-blue-50' :
                      completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2">
                            <h3 className={`font-medium text-sm sm:text-base line-clamp-2 ${completed ? 'line-through text-gray-500' : ''}`}>
                              {challenge.title || 'Daily Challenge'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isToday && !completed && <Badge variant="outline" className="text-teal-700 text-xs bg-teal-200">Today</Badge>}
                              {isOverdue && <Badge variant="outline" className="text-xs text-red-600 bg-red-200">Overdue</Badge>}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-2">
                            {isToday ? 'Today' : 
                             daysSinceScheduled > 0 ? `${daysSinceScheduled} days ago` :
                             `In ${Math.abs(daysSinceScheduled)} days`} • 
                            {new Date(challenge.scheduled_date!).toLocaleDateString()}
                          </p>
                          {challenge.reflection && (
                            <p className="text-xs sm:text-sm text-green-700 mt-2 italic">\"{challenge.reflection}\"</p>
                          )}
                          {(challenge as any).tip && (
                            <div className="text-xs sm:text-sm text-blue-700 mt-2 pl-3 border-l-2 border-blue-300 bg-blue-50 p-2 rounded-r">
                              💡 <strong>Tip:</strong> {(challenge as any).tip}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
                          {!completed ? (
                            <Form method="post" className="flex items-center gap-2">
                              <input type="hidden" name="action" value="complete_item" />
                              <input type="hidden" name="challengeId" value={challenge.item_id.toString()} />
                              <input type="hidden" name="reflection" value="" />
                              <Button type="submit" variant="outline" size="sm" className="text-pink-500 hover:text-pink-50 hover:bg-pink-400" disabled={isSubmitting}>
                                {isSubmitting && navigation.formData?.get('challengeId') === challenge.item_id.toString() ? (
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