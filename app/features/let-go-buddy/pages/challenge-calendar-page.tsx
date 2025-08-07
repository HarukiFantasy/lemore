import { useState } from "react";
import type { Route } from "./+types/challenge-calendar-page";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Textarea } from "~/common/components/ui/textarea";
import { 
  CalendarIcon, 
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  SparklesIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { makeSSRClient } from "~/supa-client";
import { redirect } from "react-router";
import { getChallengeItems } from "../queries";
import { format, parseISO, isFuture, isPast, isToday } from "date-fns";

export async function loader({ request }: Route.LoaderArgs) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }

  const challengeItems = await getChallengeItems(client, { userId: user.id });

  // Separate items by status
  const upcomingItems = challengeItems.filter(item => !item.completed && isFuture(parseISO(item.scheduled_date)));
  const todayItems = challengeItems.filter(item => !item.completed && isToday(parseISO(item.scheduled_date)));
  const overdueItems = challengeItems.filter(item => !item.completed && isPast(parseISO(item.scheduled_date)) && !isToday(parseISO(item.scheduled_date)));
  const completedItems = challengeItems.filter(item => item.completed);

  return {
    challengeItems,
    upcomingItems,
    todayItems,
    overdueItems,
    completedItems,
    stats: {
      total: challengeItems.length,
      completed: completedItems.length,
      upcoming: upcomingItems.length,
      overdue: overdueItems.length
    }
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const itemId = parseInt(formData.get("item_id") as string);

  try {
    if (intent === "complete-item") {
      const reflection = formData.get("reflection") as string;
      
      const { error } = await client
        .from('challenge_calendar_items')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          reflection: reflection || null,
          updated_at: new Date().toISOString()
        })
        .eq('item_id', itemId)
        .eq('user_id', user.id);

      if (error) {
        return { error: 'Failed to complete item' };
      }

      return { success: 'Item marked as completed!' };
    }

    if (intent === "update-reflection") {
      const reflection = formData.get("reflection") as string;
      
      const { error } = await client
        .from('challenge_calendar_items')
        .update({
          reflection,
          updated_at: new Date().toISOString()
        })
        .eq('item_id', itemId)
        .eq('user_id', user.id);

      if (error) {
        return { error: 'Failed to update reflection' };
      }

      return { success: 'Reflection updated!' };
    }

  } catch (error) {
    console.error('Action error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  return null;
}

export default function ChallengeCalendarPage({ loaderData, actionData }: Route.ComponentProps) {
  const { upcomingItems, todayItems, overdueItems, completedItems, stats } = loaderData;
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [editingReflection, setEditingReflection] = useState<number | null>(null);

  const getItemStatusColor = (item: any) => {
    if (item.completed) return 'bg-green-50 border-green-200';
    if (isToday(parseISO(item.scheduled_date))) return 'bg-blue-50 border-blue-200';
    if (isPast(parseISO(item.scheduled_date))) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getStatusBadge = (item: any) => {
    if (item.completed) return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
    if (isToday(parseISO(item.scheduled_date))) return <Badge className="bg-blue-100 text-blue-700">Due Today</Badge>;
    if (isPast(parseISO(item.scheduled_date))) return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const handleCompleteItem = (itemId: number, reflection: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';
    
    const intentInput = document.createElement('input');
    intentInput.name = 'intent';
    intentInput.value = 'complete-item';
    form.appendChild(intentInput);
    
    const itemIdInput = document.createElement('input');
    itemIdInput.name = 'item_id';
    itemIdInput.value = itemId.toString();
    form.appendChild(itemIdInput);
    
    const reflectionInput = document.createElement('textarea');
    reflectionInput.name = 'reflection';
    reflectionInput.value = reflection;
    form.appendChild(reflectionInput);
    
    document.body.appendChild(form);
    form.submit();
  };

  const ItemCard = ({ item, showReflection = false }: { item: any; showReflection?: boolean }) => {
    const reflectionText = reflections[item.item_id] || item.reflection || '';
    const isEditing = editingReflection === item.item_id;

    return (
      <Card key={item.item_id} className={`${getItemStatusColor(item)} border-l-4`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-sm text-gray-500">
                Scheduled for {format(parseISO(item.scheduled_date), 'MMM d, yyyy')}
              </p>
            </div>
            {getStatusBadge(item)}
          </div>

          {showReflection && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Reflection</h4>
                {item.completed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingReflection(isEditing ? null : item.item_id)}
                  >
                    <PencilIcon className="w-3 h-3" />
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={reflectionText}
                    onChange={(e) => setReflections(prev => ({ ...prev, [item.item_id]: e.target.value }))}
                    placeholder="How did it feel to let go of this item?"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <form method="post" className="inline">
                      <input type="hidden" name="intent" value="update-reflection" />
                      <input type="hidden" name="item_id" value={item.item_id} />
                      <input type="hidden" name="reflection" value={reflectionText} />
                      <Button type="submit" size="sm">Save</Button>
                    </form>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingReflection(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">
                  {item.reflection || "No reflection yet"}
                </p>
              )}
            </div>
          )}

          {!item.completed && (
            <div className="mt-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="How do you feel about letting go of this item? (Optional)"
                  rows={2}
                  value={reflectionText}
                  onChange={(e) => setReflections(prev => ({ ...prev, [item.item_id]: e.target.value }))}
                />
                <Button
                  size="sm"
                  onClick={() => handleCompleteItem(item.item_id, reflectionText)}
                  variant="outline"
                  className="bg-[#91a453] text-[#fcffe7] hover:bg-[#D4DE95] hover:text-[#3D4127]"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Mark as Complete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Challenge Calendar</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {actionData?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{actionData.success}</p>
        </div>
      )}

      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{actionData.error}</p>
        </div>
      )}

      {/* Due Today */}
      {todayItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <StarIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Due Today</h2>
            <Badge className="bg-blue-100 text-blue-700">{todayItems.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todayItems.map((item) => (
              <ItemCard key={item.item_id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Overdue Items */}
      {overdueItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold">Overdue</h2>
            <Badge className="bg-red-100 text-red-700">{overdueItems.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overdueItems.map((item) => (
              <ItemCard key={item.item_id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Items */}
      {upcomingItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold">Upcoming</h2>
            <Badge variant="outline">{upcomingItems.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingItems.map((item) => (
              <ItemCard key={item.item_id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold">Completed</h2>
            <Badge className="bg-green-100 text-green-700">{completedItems.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedItems.map((item) => (
              <ItemCard key={item.item_id} item={item} showReflection />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.total === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Items Scheduled Yet</h3>
            <p className="text-gray-600 mb-6">
              Start a Let Go Buddy session to add items to your challenge calendar.
            </p>
            <Button asChild>
              <a href="/let-go-buddy" className="inline-flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                Start New Session
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}