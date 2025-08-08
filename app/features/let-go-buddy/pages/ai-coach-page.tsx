import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Link } from 'react-router';
import { BrainIcon, CalendarIcon, HeartIcon, StarIcon } from 'lucide-react';
import { getAllAIAnalysisResults } from '../queries';
import { makeSSRClient } from '~/supa-client';
import type { Route } from './+types/ai-coach-page';
import { DateTime } from 'luxon';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "AI Coach | Lemore" },
    { name: "description", content: "View all your AI decluttering analysis results" },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  
  // Get current user
  const { data: { user }, error: authError } = await client.auth.getUser();
  
  if (authError || !user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  try {
    const analysisResults = await getAllAIAnalysisResults(client, user.id);
    return { analysisResults, user };
  } catch (error) {
    console.error('Error loading AI coach data:', error);
    return { analysisResults: [], user };
  }
};

export default function AICoachPage({ loaderData }: Route.ComponentProps) {
  const { analysisResults } = loaderData;

  // Helper function to get emotion color
  const getEmotionColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800';
    if (score >= 6) return 'bg-orange-100 text-orange-800';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800';
    if (score >= 2) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  // Helper function to get recommendation color
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'sell': return 'bg-green-100 text-green-800 border-green-200';
      case 'donate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'keep': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'discard': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'repair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'repurpose': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  // Get first image from images array
  const getItemImage = (images: any) => {
    if (Array.isArray(images) && images.length > 0) {
      return images[0];
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BrainIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Coach Results</h1>
              <p className="text-gray-600">Your decluttering journey insights</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Items Analyzed</p>
                    <p className="text-2xl font-bold text-gray-900">{analysisResults.length}</p>
                  </div>
                  <StarIcon className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Emotional Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResults.length > 0 
                        ? (analysisResults.reduce((sum, item) => sum + (item.emotional_score || 0), 0) / analysisResults.length).toFixed(1)
                        : '0'
                      }
                    </p>
                  </div>
                  <HeartIcon className="w-8 h-8 text-rose-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Most Common Action</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResults.length > 0 
                        ? (() => {
                            const counts = analysisResults.reduce((acc, item) => {
                              acc[item.recommendation] = (acc[item.recommendation] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);
                            return Object.entries(counts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';
                          })()
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results List */}
        {analysisResults.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <BrainIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Analysis Results Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start your decluttering journey with Let Go Buddy to see your AI coach results here.
                </p>
                <Button asChild>
                  <Link to="/let-go-buddy">Start Decluttering</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analysisResults.map((result: any) => {
              const itemImage = getItemImage(result.images);
              
              return (
                <Card key={result.analysis_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {itemImage ? (
                            <img 
                              src={itemImage} 
                              alt={result.item_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <StarIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{result.item_name}</h3>
                            <p className="text-sm text-gray-600">
                              {DateTime.fromISO(result.created_at).toLocaleString(DateTime.DATE_MED)}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getRecommendationColor(result.recommendation)}>
                              {result.recommendation}
                            </Badge>
                            <Badge className={getEmotionColor(result.emotional_score)}>
                              Emotional Score: {result.emotional_score}/10
                            </Badge>
                          </div>
                        </div>

                        {/* Recommendation Reason */}
                        {result.recommendation_reason && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">
                              <strong>AI Recommendation:</strong> {result.recommendation_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {analysisResults.length > 0 && (
          <div className="mt-8 text-center">
            <Button asChild className="mr-4">
              <Link to="/let-go-buddy">Continue Decluttering</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/my/dashboard">View Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}