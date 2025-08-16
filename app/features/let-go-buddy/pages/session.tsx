import React, { useState } from 'react';
import { Link, Form, useActionData, redirect, useRevalidator, useNavigation } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { useToast } from '~/common/components/ui/use-toast';
import { 
  ArrowLeft,
  Plus,
  BarChart3,
  Package,
  DollarSign,
  Target,
  Heart,
  ShoppingCart,
  Gift,
  Trash2,
  Sparkles,
  Calendar,
  Loader2,
  Lock
} from 'lucide-react';
import type { Route } from './+types/session';
import { makeSSRClient, getAuthUser, browserClient } from '~/supa-client';
import { ItemUploader } from '../components/ItemUploader';
import { ItemCard } from '../components/ItemCard';
import { ListingComposer } from '../components/ListingComposer';
import { MovingAssistant } from '../components/MovingAssistant';
import { saveListingsToDatabase } from '../utils/listings';
import { getAIUsageCount } from '../utils/aiUsage';

export const meta: Route.MetaFunction = ({ params }) => {
  return [
    { title: `Session ${params.sessionId} - Let Go Buddy | Lemore` },
    { name: "description", content: "Manage your decluttering session with AI guidance." },
  ];
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const sessionId = params.sessionId;
  
  // Check if user is authenticated (with development bypass)
  const { data: { user } } = await getAuthUser(client);
  if (!user) {
    throw redirect('/auth/login?redirect=/let-go-buddy');
  }
  
  // Get session details with items - fallback to base table if view doesn't exist
  let session;
  let { data: sessionData, error } = await client
    .from('view_session_dashboard')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.log('View query failed, trying base table:', error);
    // Fallback to base lgb_sessions table (without ai_plan_generated fields if they don't exist)
    const { data: baseSessionData, error: baseError } = await client
      .from('lgb_sessions')
      .select(`
        session_id,
        user_id,
        scenario,
        title,
        status,
        created_at,
        move_date,
        region
      `)
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single();
    
    if (baseError || !baseSessionData) {
      console.error('Session not found:', baseError);
      throw redirect('/let-go-buddy?error=session_not_found');
    }
    
    // Add default values for dashboard stats and missing fields
    session = {
      ...baseSessionData,
      item_count: 0,
      decided_count: 0,
      expected_revenue: 0,
      ai_plan_generated: false, // Default to false when column doesn't exist
      ai_plan_generated_at: null // Default to null when column doesn't exist
    };
  } else {
    session = sessionData;
  }

  // Get session items from database
  const { data: itemsData } = await client
    .from('lgb_items')
    .select(`
      *,
      lgb_item_photos (
        photo_id,
        storage_path,
        created_at
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  // Remove Moving Assistant stats calculation since it's not working properly
  // Moving Assistant sessions will just use regular stats layout
  
  // Transform items to match expected format
  const items = (itemsData || []).map(item => ({
    ...item,
    // Transform photos from database format to expected format
    photos: item.lgb_item_photos ? item.lgb_item_photos.map((photo: any) => photo.storage_path) : []
  }));

  return { 
    session,
    items
  };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const sessionId = params.sessionId;
  
  // Check if user is authenticated
  const { data: { user } } = await getAuthUser(client);
  if (!user) {
    throw redirect('/auth/login?redirect=/let-go-buddy');
  }
  
  const formData = await request.formData();
  const action = formData.get('action') as string;

  try {
    if (action === 'archive_session') {
      const { error } = await client
        .from('lgb_sessions')
        .update({ status: 'archived' })
        .eq('session_id', sessionId)
        .eq('user_id', user.id); // SECURITY: Only allow user to modify their own sessions

      if (error) throw error;
      return redirect('/let-go-buddy');
    }

    if (action === 'complete_session') {
      const { error } = await client
        .from('lgb_sessions')
        .update({ status: 'completed' })
        .eq('session_id', sessionId)
        .eq('user_id', user.id); // SECURITY: Only allow user to modify their own sessions

      if (error) throw error;
      return redirect('/let-go-buddy');
    }

    return { success: true };

  } catch (error) {
    console.error('Session action error:', error);
    return {
      error: error instanceof Error ? error.message : 'Action failed',
      action
    };
  }
};

export default function SessionPage({ loaderData }: Route.ComponentProps) {
  const { session, items: initialItems } = loaderData;
  const revalidator = useRevalidator();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();
  const [uploadingItems, setUploadingItems] = useState<any[]>([]);
  const [aiUsage, setAiUsage] = useState<{ used: number; max: number; limitReached: boolean }>({ used: 0, max: 2, limitReached: false });
  const isSubmitting = navigation.state === 'submitting';

  // Check AI usage on component mount
  React.useEffect(() => {
    const checkAiUsage = async () => {
      try {
        const { data: { user } } = await browserClient.auth.getUser();
        if (!user) return;

        const aiUsage = await getAIUsageCount(user.id);
        setAiUsage({ 
          used: aiUsage.total, 
          max: aiUsage.maxFree, 
          limitReached: !aiUsage.canUse 
        });
      } catch (error) {
        console.error('Error checking AI usage:', error);
      }
    };

    checkAiUsage();
  }, [initialItems]); // Re-check when items change

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCompletionPercentage = () => {
    if (!session || allItems.length === 0) return 0;
    
    // For Scenario A, count items with decisions made
    if (session.scenario === 'A') {
      const itemsWithDecisions = allItems.filter(item => item.decision).length;
      return Math.round((itemsWithDecisions / allItems.length) * 100);
    }
    
    // For other scenarios, use database decided_count
    if (!session.item_count || session.item_count === 0) return 0;
    const decidedCount = session.decided_count || 0;
    return Math.round((decidedCount / session.item_count) * 100);
  };

  const allItems = [...initialItems, ...uploadingItems];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/let-go-buddy">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Let Go Buddy
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {session?.title || 'Untitled Session'}
                </h1>
                <Badge className={getStatusColor(session?.status || 'active')}>
                  {session?.status || 'active'}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4">
                Scenario {session?.scenario || 'A'} • Created {session?.created_at ? new Date(session.created_at).toLocaleDateString() : 'Unknown'}
              </p>

              {/* Quick Stats - Regular Item Stats for all scenarios */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <div className="text-2xl font-bold">{session?.item_count || 0}</div>
                      <div className="text-sm text-gray-600">Items</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <div className="text-2xl font-bold">{session?.decided_count || 0}</div>
                      <div className="text-sm text-gray-600">Decided</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-purple-500 mr-2" />
                    <div>
                      <div className="text-2xl font-bold">
                        ${session?.expected_revenue?.toFixed(0) || '0'}
                      </div>
                      <div className="text-sm text-gray-600">Expected</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-orange-500 mr-2" />
                    <div>
                      <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                  </div>
                </div>
              </div>

          {/* Decision Breakdown for Scenario A */}
          {session?.scenario === 'A' && allItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
              <h3 className="text-xl font-light text-gray-900 mb-6">Decision Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-light text-emerald-700 mb-1">
                    {allItems.filter(item => item.decision === 'keep').length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Keep</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-2xl font-light text-blue-700 mb-1">
                    {allItems.filter(item => item.decision === 'sell').length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Sell</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="text-2xl font-light text-purple-700 mb-1">
                    {allItems.filter(item => item.decision === 'donate').length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Donate</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-7 h-7 text-gray-600" />
                  </div>
                  <div className="text-2xl font-light text-gray-700 mb-1">
                    {allItems.filter(item => item.decision === 'dispose').length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Dispose</div>
                </div>
              </div>
            </div>
          )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {session?.status === 'active' && (
                <>
                  <Form method="post">
                    <input type="hidden" name="action" value="complete_session" />
                    <Button type="submit" variant="outline" disabled={isSubmitting}>
                      {isSubmitting && navigation.formData?.get('action') === 'complete_session' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Complete
                        </>
                      )}
                    </Button>
                  </Form>
                  
                  <Form method="post">
                    <input type="hidden" name="action" value="archive_session" />
                    <Button type="submit" variant="outline" disabled={isSubmitting}>
                      {isSubmitting && navigation.formData?.get('action') === 'archive_session' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Archiving...
                        </>
                      ) : (
                        "Archive"
                      )}
                    </Button>
                  </Form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {actionData?.error && (
          <Card className="p-4 border-red-200 bg-red-50 mb-6">
            <p className="text-red-600 text-sm">{actionData.error}</p>
          </Card>
        )}

        {/* AI Usage Warning */}
        {aiUsage.limitReached && (
          <Card className="p-4 border-amber-200 bg-amber-50 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-amber-600">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-1">AI Analysis Limit Reached</h3>
                <p className="text-amber-700 text-sm mb-3">
                  You've used <strong>{aiUsage.used}/{aiUsage.max}</strong> free AI analyses. 
                  You can still upload items and make decisions manually, but new uploads won't include AI recommendations.
                </p>
                <p className="text-amber-600 text-xs">
                  💡 To get more AI analyses, please contact the administrator. A payment system will be available soon!
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* AI Usage Progress (when not at limit) */}
        {!aiUsage.limitReached && aiUsage.used > 0 && (
          <Card className="p-4 border-blue-200 bg-blue-50 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">AI Analysis Usage</h3>
                <p className="text-blue-700 text-sm">
                  {aiUsage.used}/{aiUsage.max} free analyses used
                </p>
              </div>
              <div className="text-right">
                <div className="w-20 bg-blue-100 rounded-full h-2 mb-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(aiUsage.used / aiUsage.max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-blue-600">
                  {aiUsage.max - aiUsage.used} remaining
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Scenario E: Quick Listing Generator */}
        {session?.scenario === 'E' && session?.status === 'active' && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Quick Listing Generator
            </h2>
            <p className="text-gray-600 mb-6">
              Generate marketplace-ready listings in English without uploading photos. 
              Perfect for creating listings quickly with just basic item information.
            </p>
            <ListingComposer
              item={null}
              onListingGenerate={async (listings) => {
                console.log('Generated listings for session:', listings);
                
                // Save listings to database with session ID for standalone listings
                const saveResult = await saveListingsToDatabase(listings, session?.session_id || undefined);
                if (saveResult.success) {
                  console.log('Listings successfully saved to database for session');
                } else {
                  console.error('Failed to save listings to database:', saveResult.error);
                  toast({
                    title: "Save Error",
                    description: `Failed to save listings: ${saveResult.error}`,
                    variant: "destructive"
                  });
                }
              }}
              languages={['en']}
            />
          </Card>
        )}

        {/* Moving Assistant Section for Scenario B */}
        {session?.scenario === 'B' && session?.status === 'active' && (
          <>
            {/* View Calendar Card for Moving Assistant */}
            <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-blue-100 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Moving Plan Calendar</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      View your moving tasks and timeline in calendar format
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = '/let-go-buddy/challenges'}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            </Card>

            <MovingAssistant 
              session={session}
              onPlanGenerated={(plan) => {
                console.log('Moving plan generated:', plan);
                // Optionally refresh to show updated session
                revalidator.revalidate();
              }}
            />
          </>
        )}

        {/* Regular Item Upload Section (for scenarios A and C) */}
        {session?.scenario !== 'E' && session?.scenario !== 'B' && session?.status === 'active' && (
          <Card className={`p-6 mb-8 ${aiUsage && aiUsage.used >= aiUsage.max ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Items
              {aiUsage && aiUsage.used >= aiUsage.max && (
                <Lock className="w-5 h-5 ml-2 text-gray-400" />
              )}
            </h2>
            {aiUsage && aiUsage.used >= aiUsage.max ? (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">
                    AI Analysis Limit Reached ({aiUsage.used}/{aiUsage.max})
                  </span>
                </div>
                <p className="text-sm text-amber-700">
                  You've used all your free AI analyses. Item upload and analysis is not available, but you can still manage existing items.
                </p>
              </div>
            ) : null}
            <ItemUploader 
              onUpload={async (photos) => {
                console.log('Photos uploaded:', photos);
                
                if (photos.length === 0) return;
                
                if (!session?.session_id) {
                  console.error('No session ID available');
                  return;
                }
                
                console.log('Creating item for session:', session.session_id);
                
                try {
                  // Create item in database using direct insertion
                  const { data: newItemData, error: createError } = await browserClient
                    .from('lgb_items')
                    .insert([{
                      session_id: session.session_id,
                      title: 'Untitled Item',
                      category: 'Other',
                      condition: 'Good',
                      ai_recommendation: 'keep',
                      ai_rationale: 'Analyzing...'
                    }])
                    .select('item_id')
                    .single();

                  if (createError) {
                    console.error('Error creating item:', createError);
                    throw createError;
                  }

                  const itemId = newItemData.item_id;

                  // Insert photos separately
                  if (photos.length > 0) {
                    const photoInserts = photos.map(photoPath => ({
                      item_id: itemId,
                      storage_path: photoPath
                    }));

                    await browserClient
                      .from('lgb_item_photos')
                      .insert(photoInserts);
                  }

                  console.log('Created item with ID:', itemId);

                  // Check AI analysis limits before proceeding
                  console.log('Checking AI analysis limits...');
                  const { data: { user } } = await browserClient.auth.getUser();
                  if (!user) {
                    console.error('No user found');
                    return;
                  }

                  // Check AI usage limits (including item analyses and moving plans)
                  const aiUsage = await getAIUsageCount(user.id);
                  const canAnalyze = aiUsage.canUse;

                  if (!canAnalyze) {
                    console.log('AI analysis limit reached:', { used: aiUsage.total, max: aiUsage.maxFree });
                    // Show limit reached message and don't perform analysis
                    const basicItem = {
                      item_id: itemId,
                      session_id: session?.session_id,
                      photos: photos,
                      title: 'Upload Complete',
                      category: 'Other',
                      status: 'limit_reached',
                      ai_recommendation: 'keep',
                      ai_rationale: `AI analysis limit reached (${aiUsage.total}/${aiUsage.maxFree}). You can still make decisions manually.`,
                      created_at: new Date().toISOString()
                    };
                    setUploadingItems(prev => [...prev, basicItem]);

                    // Update item in database without AI analysis
                    await browserClient
                      .from('lgb_items')
                      .update({
                        title: 'Upload Complete',
                        category: 'Other',
                        condition: 'Good',
                        ai_recommendation: 'keep',
                        ai_rationale: `AI analysis limit reached (${aiUsage.total}/${aiUsage.maxFree}). You can still make decisions manually.`,
                        updated_at: new Date().toISOString()
                      })
                      .eq('item_id', itemId);

                    // Remove from uploading items and refresh to show the saved item
                    setTimeout(() => {
                      setUploadingItems(prev => prev.filter(item => item.item_id !== itemId));
                      revalidator.revalidate();
                    }, 1500);

                    return; // Exit early, don't call AI API
                  }

                  // Add to uploading items temporarily with analyzing status
                  const tempItem = {
                    item_id: itemId,
                    session_id: session?.session_id,
                    photos: photos,
                    title: 'Analyzing...',
                    category: 'Analyzing',
                    status: 'analyzing',
                    ai_recommendation: null,
                    ai_rationale: `AI is analyzing your item... (${aiUsage.total + 1}/${aiUsage.maxFree} analyses used)`,
                    created_at: new Date().toISOString()
                  };
                  setUploadingItems(prev => [...prev, tempItem]);

                  // Call AI analysis API
                  const analysisResponse = await fetch('/api/ai/analyze-item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      photos: photos,
                      context: {
                        scenario: session?.scenario,
                        region: (session as any)?.region || null
                      }
                    })
                  });

                  if (!analysisResponse.ok) {
                    const errorData = await analysisResponse.json().catch(() => null);
                    const errorMessage = errorData?.error?.message || 'AI analysis failed';
                    throw new Error(errorMessage);
                  }

                  const analysisResult = await analysisResponse.json();
                  console.log('AI analysis result:', analysisResult);

                  // Check if the API returned an error in the response body
                  if (analysisResult.error) {
                    throw new Error(analysisResult.error.message || 'AI analysis failed');
                  }

                  // Update item with AI results
                  // Generate a title based on category and condition
                  const generatedTitle = `${analysisResult.data.category || 'Unknown'} - ${analysisResult.data.condition || 'Unknown Condition'}`;
                  
                  const { error: updateError } = await browserClient
                    .from('lgb_items')
                    .update({
                      title: generatedTitle,
                      category: analysisResult.data.category || 'Other',
                      condition: analysisResult.data.condition || 'Good',
                      usage_score: analysisResult.data.usage_score,
                      ai_recommendation: analysisResult.data.recommendation || 'keep',
                      ai_rationale: analysisResult.data.rationale || 'AI analysis completed',
                      sentiment: analysisResult.data.sentiment || 'neutral',
                      updated_at: new Date().toISOString()
                    })
                    .eq('item_id', itemId);

                  if (updateError) {
                    console.error('Error updating item:', updateError);
                    throw updateError;
                  }

                  // Update the temporary item to show it's complete but keep it visible
                  setUploadingItems(prev => prev.map(item => 
                    item.item_id === itemId 
                      ? {
                          ...item,
                          title: generatedTitle,
                          category: analysisResult.data.category || 'Other',
                          condition: analysisResult.data.condition || 'Good',
                          ai_recommendation: analysisResult.data.recommendation || 'keep',
                          ai_rationale: analysisResult.data.rationale || 'AI analysis completed',
                          usage_score: analysisResult.data.usage_score,
                          sentiment: analysisResult.data.sentiment || 'neutral',
                          status: 'analyzed'
                        }
                      : item
                  ));
                  
                  // Remove from uploading items and refresh to show the saved item
                  setTimeout(() => {
                    setUploadingItems(prev => prev.filter(item => item.item_id !== itemId));
                    // Revalidate to get fresh data from database and show the item properly
                    revalidator.revalidate();
                  }, 1500);

                } catch (error) {
                  console.error('Error processing item:', error);
                  
                  // Show error message to user and update item
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                  
                  // Find the current itemId from the uploading items
                  const currentUploadingItem = uploadingItems.find(item => item.status === 'analyzing');
                  const currentItemId = currentUploadingItem?.item_id;

                  if (currentItemId) {
                    // Update the temporary item to show error
                    setUploadingItems(prev => prev.map(item => 
                      item.item_id === currentItemId 
                        ? {
                            ...item,
                            title: 'Analysis Failed',
                            category: 'Other',
                            status: 'error',
                            ai_recommendation: 'keep',
                            ai_rationale: errorMessage
                          }
                        : item
                    ));

                    // Update item in database with error state
                    try {
                      await browserClient
                        .from('lgb_items')
                        .update({
                          title: 'Analysis Failed',
                          category: 'Other',
                          condition: 'Good',
                          ai_recommendation: 'keep',
                          ai_rationale: errorMessage,
                          updated_at: new Date().toISOString()
                        })
                        .eq('item_id', currentItemId);
                    } catch (updateError) {
                      console.error('Error updating item with error state:', updateError);
                    }

                    // Remove from uploading items after showing error
                    setTimeout(() => {
                      setUploadingItems(prev => prev.filter(item => item.item_id !== currentItemId));
                      // Reduced revalidation to avoid page refresh
                    }, 3000); // Show error for 3 seconds
                  } else {
                    // Fallback: just remove any analyzing items
                    setUploadingItems(prev => prev.filter(item => item.status !== 'analyzing'));
                  }
                }
              }}
              maxPhotos={5}
            />
          </Card>
        )}

        {/* Items Grid */}
        {session?.scenario !== 'E' && session?.scenario !== 'B' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                Your Items ({allItems.length})
              </h2>
            </div>

            {allItems.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No items yet
                </h3>
                <p className="text-gray-600">
                  Start by uploading photos of items you want to declutter
                </p>
              </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allItems.map((item) => (
                <ItemCard 
                  key={item.item_id || item.temp_id}
                  item={item}
                  showDecisionControls={session?.scenario === 'A' && item.ai_recommendation && item.status !== 'analyzing'}
                    onDecisionChange={async (decision, reason) => {
                    try {
                      // If user chose "sell", get price suggestions first
                      if (decision === 'sell' && item.photos && item.photos.length > 0) {
                        console.log('Getting price suggestions for item:', item.item_id);
                        
                        try {
                          const priceResponse = await fetch('/api/ai/price-suggest', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              photos: item.photos,
                              title: item.title || 'Untitled Item',
                              category: item.category || 'Other',
                              condition: item.condition || 'Good',
                              context: {
                                region: (session as any)?.region || null,
                                scenario: session?.scenario
                              }
                            })
                          });

                          if (priceResponse.ok) {
                            const priceResult = await priceResponse.json();
                            console.log('Price suggestions received:', priceResult);

                            // Update item with both decision and price data
                            const { error } = await browserClient
                              .from('lgb_items')
                              .update({
                                decision: decision,
                                decision_reason: reason || null,
                                price_low: priceResult.data?.price_low || null,
                                price_mid: priceResult.data?.price_mid || null,
                                price_high: priceResult.data?.price_high || null,
                                price_confidence: priceResult.data?.confidence || null,
                                updated_at: new Date().toISOString()
                              })
                              .eq('item_id', item.item_id);

                            if (error) {
                              console.error('Error saving decision with pricing:', error);
                              return;
                            }
                          } else {
                            console.error('Price suggestion failed, saving decision without pricing');
                            // Save decision without pricing if API fails
                            const { error } = await browserClient
                              .from('lgb_items')
                              .update({
                                decision: decision,
                                decision_reason: reason || null,
                                updated_at: new Date().toISOString()
                              })
                              .eq('item_id', item.item_id);

                            if (error) {
                              console.error('Error saving decision:', error);
                              return;
                            }
                          }
                        } catch (priceError) {
                          console.error('Price suggestion error:', priceError);
                          // Save decision without pricing if API fails
                          const { error } = await browserClient
                            .from('lgb_items')
                            .update({
                              decision: decision,
                              decision_reason: reason || null,
                              updated_at: new Date().toISOString()
                            })
                            .eq('item_id', item.item_id);

                          if (error) {
                            console.error('Error saving decision:', error);
                            return;
                          }
                        }
                      } else {
                        // For non-sell decisions, just update the decision
                        const { error } = await browserClient
                          .from('lgb_items')
                          .update({
                            decision: decision,
                            decision_reason: reason || null,
                            updated_at: new Date().toISOString()
                          })
                          .eq('item_id', item.item_id);

                        if (error) {
                          console.error('Error saving decision:', error);
                          return;
                        }
                      }

                      // Refresh to show updated progress and pricing
                      revalidator.revalidate();
                    } catch (error) {
                      console.error('Error processing decision:', error);
                    }
                  }}
                />
              ))}
            </div>
          )}
          </div>
        )}

        {/* Scenario E: Show generated listings history if needed */}
        {session?.scenario === 'E' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Quick Listing Generator
              </h3>
              <p className="text-gray-600">
                Use the generator above to create marketplace listings instantly
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}