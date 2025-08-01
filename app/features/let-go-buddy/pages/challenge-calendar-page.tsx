import { useState } from 'react';
import { redirect } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Progress } from '~/common/components/ui/progress';
import { Textarea } from '~/common/components/ui/textarea';
import { Calendar } from '~/common/components/ui/calendar';
import { makeSSRClient } from '~/supa-client';

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
  
  return { user, canUseLetGoBuddy };
}

const MOCK_CHALLENGE_ITEMS = [
  { id: 1, name: 'Old College Hoodie', date: '2025-07-28', completed: true, reflection: 'It was harder than I thought, but I feel lighter now.' },
  { id: 2, name: 'Unused Yoga Mat', date: '2025-07-29', completed: false, reflection: '' },
  { id: 3, name: 'That book I never read', date: '2025-07-30', completed: false, reflection: '' },
  { id: 4, name: 'Random kitchen gadget', date: '2025-08-01', completed: false, reflection: '' },
  { id: 5, name: 'Expired Spices', date: new Date().toISOString().split('T')[0], completed: false, reflection: '' },
];

export default function ChallengeCalendarPage({ loaderData }: { loaderData: { user: any; canUseLetGoBuddy: boolean } }) {
  const { user, canUseLetGoBuddy } = loaderData;
  const [challengeItems, setChallengeItems] = useState(MOCK_CHALLENGE_ITEMS);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAllTasks, setShowAllTasks] = useState(false);

  const handleCompletion = (id: number) => {
    setChallengeItems(items =>
      items.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleReflection = (id: number, text: string) => {
     setChallengeItems(items =>
      items.map(item => (item.id === id ? { ...item, reflection: text } : item))
    );
  }

  const completedCount = challengeItems.filter(item => item.completed).length;
  const progressPercentage = (completedCount / challengeItems.length) * 100;
  
  const challengeDays = challengeItems.map(item => {
    const date = new Date(item.date);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  });
  
  const selectedDayItem = selectedDate 
    ? challengeItems.find(item => {
        const itemDate = new Date(item.date);
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
                  <Card key={item.id} className={item.completed ? 'bg-muted/50' : ''}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Done</span>
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => handleCompletion(item.id)}
                          />
                        </div>
                      </div>
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
                          onCheckedChange={() => handleCompletion(selectedDayItem.id)}
                        />
                      </div>
                    </div>

                    {selectedDayItem.completed && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">How did it feel?</h4>
                        <Textarea
                          placeholder="e.g., Liberating, nostalgic, difficult..."
                          value={selectedDayItem.reflection}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleReflection(selectedDayItem.id, e.target.value)}
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
    </div>
  );
}
