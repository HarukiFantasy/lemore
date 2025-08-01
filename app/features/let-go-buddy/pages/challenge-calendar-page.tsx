import { useState, useEffect } from 'react';
import { redirect, useFetcher } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Progress } from '~/common/components/ui/progress';
import { Textarea } from '~/common/components/ui/textarea';
import { Calendar } from '~/common/components/ui/calendar';
import { Input } from '~/common/components/ui/input';
import { makeSSRClient } from '~/supa-client';
import { getChallengeItems } from '../queries';
import { createChallengeItem, updateChallengeItemCompletion, deleteChallengeItem } from '../mutations';

export async function loader({ request }: { request: Request }) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    const url = new URL(request.url);
    return redirect(`/auth/login?redirectTo=${url.pathname}`);
  }
  
  // Check usage limits
  let canUseLetGoBuddy = true;
  const { count } = await client
    .from('let_go_buddy_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if (typeof count === 'number' && count >= 2) {
    canUseLetGoBuddy = false;
  }
  
  // Fetch challenge calendar items
  const challengeItems = await getChallengeItems(client, { userId: user.id });
  
  return { user, canUseLetGoBuddy, challengeItems };
}

export async function action({ request }: { request: Request }) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  try {
    switch (intent) {
      case 'create': {
        const name = formData.get('name') as string;
        const scheduledDate = formData.get('scheduledDate') as string;
        
        if (!name || !scheduledDate) {
          return new Response(JSON.stringify({ error: "Name and scheduled date are required" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const item = await createChallengeItem(client, {
          userId: user.id,
          name,
          scheduledDate
        });

        return new Response(JSON.stringify({ success: true, item }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      case 'update': {
        const itemId = parseInt(formData.get('itemId') as string);
        const completed = formData.get('completed') === 'true';
        const reflection = formData.get('reflection') as string;

        const item = await updateChallengeItemCompletion(client, {
          itemId,
          completed,
          reflection: reflection || undefined,
          userId: user.id
        });

        return new Response(JSON.stringify({ success: true, item }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      case 'delete': {
        const itemId = parseInt(formData.get('itemId') as string);

        await deleteChallengeItem(client, {
          itemId,
          userId: user.id
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid intent" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error) {
    console.error('Challenge calendar action error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export default function ChallengeCalendarPage({ loaderData }: { loaderData: { user: any; canUseLetGoBuddy: boolean; challengeItems: any[] } }) {
  const { user, canUseLetGoBuddy, challengeItems: initialChallengeItems } = loaderData;
  const [challengeItems, setChallengeItems] = useState(initialChallengeItems);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDate, setNewItemDate] = useState('');
  const fetcher = useFetcher();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Handle fetcher completion to refresh data
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      if (fetcher.data.success && fetcher.data.item) {
        // Update the local state when creating a new item
        if (typeof fetcher.data.item === 'object' && 'item_id' in fetcher.data.item) {
          setChallengeItems(prev => [...prev, fetcher.data.item]);
        }
      }
    }
  }, [fetcher.data, fetcher.state]);

  const handleCompletion = (itemId: number) => {
    const item = challengeItems.find(item => item.item_id === itemId);
    if (!item) return;
    
    const formData = new FormData();
    formData.append('intent', 'update');
    formData.append('itemId', itemId.toString());
    formData.append('completed', (!item.completed).toString());
    formData.append('reflection', item.reflection || '');
    
    fetcher.submit(formData, { method: 'POST' });
    
    // Optimistically update UI
    setChallengeItems(items =>
      items.map(item => (item.item_id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleReflection = (itemId: number, text: string) => {
    const item = challengeItems.find(item => item.item_id === itemId);
    if (!item) return;
    
    const formData = new FormData();
    formData.append('intent', 'update');
    formData.append('itemId', itemId.toString());
    formData.append('completed', item.completed.toString());
    formData.append('reflection', text);
    
    fetcher.submit(formData, { method: 'POST' });
    
    // Optimistically update UI
    setChallengeItems(items =>
      items.map(item => (item.item_id === itemId ? { ...item, reflection: text } : item))
    );
  };

  const handleAddItem = () => {
    if (!newItemName || !newItemDate) return;
    
    const formData = new FormData();
    formData.append('intent', 'create');
    formData.append('name', newItemName);
    formData.append('scheduledDate', newItemDate);
    
    fetcher.submit(formData, { method: 'POST' });
    
    // Reset form
    setNewItemName('');
    setNewItemDate('');
  };

  const handleDeleteItem = (itemId: number) => {
    const formData = new FormData();
    formData.append('intent', 'delete');
    formData.append('itemId', itemId.toString());
    
    fetcher.submit(formData, { method: 'POST' });
    
    // Optimistically update UI
    setChallengeItems(items => items.filter(item => item.item_id !== itemId));
  };

  const completedCount = challengeItems.filter(item => item.completed).length;
  const progressPercentage = (completedCount / challengeItems.length) * 100;
  
  const challengeDays = challengeItems.map(item => {
    const date = new Date(item.scheduled_date);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  });
  
  const selectedDayItem = selectedDate 
    ? challengeItems.find(item => {
        const itemDate = new Date(item.scheduled_date);
        const itemUTCDate = new Date(Date.UTC(itemDate.getUTCFullYear(), itemDate.getUTCMonth(), itemDate.getUTCDate()));
        return itemUTCDate.toDateString() === selectedDate.toDateString();
      })
    : undefined;

  return (
    <div className="w-full md:w-4/5 mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Declutter Challenge Calendar</h1>
        <p className="text-lg text-muted-foreground mt-2">One item at a time. You got this!</p>
      </div>

      {!canUseLetGoBuddy && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-center">
            <div className="text-amber-800 font-medium mb-2">Let Go Buddy Usage Limit Reached</div>
            <div className="text-sm text-amber-700">
              You've used your free Let Go Buddy sessions (2/2) as an Explorer level user. 
              The Challenge Calendar is still available, but AI analysis requires more trust level.
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">{`You've completed ${completedCount} of ${challengeItems.length} items. Keep going!`}</p>
          <Progress value={progressPercentage} className="bg-[#e5eecc] [&>div]:bg-[#b5e6e7]" />
        </CardContent>
      </Card>
      
      <div className="flex gap-8 items-start">
        <div className="w-min">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ challengeDay: challengeDays }}
            className="rounded-md border"
          />
        </div>
        
        <div className="space-y-4 flex-1">
          {showAllTasks ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Challenge Items</h2>
                <Button variant="outline" size="sm" onClick={() => setShowAllTasks(false)}>
                  View Selected Day
                </Button>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
                {challengeItems.map(item => (
                  <Card key={item.item_id} className={item.completed ? 'bg-muted/50' : ''}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">{new Date(item.scheduled_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Done</span>
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => handleCompletion(item.item_id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.item_id)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                      {item.completed && item.reflection && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground italic">{item.reflection}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setShowAllTasks(true)}>
                  View All Tasks
                </Button>
              </div>
              
              {selectedDayItem ? (
                <Card className={selectedDayItem.completed ? 'bg-muted/50' : ''}>
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{selectedDayItem.name}</h3>
                        <p className="text-sm text-muted-foreground">Due today</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Done</span>
                        <Checkbox
                          checked={selectedDayItem.completed}
                          onCheckedChange={() => handleCompletion(selectedDayItem.item_id)}
                        />
                      </div>
                    </div>

                    {selectedDayItem.completed && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">How did it feel?</h4>
                        <Textarea
                          placeholder="e.g., Liberating, nostalgic, difficult..."
                          value={selectedDayItem.reflection}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleReflection(selectedDayItem.item_id, e.target.value)}
                        />
                      </div>
                    )}

                    {!selectedDayItem.completed && (
                      <Button variant="ghost" className="text-sm text-amber-600 h-auto p-0 justify-start">
                        Still hesitating on this one?
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <p>No task scheduled for this day.</p>
                    <p className="text-xs mt-2">Select a highlighted day to see your task.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add New Item Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Challenge Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Item name (e.g., Old College Hoodie)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="date"
              value={newItemDate}
              onChange={(e) => setNewItemDate(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleAddItem}
            disabled={!newItemName || !newItemDate || fetcher.state === 'submitting'}
            className="w-full"
          >
            {fetcher.state === 'submitting' ? 'Adding...' : 'Add Challenge Item'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
