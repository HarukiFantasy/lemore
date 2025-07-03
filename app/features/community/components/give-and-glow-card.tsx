import { Card, CardContent } from "../../../common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { getCategoryColors } from "~/lib/utils";

// Props interface for the component
interface GiveAndGlowCardProps {
  id: string;
  itemName: string;
  itemCategory: string;
  giverName: string;
  giverAvatar?: string;
  receiverName: string;
  receiverAvatar?: string;
  rating: number;
  review: string;
  timestamp: string;
  location: string;
  tags: string[];
  appreciationBadge?: boolean;
}

// Star rating component
const renderStars = (rating: number) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export function GiveAndGlowCard({
  id,
  itemName,
  itemCategory,
  giverName,
  giverAvatar = "/sample.png",
  receiverName,
  receiverAvatar = "/sample.png",
  rating,
  review,
  timestamp,
  location,
  tags,
  appreciationBadge = false
}: GiveAndGlowCardProps) {
  return (
    <Card className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg w-full">
      <CardContent className="py-1">
        <div className="flex items-start gap-4">
          {/* Giver Avatar */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={giverAvatar} alt={giverName} />
              <AvatarFallback>{giverName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            {/* Review Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{itemName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Given by {giverName}</span>
                  <span>•</span>
                  <span>{location}</span>
                  <span>•</span>
                  <span>{timestamp}</span>
                </div>
              </div>
            </div>
            
            {/* Rating and Category */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                {renderStars(rating)}
                <span className="text-sm text-gray-600">{rating}/5</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${(() => {
                const colors = getCategoryColors(itemCategory);
                return `${colors.bg} ${colors.text} ${colors.border}`;
              })()}`}>
                {itemCategory}
              </span>
              {appreciationBadge && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Appreciation Badge
                </span>
              )}
            </div>
            
            {/* Review Content */}
            <p className="text-gray-700 mb-4 leading-relaxed">{review}</p>
            
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Receiver Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={receiverAvatar} alt={receiverName} />
                    <AvatarFallback>{receiverName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </div>
                <span>Reviewed by {receiverName}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 