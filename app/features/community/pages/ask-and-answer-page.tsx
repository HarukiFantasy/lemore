import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { 
  communityPostSchema, 
  commentSchema, 
  questionFiltersSchema,
  questionSchema,
  createQuestionSchema,
  createAnswerSchema,
  type CommunityPostData, 
  type CommentData,
  type Question,
  type QuestionFilters,
  type CreateQuestionData,
  type CreateAnswerData,
  VALID_QUESTION_CATEGORIES
} from "~/lib/schemas";
import { validateWithZod, formatTimeAgo } from "~/lib/utils";
import type { Route } from './+types/ask-and-answer-page';

// Mock database functions (실제 구현에서는 실제 데이터베이스 호출로 대체)
async function fetchQuestionsFromDatabase(filters: QuestionFilters): Promise<Question[]> {
  // TODO: 실제 데이터베이스 연결 코드로 교체
  // 예시: const questions = await db.questions.findMany({ where: filters });
  
  // 현재는 빈 배열 반환 (데이터베이스 연결 전까지)
  return [];
}

// Loader function
export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const url = new URL(request.url);
    const rawFilters = {
      category: url.searchParams.get("category") || "All",
      search: url.searchParams.get("search") || "",
      sortBy: url.searchParams.get("sortBy") || "newest",
    };

    // Zod를 사용한 데이터 검증
    const validationResult = validateWithZod(questionFiltersSchema, rawFilters);
    
    if (!validationResult.success) {
      throw new Response(`Validation error: ${validationResult.errors.join(", ")}`, { 
        status: 400 
      });
    }

    const validatedFilters = validationResult.data;

    // 데이터베이스에서 질문 가져오기
    const questions = await fetchQuestionsFromDatabase({
      category: validatedFilters.category || "All",
      search: validatedFilters.search || "",
      sortBy: validatedFilters.sortBy || "newest",
    });

    // 각 질문 검증
    const validatedQuestions = questions.map(question => {
      const questionValidation = validateWithZod(questionSchema, question);
      if (!questionValidation.success) {
        throw new Response(`Invalid question data: ${questionValidation.errors.join(", ")}`, { 
          status: 500 
        });
      }
      return questionValidation.data;
    });

    return {
      questions: validatedQuestions,
      filters: validatedFilters,
      totalCount: validatedQuestions.length,
      validCategories: VALID_QUESTION_CATEGORIES
    };

  } catch (error) {
    console.error("Loader error:", error);
    
    if (error instanceof Response) {
      // 이미 Response 객체인 경우 그대로 던지기
      throw error;
    }
    
    if (error instanceof Error) {
      // 데이터베이스 에러인 경우 500 Internal Server Error 반환
      if (error.message.includes("Failed to fetch questions from database")) {
        throw new Response("Database connection failed", { status: 500 });
      }
    }
    
    // 기타 에러는 500 Internal Server Error 반환
    throw new Response("Internal server error", { status: 500 });
  }
};

// Error Boundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred while loading questions.";

  if (error instanceof Response) {
    if (error.status === 400) {
      message = "Invalid Request";
      details = error.statusText || "The request contains invalid parameters.";
    } else if (error.status === 500) {
      message = "Server Error";
      details = "An internal server error occurred. Please try again later.";
    }
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{message}</h1>
            <p className="text-gray-600 mb-6">{details}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AskAndAnswerPage({ loaderData }: Route.ComponentProps) {
  const { questions: initialQuestions, filters, totalCount, validCategories } = loaderData;
  
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const [newAnswer, setNewAnswer] = useState("");
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [answerErrors, setAnswerErrors] = useState<string>("");

  // Filter questions based on search query
  const filteredQuestions = questions.filter(question => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      question.title.toLowerCase().includes(query) ||
      question.content.toLowerCase().includes(query) ||
      question.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const validateQuestion = (): boolean => {
    const questionData: CreateQuestionData = {
      title: newQuestion.title,
      content: newQuestion.content,
      tags: newQuestion.tags,
    };

    const result = createQuestionSchema.safeParse(questionData);
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        const field = error.path.join('.');
        newErrors[field] = error.message;
      });
      setQuestionErrors(newErrors);
      return false;
    }

    // Validate tags separately
    if (newQuestion.tags) {
      const tags = newQuestion.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      if (tags.length > 5) {
        setQuestionErrors({ ...questionErrors, tags: "Maximum 5 tags allowed" });
        return false;
      }
      for (const tag of tags) {
        if (tag.length > 20) {
          setQuestionErrors({ ...questionErrors, tags: "Each tag must be less than 20 characters" });
          return false;
        }
      }
    }
    
    setQuestionErrors({});
    return true;
  };

  const validateAnswer = (): boolean => {
    const answerData: CreateAnswerData = {
      content: newAnswer,
    };

    const result = createAnswerSchema.safeParse(answerData);
    
    if (!result.success) {
      setAnswerErrors(result.error.errors[0]?.message || "Invalid answer");
      return false;
    }
    
    setAnswerErrors("");
    return true;
  };

  const handleAskQuestion = () => {
    if (!validateQuestion()) {
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      title: newQuestion.title,
      content: newQuestion.content,
      author: "You",
      timestamp: "Just now",
      tags: newQuestion.tags ? newQuestion.tags.split(",").map(tag => tag.trim()).filter(tag => tag) : [],
      answers: [],
    };
    setQuestions([question, ...questions]);
    setNewQuestion({ title: "", content: "", tags: "" });
    setShowAskForm(false);
  };

  const handleSubmitAnswer = (questionId: string) => {
    if (!validateAnswer()) {
      return;
    }

    const answer = {
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

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Search Questions</label>
          <Input
            type="text"
            placeholder="Search questions, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Results Statistics */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Found <span className="font-semibold text-blue-600">{filteredQuestions.length}</span> question{filteredQuestions.length !== 1 ? 's' : ''}
          {searchQuery && (
            <span className="ml-2">
              for "<span className="font-medium">{searchQuery}</span>"
            </span>
          )}
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
                className={questionErrors.title ? "border-red-500" : ""}
              />
              {questionErrors.title && <span className="text-xs text-red-500 mt-1">{questionErrors.title}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Details</label>
              <textarea
                className={`w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring ${questionErrors.content ? "border-red-500" : ""}`}
                placeholder="Provide more details about your question..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
              />
              {questionErrors.content && <span className="text-xs text-red-500 mt-1">{questionErrors.content}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tags (optional)</label>
              <Input
                placeholder="furniture, local, shopping (comma separated)"
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                className={questionErrors.tags ? "border-red-500" : ""}
              />
              {questionErrors.tags && <span className="text-xs text-red-500 mt-1">{questionErrors.tags}</span>}
            </div>
            <Button onClick={handleAskQuestion} className="w-full">
              Post Question
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
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
                    className={`w-full min-h-[80px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring ${answerErrors ? "border-red-500" : ""}`}
                    placeholder="Write your answer..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                  />
                  {answerErrors && <span className="text-xs text-red-500">{answerErrors}</span>}
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
                        setAnswerErrors("");
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
      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            {searchQuery ? (
              <div>
                <p className="text-muted-foreground mb-4">
                  No questions found for "<span className="font-medium">{searchQuery}</span>"
                </p>
                <Button 
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 