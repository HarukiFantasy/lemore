import { useState, useEffect } from 'react';
import { Form, useActionData, redirect, Link, useNavigation } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/common/components/ui/select';
import { ArrowLeft, ArrowRight, Loader2, Lock } from 'lucide-react';
import type { Route } from './+types/new';
import { makeSSRClient, getAuthUser } from '~/supa-client';
import { z } from 'zod';
import type { Scenario } from '../types';
import { getAIUsageCount } from '../utils/aiUsage';

const createSessionSchema = z.object({
  scenario: z.enum(['A', 'B', 'C', 'E']),
  title: z.string().optional(),
  move_date: z.string().optional(),
  region: z.string().optional(),
  trade_method: z.enum(['meet', 'ship', 'both']).optional(),
  days: z.number().optional(),
});

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  
  // Check if user is authenticated
  const { data: { user } } = await getAuthUser(client);
  if (!user) {
    throw redirect('/auth/login?redirect=/let-go-buddy/new');
  }
  
  // Sessions are now unlimited - AI analysis limits are checked per item upload
  
  const url = new URL(request.url);
  const preselectedScenario = url.searchParams.get('scenario') as Scenario;
  
  return { 
    preselectedScenario,
    userId: user.id
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  
  const formData = await request.formData();
  const scenario = formData.get('scenario')?.toString() as Scenario;
  const title = formData.get('title')?.toString() || '';
  const move_date = formData.get('move_date')?.toString() || '';
  const region = formData.get('region')?.toString() || ''; 
  const trade_method = formData.get('trade_method')?.toString() as 'meet' | 'ship' | 'both';
  const daysStr = formData.get('days')?.toString();
  const days = daysStr ? parseInt(daysStr) : undefined;

  try {
    // Get authenticated user
    const { data: { user } } = await getAuthUser(client);
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate input
    createSessionSchema.parse({
      scenario,
      title: title || undefined,
      move_date: move_date || undefined,
      region: region || undefined,
      trade_method: trade_method || undefined,
      days
    });

    // Create session
    if (scenario === 'C') {
      // Challenge scenario - create session first, then challenge items
      const { data: sessionId, error: rpcError } = await client
        .rpc('rpc_create_session', {
          p_scenario: scenario,
          p_title: title || `${days || 7}-Day Declutter Challenge`,
          p_move_date: undefined,
          p_region: region || undefined
        });
      
      if (rpcError) {
        console.error('Session creation failed:', rpcError);
        throw rpcError;
      }
      
      if (!sessionId) {
        throw new Error('Failed to create session - no session ID returned');
      }
      
      return redirect(`/let-go-buddy/session/${sessionId}`);
    } else {
      // Create session using RPC
      console.log('Creating session for user:', user.id, 'scenario:', scenario);
      
      const { data: sessionId, error: rpcError } = await client
        .rpc('rpc_create_session', {
          p_scenario: scenario,
          p_title: title,
          p_move_date: move_date || undefined,
          p_region: region || undefined
        });
      
      if (rpcError) {
        console.error('Session creation failed:', rpcError);
        throw rpcError;
      }
      
      if (!sessionId) {
        throw new Error('Failed to create session - no session ID returned');
      }
      
      console.log('Session created successfully:', sessionId);
      return redirect(`/let-go-buddy/session/${sessionId}`);
    }

  } catch (error) {
    console.error('Session creation error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create session',
      values: Object.fromEntries(formData)
    };
  }
};

