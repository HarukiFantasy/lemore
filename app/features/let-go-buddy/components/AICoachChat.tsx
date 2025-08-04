import { useState, useRef, useEffect } from 'react';
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent } from "~/common/components/ui/card";
import { ScrollArea } from "~/common/components/ui/scroll-area";
import { PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface AICoachChatProps {
  itemName?: string;
  situation: string;
  onComplete: (conversationData: ChatMessage[]) => void;
}

export default function AICoachChat({ itemName, situation, onComplete }: AICoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStage, setConversationStage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: '1',
      type: 'ai',
      content: `Hi! I'm Joy, your declutter buddy! I can see you've uploaded a photo${itemName ? ` of your ${itemName}` : ''}. You mentioned you're in "${situation}" mode. I'm here to help you make a confident decision about what to do with this item. How are you feeling about it right now?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [itemName, situation]);

  const getNextAIMessage = (userMessage: string, stage: number): string => {
    const responses = [
      // Stage 0: Initial feeling
      [
        "I understand that feeling. It's completely normal to feel uncertain about items that have been part of our lives. Let me ask you - when was the last time you remember actually using this item?",
        "That's a very honest response. Many people struggle with these decisions. Can you tell me when you last remember using this item?",
        "I hear you. These decisions can be tricky. To help you think through this, when did you last use this item?"
      ],
      // Stage 1: Usage frequency  
      [
        "Thank you for sharing that. Now, I'd like you to imagine something - if this item disappeared tomorrow, what would your first reaction be?",
        "That's helpful context. Here's something to consider: if you woke up tomorrow and this item was gone, how would you feel?",
        "Got it. Let's try a thought experiment - if this item vanished overnight, what would go through your mind?"
      ],
      // Stage 2: Emotional attachment
      [
        "That tells me a lot about your connection to this item. Now, what would you say is the main reason you're keeping it right now?",
        "Interesting perspective. What's the primary reason this item is still in your space?",
        "I appreciate your honesty. What's the biggest factor keeping you from letting this go?"
      ],
      // Stage 3: Keeping motivation
      [
        "That makes sense. How does having this item in your space make you feel? Does it add to your environment or take away from it?",
        "I understand. When you look around your space and see this item, what feeling does it give you?",
        "Thank you for explaining. How does this item affect the way you feel about your living space?"
      ],
      // Stage 4: Space impact
      [
        "One final thought experiment: if someone you cared about could really benefit from having this item, how would you feel about giving it to them?",
        "Last question to help clarify your feelings: imagine a friend or family member could get real value from this item - what would you want to do?",
        "Here's my final question: if giving this item to someone who truly needed it would make their day, how would that sit with you?"
      ]
    ];

    if (stage >= responses.length) {
      return "Thank you for sharing so openly with me. I have a good understanding of your relationship with this item now. Let me analyze everything we've discussed and give you a personalized recommendation. This will just take a moment...";
    }

    // Simple response selection based on message length/content
    const stageResponses = responses[stage];
    return stageResponses[Math.floor(Math.random() * stageResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = getNextAIMessage(userMessage.content, conversationStage);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

      // Check if conversation is complete
      if (conversationStage >= 4) {
        // Complete after the final AI message
        setTimeout(() => {
          onComplete([...messages, userMessage, aiMessage]);
        }, 2000);
      } else {
        setConversationStage(prev => prev + 1);
      }
    }, 1000 + Math.random() * 1000); // 1-2 second delay for natural feel
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[70vh] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 mb-4 h-0">
          <div className="space-y-3 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg break-words ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-1">
                    <SparklesIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-600">Joy</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-2">
              <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-600">Joy</span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2 mt-auto">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts..."
            disabled={isLoading || conversationStage >= 5}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isLoading || conversationStage >= 5}
            size="sm"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            {conversationStage >= 5 ? 'Conversation complete' : `Question ${Math.min(conversationStage + 1, 5)} of 5`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}