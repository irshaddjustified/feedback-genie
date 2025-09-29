"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Calendar,
  MessageSquare,
  Loader2,
  Eye,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

interface Question {
  id: string;
  type: string;
  text: string;
  required: boolean;
  options?: string[];
}

interface Survey {
  id: string;
  surveyName: string;
  surveyDescription: string;
  surveyType: string;
  questions: Question[];
  createdAt?: Date | { toDate: () => Date } | null;
}

interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyName: string;
  surveyType: string;
  responderUid: string | null;
  isAnonymous: boolean;
  data: Record<string, string | string[] | boolean>;
  sentiment: "positive" | "negative" | "neutral" | string;
  submittedAt: Date | { toDate: () => Date } | null;
}

export default function ResponseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const responseId = params.id as string;

  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch response
        const responseDoc = await getDoc(doc(db, "responses", responseId));
        if (responseDoc.exists()) {
          const responseData = { id: responseDoc.id, ...responseDoc.data() } as SurveyResponse;
          setResponse(responseData);

          // Fetch related survey
          if (responseData.surveyId) {
            const surveyQuery = query(
              collection(db, "surveys"),
              where("id", "==", responseData.surveyId)
            );
            const surveySnap = await getDocs(surveyQuery);
            if (!surveySnap.empty) {
              const surveyDoc = surveySnap.docs[0];
              setSurvey({ id: surveyDoc.id, ...surveyDoc.data() } as Survey);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load response:", error);
      } finally {
        setLoading(false);
      }
    };

    if (responseId) {
      fetchData();
    }
  }, [responseId]);

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "default";
      case "negative":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateValue: Date | { toDate: () => Date } | null): string => {
    if (!dateValue) return "Unknown Date";
    if (typeof dateValue === "object" && "toDate" in dateValue) {
      return dateValue.toDate().toLocaleString();
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleString();
    }
    return new Date(dateValue as any).toLocaleString();
  };

  const renderResponseValue = (value: string | string[] | boolean, questionType?: string): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (typeof value === "string") {
      return value || "No response";
    }
    return "No response";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading response...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-8">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Response Not Found</h2>
              <p className="text-muted-foreground">
                The response you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Response Details</h1>
            <p className="text-sm text-muted-foreground">
              {response.surveyName || "Survey Response"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {survey && (
            <>
              <Link href={`/admin/surveys/${survey.id}/responses`}>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  All Responses
                </Button>
              </Link>
              <Link href={`/admin/survey/${survey.id}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Survey
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Response Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Response Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Respondent</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {response.isAnonymous
                      ? "Anonymous"
                      : response.responderUid || "Unknown User"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(response.submittedAt)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Sentiment</p>
                {response.sentiment ? (
                  <Badge variant={getSentimentBadgeVariant(response.sentiment)}>
                    {response.sentiment}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Not analyzed</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Survey Information */}
        {survey && (
          <Card>
            <CardHeader>
              <CardTitle>Survey Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Survey Name</p>
                  <p className="font-medium">{survey.surveyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-muted-foreground">{survey.surveyDescription}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{survey.surveyType}</Badge>
                  <Badge variant={response.isAnonymous ? "secondary" : "default"}>
                    {response.isAnonymous ? "Anonymous" : "Identified"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response Data */}
        <Card>
          <CardHeader>
            <CardTitle>Response Data</CardTitle>
            <CardDescription>
              Answers provided by the respondent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {response.data && Object.keys(response.data).length > 0 ? (
                Object.entries(response.data).map(([questionId, answer], index) => {
                  const question = survey?.questions?.find((q: Question) => q.id === questionId);
                  return (
                    <div key={questionId} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Question {index + 1}
                        </span>
                        {question?.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">
                        {question?.text || `Question ${questionId}`}
                      </p>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">
                          {renderResponseValue(answer as string | string[] | boolean, question?.type)}
                        </p>
                      </div>
                      {index < Object.keys(response.data).length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No response data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}