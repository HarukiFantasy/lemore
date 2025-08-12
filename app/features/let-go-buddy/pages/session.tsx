import React, { useState } from 'react';
import { useParams, Link, Form, useActionData, redirect, useNavigate } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  BarChart3,
  Calendar,
  Package,
  DollarSign,
  Target,
  Clock
} from 'lucide-react';
import type { Route } from './+types/session';
import { makeSSRClient } from '~/supa-client';
import { ItemUploader } from '../components/ItemUploader';
import { ItemCard } from '../components/ItemCard';

export const meta: Route.MetaFunction = ({ params }) => {
  return [
    { title: `Session ${params.sessionId} - Let Go Buddy | Lemore` },
    { name: "description", content: "Manage your decluttering session with AI guidance." },
  ];
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const sessionId = params.sessionId;
  
  // Check if user is authenticated
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    throw redirect('/auth/login?redirect=/let-go-buddy');
  }
  
  // Get session details with items
  const { data: session, error } = await client
    .from('view_session_dashboard')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single();
  
  if (error || !session) {
    throw redirect('/let-go-buddy?error=session_not_found');
  }

  // Get session items
  const { data: items } = await client
    .from('lgb_items')
    .select(`
      *,
      lgb_item_photos (
        photo_id,
        photo_url,
        is_primary
      ),
      lgb_listings (
        listing_id,
        marketplace,
        status,
        price,
        listing_url
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  return { 
    session,
    items: items || []
  };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const sessionId = params.sessionId;
  
  const formData = await request.formData();
  const action = formData.get('action') as string;

  try {
    if (action === 'archive_session') {
      const { error } = await client
        .from('lgb_sessions')
        .update({ status: 'archived' })
        .eq('session_id', sessionId);

      if (error) throw error;
      return redirect('/let-go-buddy');
    }

    if (action === 'complete_session') {
      const { error } = await client
        .from('lgb_sessions')
        .update({ status: 'completed' })
        .eq('session_id', sessionId);

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
  const { session, items } = loaderData;
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const [uploadingItems, setUploadingItems] = useState<any[]>([]);

  const handleItemUploaded = (newItem: any) => {
    setUploadingItems(prev => prev.filter(item => item.temp_id !== newItem.temp_id));
    // Refresh the page to show new items
    navigate(`/let-go-buddy/session/${session.session_id}`, { replace: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCompletionPercentage = () => {
    if (session.item_count === 0) return 0;
    return Math.round((session.decided_count / session.item_count) * 100);
  };

  const allItems = [...items, ...uploadingItems];

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
                  {session.title || 'Untitled Session'}
                </h1>
                <Badge className={getStatusColor(session.status)}>
                  {session.status}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4">
                Scenario {session.scenario} • Created {new Date(session.created_at).toLocaleDateString()}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <div className="text-2xl font-bold">{session.item_count}</div>
                      <div className="text-sm text-gray-600">Items</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <div className="text-2xl font-bold">{session.decided_count}</div>
                      <div className="text-sm text-gray-600">Decided</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-purple-500 mr-2" />
                    <div>
                      <div className="text-2xl font-bold">
                        ${session.expected_revenue?.toFixed(0) || '0'}
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

              {/* Progress Bar */}
              {session.item_count > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {session.status === 'active' && (
                <>
                  <Form method="post">
                    <input type="hidden" name="action" value="complete_session" />
                    <Button type="submit" variant="outline">
                      <Target className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </Form>
                  
                  <Form method="post">
                    <input type="hidden" name="action" value="archive_session" />
                    <Button type="submit" variant="outline">
                      Archive
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

        {/* Item Upload Section */}
        {session.status === 'active' && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Items
            </h2>
            <ItemUploader 
              sessionId={session.session_id}
              onItemUploaded={handleItemUploaded}
              onItemsUploading={setUploadingItems}
            />
          </Card>
        )}

        {/* Items Grid */}
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
                  sessionId={session.session_id}
                  scenario={session.scenario}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}