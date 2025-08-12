import { useState } from 'react';
import { Card } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Textarea } from '~/common/components/ui/textarea';
import { 
  Heart, 
  ShoppingCart, 
  Gift, 
  Trash2, 
  Sparkles,
  DollarSign,
  MessageCircle 
} from 'lucide-react';
import type { ItemCardProps, ItemDecision } from '../types';
import { DecisionBar } from './DecisionBar';

export function ItemCard({ 
  item, 
  onDecisionChange, 
  showDecisionControls = false,
  showListings = false 
}: ItemCardProps) {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState(item.decision_reason || '');

  const handleDecisionChange = (decision: ItemDecision) => {
    if (decision === item.decision) {
      // Same decision clicked - show reason input
      setShowReason(true);
    } else {
      // New decision
      onDecisionChange?.(decision, reason);
      setShowReason(false);
    }
  };

  const handleReasonSubmit = () => {
    if (item.decision) {
      onDecisionChange?.(item.decision, reason);
    }
    setShowReason(false);
  };

  const getDecisionColor = (decision: ItemDecision) => {
    switch (decision) {
      case 'keep': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-blue-100 text-blue-800';
      case 'donate': return 'bg-purple-100 text-purple-800';
      case 'dispose': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDecisionIcon = (decision: ItemDecision) => {
    switch (decision) {
      case 'keep': return <Heart className="w-4 h-4" />;
      case 'sell': return <ShoppingCart className="w-4 h-4" />;
      case 'donate': return <Gift className="w-4 h-4" />;
      case 'dispose': return <Trash2 className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden">
      {/* Photo Gallery */}
      {item.photos && item.photos.length > 0 && (
        <div className="aspect-square bg-gray-100">
          <img
            src={item.photos[0]}
            alt={item.title || 'Item photo'}
            className="w-full h-full object-cover"
          />
          {item.photos.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{item.photos.length - 1} more
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 line-clamp-2">
              {item.title || 'Untitled Item'}
            </h3>
            {item.category && (
              <p className="text-sm text-gray-500 mt-1">{item.category}</p>
            )}
          </div>
          
          {item.decision && (
            <Badge className={`ml-2 ${getDecisionColor(item.decision)}`}>
              <span className="flex items-center gap-1">
                {getDecisionIcon(item.decision)}
                {item.decision.toUpperCase()}
              </span>
            </Badge>
          )}
        </div>

        {/* AI Analysis */}
        {item.ai_recommendation && (
          <div className="bg-purple-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">AI Recommendation</span>
            </div>
            <p className="text-sm text-purple-800">
              <strong>{item.ai_recommendation.toUpperCase()}</strong>
            </p>
            {item.ai_rationale && (
              <p className="text-xs text-purple-700">{item.ai_rationale}</p>
            )}
          </div>
        )}

        {/* Usage Score */}
        {typeof item.usage_score === 'number' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Usage Score:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${item.usage_score}%` }}
                />
              </div>
              <span className="font-medium">{item.usage_score}%</span>
            </div>
          </div>
        )}

        {/* Price Range */}
        {item.price_mid && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-700">
              {formatPrice(item.price_mid)}
              {item.price_low && item.price_high && (
                <span className="text-gray-500 font-normal">
                  {' '}({formatPrice(item.price_low)} - {formatPrice(item.price_high)})
                </span>
              )}
            </span>
            {item.price_confidence && (
              <span className="text-xs text-gray-500">
                {Math.round(item.price_confidence * 100)}% confidence
              </span>
            )}
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Notes</span>
            </div>
            <p className="text-sm text-gray-600">{item.notes}</p>
          </div>
        )}

        {/* Listings */}
        {showListings && item.listings && item.listings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Generated Listings:</h4>
            {item.listings.map((listing) => (
              <div key={listing.listing_id} className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{listing.lang.toUpperCase()}</Badge>
                </div>
                <h5 className="font-medium text-sm text-blue-900 mb-1">
                  {listing.title}
                </h5>
                <p className="text-xs text-blue-800 line-clamp-2">
                  {listing.body}
                </p>
                {listing.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {listing.hashtags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs text-blue-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Decision Controls */}
        {showDecisionControls && (
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <DecisionBar
              decision={item.decision}
              onDecisionChange={handleDecisionChange}
            />
            
            {/* Reason Input */}
            {showReason && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Why did you make this decision? (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReason(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReasonSubmit}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decision Reason */}
        {item.decision_reason && !showReason && (
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Decision reason:</span> {item.decision_reason}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}