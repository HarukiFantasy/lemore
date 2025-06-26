import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  answers: Answer[];
  tags: string[];
}

interface Answer {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  isAccepted: boolean;
}

export default function AskAndAnswerPage() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      title: "Best places to buy second-hand furniture?",
      content: "I'm looking for affordable second-hand furniture in the area. Any recommendations for thrift stores or online platforms?",
      author: "Sarah M.",
      timestamp: "2 hours ago",
      tags: ["furniture", "shopping", "local"],
      answers: [
        {
          id: "1",
          content: "Check out the Goodwill on Main St. and the Salvation Army on Oak Ave. They have great furniture sections!",
          author: "Mike R.",
          timestamp: "1 hour ago",
          isAccepted: false,
        },
        {
          id: "2",
          content: "Facebook Marketplace is amazing for local deals. I got my dining table there for half the retail price.",
          author: "Lisa K.",
          timestamp: "30 min ago",
          isAccepted: true,
        },
      ],
    },
    {
      id: "2",
      title: "How to organize a community garage sale?",
      content: "Want to organize a neighborhood garage sale. What's the best way to coordinate with neighbors and promote it?",
      author: "David P.",
      timestamp: "5 hours ago",
      tags: ["community", "events", "organization"],
      answers: [
        {
          id: "3",
          content: "Start a WhatsApp group with your neighbors, set a date, and create flyers to post around the neighborhood.",
          author: "Emma T.",
          timestamp: "3 hours ago",
          isAccepted: false,
        },
      ],
    },
  ]);

  const [newQuestion, setNewQuestion] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const [newAnswer, setNewAnswer] = useState("");
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);
  const [showAskForm, setShowAskForm] = useState(false);

  const handleAskQuestion = () => {
    if (newQuestion.title.trim() && newQuestion.content.trim()) {
      const question: Question = {
        id: Date.now().toString(),
        title: newQuestion.title,
        content: newQuestion.content,
        author: "You",
        timestamp: "Just now",
        tags: newQuestion.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        answers: [],
      };
      setQuestions([question, ...questions]);
      setNewQuestion({ title: "", content: "", tags: "" });
      setShowAskForm(false);
    }
  };

  const handleSubmitAnswer = (questionId: string) => {
    if (newAnswer.trim()) {
      const answer: Answer = {
        id: Date.now().toString(),
        content: newAnswer,
        author: "You",
        timestamp: "Just now",
        isAccepted: false,
      };
      setQuestions(questions.map(q => 
        q.id === questionId 
          ? { ...q, answers: [...q.answers, answer] }
          : q
      ));
      setNewAnswer("");
      setAnsweringQuestion(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Ask & Answer</h1>
        <p className="text-muted-foreground">
          Get help from your community or share your knowledge with others
        </p>
      </div>

      {/* Ask Question Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => setShowAskForm(!showAskForm)}
          className="px-8"
        >
          {showAskForm ? "Cancel" : "Ask a Question"}
        </Button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ask Your Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question Title</label>
              <Input
                placeholder="What's your question?"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Details</label>
              <textarea
                className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Provide more details about your question..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tags (optional)</label>
              <Input
                placeholder="furniture, local, shopping (comma separated)"
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
              />
            </div>
            <Button onClick={handleAskQuestion} className="w-full">
              Post Question
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-6">
              {/* Question Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{question.title}</h3>
                  <p className="text-muted-foreground mb-3">{question.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {question.author}</span>
                    <span>•</span>
                    <span>{question.timestamp}</span>
                    <span>•</span>
                    <span>{question.answers.length} answers</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Answers */}
              {question.answers.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className="font-medium">Answers:</h4>
                  {question.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`p-3 rounded-lg border ${
                        answer.isAccepted ? "bg-green-50 border-green-200" : "bg-gray-50"
                      }`}
                    >
                      <p className="mb-2">{answer.content}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{answer.author}</span>
                        <span>•</span>
                        <span>{answer.timestamp}</span>
                        {answer.isAccepted && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">✓ Accepted</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Answer Form */}
              {answeringQuestion === question.id ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full min-h-[80px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Write your answer..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSubmitAnswer(question.id)}
                      size="sm"
                    >
                      Submit Answer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setAnsweringQuestion(null);
                        setNewAnswer("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAnsweringQuestion(question.id)}
                >
                  Answer This Question
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {questions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 