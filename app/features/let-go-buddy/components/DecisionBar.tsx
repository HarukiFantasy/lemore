import { Button } from '~/common/components/ui/button';
import { Heart, ShoppingCart, Gift, Trash2 } from 'lucide-react';
import type { DecisionBarProps, ItemDecision } from '../types';

export function DecisionBar({ 
  decision, 
  onDecisionChange, 
  disabled = false 
}: DecisionBarProps) {
  const decisions: { 
    key: ItemDecision; 
    label: string; 
    icon: React.ReactNode; 
    color: string;
    description: string;
  }[] = [
    {
      key: 'keep',
      label: 'Keep',
      icon: <Heart className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      description: 'I still need this'
    },
    {
      key: 'sell',
      label: 'Sell',
      icon: <ShoppingCart className="w-4 h-4" />,
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      description: 'Make some money'
    },
    {
      key: 'donate',
      label: 'Donate',
      icon: <Gift className="w-4 h-4" />,
      color: 'bg-purple-500 hover:bg-purple-600 text-white',
      description: 'Help someone else'
    },
    {
      key: 'dispose',
      label: 'Dispose',
      icon: <Trash2 className="w-4 h-4" />,
      color: 'bg-gray-500 hover:bg-gray-600 text-white',
      description: 'Time to let go'
    }
  ];

  const handleDecisionClick = (decisionKey: ItemDecision) => {
    onDecisionChange(decisionKey);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 text-center">
        What would you like to do with this item?
      </h4>
      
      <div className="grid grid-cols-2 gap-2">
        {decisions.map((item) => {
          const isSelected = decision === item.key;
          
          return (
            <Button
              key={item.key}
              variant={isSelected ? "default" : "outline"}
              className={`flex flex-col items-center gap-2 h-auto py-3 px-2 transition-all ${
                isSelected 
                  ? item.color
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => handleDecisionClick(item.key)}
              disabled={disabled}
            >
              <div className="flex items-center gap-1">
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              <span className={`text-xs ${
                isSelected ? 'text-white/90' : 'text-gray-500'
              }`}>
                {item.description}
              </span>
            </Button>
          );
        })}
      </div>
      
      {decision && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            You chose to <strong className="text-gray-900">{decision}</strong> this item
          </p>
        </div>
      )}
    </div>
  );
}