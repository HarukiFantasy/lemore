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
  const [isConversationComplete, setIsConversationComplete] = useState(false);
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
      // Stage 0: Initial feeling - Usage frequency
      [
        "I can really sense that feeling. It's totally natural to feel torn about items that have history with us. I'm curious - when was the last time you actually used this item?",
        "That's such an honest response, and I appreciate you sharing that with me. These decisions definitely aren't easy! Can you think back to when you last remember using this item?",
        "I hear you completely. These choices can feel overwhelming sometimes. Let me ask you this - when did you last find yourself reaching for this item?",
        "Your feelings are completely valid here. So many of us have been in this exact spot! Tell me, when was the most recent time you remember actually using this?",
        "I totally get where you're coming from. It's one of those decisions that just feels heavy, right? Help me understand - when did you last put this item to use?"
      ],
      // Stage 1: Usage frequency - Emotional attachment test
      [
        "Thanks for being so thoughtful about that. Now, let's try a little mental exercise - if you woke up tomorrow and this item had mysteriously vanished, what do you think your first reaction would be?",
        "That gives me some good insight! Here's an interesting way to think about it: imagine this item just disappeared overnight. How do you think you'd feel when you realized it was gone?",
        "I appreciate you taking the time to think through that. Let's explore this together - if this item suddenly wasn't there anymore, what emotions would come up for you?",
        "That's really helpful context, thank you! Now I'm wondering - picture waking up and this item is nowhere to be found. What would go through your mind in that moment?",
        "Gotcha, that paints a clear picture for me. Here's something to consider - if this item magically disappeared while you were sleeping, how would you react when you noticed?"
      ],
      // Stage 2: Emotional attachment - Keeping motivation
      [
        "That really shows me how you connect with your belongings. I'm curious now - what would you say is the main thing that's keeping this item in your life right now?",
        "Fascinating! That tells me quite a bit about your relationship with this item. What do you think is the primary reason it's still taking up space in your home?",
        "I love how thoughtful you are about this. So what's the biggest thing that's making it hard for you to part with this item?",
        "That's such valuable insight, thank you for sharing! Help me understand - what's the core reason this item is still part of your daily environment?",
        "Your perspective is really enlightening. I'm wondering - what's the main factor that's keeping you from saying goodbye to this item?"
      ],
      // Stage 3: Keeping motivation - Space impact
      [
        "That makes complete sense to me. Now, when you're in your space and you see this item sitting there, how does it make you feel? Does it bring you joy or does it feel like it's just... there?",
        "I can definitely understand that reasoning. Tell me, when you're moving around your home and your eyes land on this item, what kind of energy does it give off for you?",
        "That's a perfectly valid reason, honestly. I'm curious though - how does having this item in your space affect your overall mood about your home?",
        "You know what? That makes total sense. Let me ask you this - when you're tidying up or just relaxing at home, does seeing this item make you feel good or kind of 'meh'?",
        "I really appreciate how you're thinking through this. So when you're just living your daily life and this item is in your peripheral vision, what vibe does it give you?"
      ],
      // Stage 4: Space impact - Final consideration
      [
        "This has been such a thoughtful conversation! One last thing to explore - imagine someone close to you could really use this item and would treasure it. How would you feel about passing it along to them?",
        "You've been so reflective about all of this, I really admire that. Here's my final wondering - if a friend or family member would absolutely love having this item, what would your heart tell you to do?",
        "I'm really impressed by how much consideration you've given this decision. Last question: if you knew that giving this item away would genuinely brighten someone else's day, how would that feel to you?",
        "This conversation has been so insightful, thank you for being so open. One final thought - picture someone who would be thrilled to have this item. What comes up for you when you imagine gifting it to them?",
        "You've shared so much wisdom here, I'm grateful for your honesty. Here's my last question - if this item could bring real happiness to another person, would that change how you feel about letting it go?"
      ]
    ];

    if (stage >= responses.length) {
      const completionMessages = [
        "Thank you for sharing so openly with me. I have a really good understanding of your relationship with this item now. Let me analyze everything we've discussed and give you a personalized recommendation. This will just take a moment...",
        "Wow, this has been such a meaningful conversation! I feel like I really understand how you connect with your belongings. Give me just a moment to process everything you've shared and I'll have a thoughtful recommendation for you...",
        "I'm so grateful for your honesty throughout this conversation. You've given me such valuable insights into how you feel about this item. Let me take a moment to analyze our discussion and create a personalized recommendation just for you...",
        "This conversation has been incredibly insightful, thank you for being so thoughtful with your responses. I now have a clear picture of your situation. Let me put together a personalized recommendation based on everything we've explored together...",
        "You've been so wonderful to talk through this with! I really appreciate how openly you've shared your feelings. Now let me take everything we've discussed and create a recommendation that feels right for your unique situation..."
      ];
      
      return completionMessages[Math.floor(Math.random() * completionMessages.length)];
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

      // Check if this is the completion message
      const isCompletionMessage = aiResponse.includes('analyze everything we\'ve discussed');
      
      if (isCompletionMessage) {
        // This is the completion message - mark conversation as complete
        setIsConversationComplete(true);
        setTimeout(() => {
          onComplete([...messages, userMessage, aiMessage]);
        }, 2000);
      } else {
        // Normal question - increment stage for next question
        setConversationStage(prev => {
          console.log('Incrementing stage from', prev, 'to', prev + 1);
          return prev + 1;
        });
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
            disabled={isLoading || isConversationComplete}
            // Debug: add data attribute to see current stage
            data-conversation-stage={conversationStage}
            data-is-loading={isLoading}
            data-disable-check={isConversationComplete}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isLoading || isConversationComplete}
            size="sm"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            {isConversationComplete ? 'Conversation complete' : `Question ${conversationStage + 1} of 5`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}