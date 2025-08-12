import React, { useState } from 'react';
import { useSearchParams, Form, useActionData, redirect } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/common/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Route } from './+types/new';
import { makeSSRClient } from '~/supa-client';
import { z } from 'zod';
import type { Scenario } from '../types';

const createSessionSchema = z.object({
  scenario: z.enum(['A', 'B', 'C', 'D', 'E']),
  title: z.string().optional(),
  move_date: z.string().optional(),
  region: z.string().optional(),
  trade_method: z.enum(['meet', 'ship', 'both']).optional(),
  days: z.number().optional(),
});

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  
  // Check if user is authenticated
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    throw redirect('/auth/login?redirect=/let-go-buddy/new');
  }
  
  // Check session limits
  const { data: canCreate } = await client.rpc('rpc_can_open_new_session');
  if (!canCreate?.allowed) {
    throw redirect('/let-go-buddy?error=session_limit');
  }
  
  const url = new URL(request.url);
  const preselectedScenario = url.searchParams.get('scenario') as Scenario;
  
  return { preselectedScenario, canCreate };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  
  const formData = await request.formData();
  const scenario = formData.get('scenario') as Scenario;
  const title = formData.get('title') as string;
  const move_date = formData.get('move_date') as string;
  const region = formData.get('region') as string; 
  const trade_method = formData.get('trade_method') as 'meet' | 'ship' | 'both';
  const days = formData.get('days') ? parseInt(formData.get('days') as string) : undefined;

  try {
    // Validate input
    const validData = createSessionSchema.parse({
      scenario,
      title: title || undefined,
      move_date: move_date || undefined,
      region: region || undefined,
      trade_method: trade_method || undefined,
      days
    });

    // Create session
    if (scenario === 'C') {
      // Challenge scenario - create challenge instead of session
      const { data: challenge, error } = await client
        .from('lgb_challenges')
        .insert({
          days: days || 7,
          start_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      
      return redirect(`/let-go-buddy/challenges?new=${challenge.challenge_id}`);
    } else {
      // Regular session
      const { data: sessionId } = await client
        .rpc('rpc_create_session', {
          p_scenario: scenario,
          p_title: title,
          p_move_date: move_date || null,
          p_region: region || null,
          p_trade_method: trade_method || null
        });

      if (!sessionId) throw new Error('Failed to create session');
      
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
  const { preselectedScenario } = loaderData;
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();

  const [selectedScenario, setSelectedScenario] = useState<Scenario>(
    preselectedScenario || 'A'
  );

  const scenarios = {
    A: {
      title: 'Keep vs Sell Helper',
      description: 'Get AI guidance on individual items',
      fields: ['title']
    },
    B: {
      title: 'Moving Assistant', 
      description: 'Plan your move with timeline',
      fields: ['title', 'move_date', 'region', 'trade_method']
    },
    C: {
      title: 'Declutter Challenge',
      description: 'Daily decluttering habits',
      fields: ['days']
    },
    D: {
      title: 'Category Focus',
      description: 'Batch process specific categories',
      fields: ['title', 'region']
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
            <a href="/let-go-buddy">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Let Go Buddy
            </a>
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start New Session
          </h1>
          <p className="text-gray-600">
            Choose your approach and we'll guide you through the process
          </p>
        </div>

        <Form method="post" className="space-y-8">
          {/* Scenario Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Choose Your Scenario</h2>
            
            <div className="grid gap-4">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <label key={key} className="cursor-pointer">
                  <div className={`border-2 rounded-lg p-4 transition-all ${
                    selectedScenario === key 
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
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">
                            {scenario.title}
                          </h3>
                          <Badge variant="outline">{key}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {scenario.description}
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
                    defaultValue={actionData?.values?.title}
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
                    defaultValue={actionData?.values?.move_date}
                    required
                  />
                </div>
              )}

              {currentScenario.fields.includes('region') && (
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select name="region" defaultValue={actionData?.values?.region}>
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
                  <Select name="trade_method" defaultValue={actionData?.values?.trade_method}>
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
            <Button type="submit" size="lg" className="px-8">
              Create Session
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}