export default function NewSession({ loaderData }: Route.ComponentProps) {
  const { preselectedScenario, userId } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [selectedScenario, setSelectedScenario] = useState<Scenario>(
    preselectedScenario || 'A'
  );
  const [aiUsageData, setAiUsageData] = useState<{ canUse: boolean; total: number; maxFree: number } | null>(null);

  const isSubmitting = navigation.state === 'submitting';
  
  // Check AI usage limits on component mount
  useEffect(() => {
    if (userId) {
      getAIUsageCount(userId).then(usage => {
        setAiUsageData({
          canUse: usage.canUse,
          total: usage.total,
          maxFree: usage.maxFree
        });
      });
    }
  }, [userId]);

  const scenarios = {
    A: {
      title: 'Keep vs Sell Helper',
      description: 'Get AI guidance on individual items',
      fields: ['title']
    },
    B: {
      title: 'Moving Assistant', 
      description: 'Plan your move with timeline',
      fields: ['title', 'move_date', 'region']
    },
    C: {
      title: 'Declutter Challenge',
      description: 'Daily decluttering habits',
      fields: ['days']
    },
    E: {
      title: 'Quick Listing Generator',
      description: 'Just create listings fast',
      fields: ['title']
    }
  };

  const currentScenario = scenarios[selectedScenario];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/let-go-buddy">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Let Go Buddy
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start New Session
          </h1>
          <p className="text-gray-600">
            Choose your approach and we'll guide you through the process
          </p>
          {aiUsageData && !aiUsageData.canUse && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
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

        <Form method="post" className="space-y-8">
          {/* Scenario Selection */}
          <Card className={`p-6 ${aiUsageData && !aiUsageData.canUse ? 'opacity-50' : ''}`}>
            <h2 className="text-xl font-semibold mb-4">Choose Your Scenario</h2>
            
            <div className="grid gap-4">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <label key={key} className={`${
                  aiUsageData && !aiUsageData.canUse ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}>
                  <div className={`border-2 rounded-lg p-4 transition-all ${
                    aiUsageData && !aiUsageData.canUse
                      ? 'border-gray-200 bg-gray-50'
                      : selectedScenario === key 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="scenario"
                        value={key}
                        checked={selectedScenario === key}
                        onChange={(e) => setSelectedScenario(e.target.value as Scenario)}
                        className="mt-1 mr-3"
                        disabled={aiUsageData ? !aiUsageData.canUse : false}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${
                            aiUsageData && !aiUsageData.canUse ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {scenario.title}
                            {aiUsageData && !aiUsageData.canUse && (
                              <Lock className="w-4 h-4 inline ml-2" />
                            )}
                          </h3>
                          <Badge variant={aiUsageData && !aiUsageData.canUse ? "secondary" : "outline"}>
                            {key}
                          </Badge>
                        </div>
                        <p className={`text-sm mt-1 ${
                          aiUsageData && !aiUsageData.canUse ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {aiUsageData && !aiUsageData.canUse 
                            ? 'AI limit reached - manual decisions only' 
                            : scenario.description
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Dynamic Fields */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentScenario.title} Setup
            </h2>
            
            <div className="space-y-4">
              {currentScenario.fields.includes('title') && (
                <div>
                  <Label htmlFor="title">Session Title (optional)</Label>
                  <Input 
                    id="title"
                    name="title"
                    placeholder="e.g., Spring cleaning, Moving prep"
                    defaultValue={actionData?.values?.title?.toString()}
                  />
                </div>
              )}

              {currentScenario.fields.includes('move_date') && (
                <div>
                  <Label htmlFor="move_date">Move Date</Label>
                  <Input 
                    id="move_date"
                    name="move_date"
                    type="date"
                    defaultValue={actionData?.values?.move_date?.toString()}
                    required
                  />
                </div>
              )}

              {currentScenario.fields.includes('region') && (
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select name="region" defaultValue={actionData?.values?.region?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bangkok">Bangkok</SelectItem>
                      <SelectItem value="Seoul">Seoul</SelectItem>
                      <SelectItem value="Thailand">Other Thailand</SelectItem>
                      <SelectItem value="Korea">Other Korea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentScenario.fields.includes('trade_method') && (
                <div>
                  <Label htmlFor="trade_method">Preferred Trading Method</Label>
                  <Select name="trade_method" defaultValue={actionData?.values?.trade_method?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="How will you trade items?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meet">Meet in person only</SelectItem>
                      <SelectItem value="ship">Shipping only</SelectItem>
                      <SelectItem value="both">Both meeting and shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentScenario.fields.includes('days') && (
                <div>
                  <Label htmlFor="days">Challenge Duration</Label>
                  <Select name="days" defaultValue="7">
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>

          {/* Error Display */}
          {actionData?.error && (
            <Card className="p-4 border-red-200 bg-red-50">
              <p className="text-red-600 text-sm">{actionData.error}</p>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className={`px-8 ${
                aiUsageData && !aiUsageData.canUse 
                  ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                  : ''
              }`}
              disabled={isSubmitting || (aiUsageData ? !aiUsageData.canUse : false)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Session...
                </>
              ) : aiUsageData && !aiUsageData.canUse ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  AI Limit Reached
                </>
              ) : (
                <>
                  Create Session
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}