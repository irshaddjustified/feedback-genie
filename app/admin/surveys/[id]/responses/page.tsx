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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Eye,
  User,
  Calendar,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function SurveyResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch survey
        const surveyQuery = query(collection(db, "surveys"), where("id", "==", surveyId));
        const surveySnap = await getDocs(surveyQuery);
        if (!surveySnap.empty) {
          const surveyDoc = surveySnap.docs[0];
          setSurvey({ id: surveyDoc.id, ...surveyDoc.data() });
        }

        // Fetch responses for this survey
        const responsesQuery = query(collection(db, "responses"), where("surveyId", "==", surveyId));
        const responsesSnap = await getDocs(responsesQuery);
        const responsesList = responsesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResponses(responsesList);
        setFilteredResponses(responsesList);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      fetchData();
    }
  }, [surveyId]);

  // Filter responses based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = responses.filter((response) =>
        response.responderUid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.sentiment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.surveyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResponses(filtered);
    } else {
      setFilteredResponses(responses);
    }
  }, [searchTerm, responses]);

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

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Unknown Date";
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString();
    }
    return new Date(dateValue).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading responses...</p>
          </div>
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
            <h1 className="text-2xl font-bold">Survey Responses</h1>
            <p className="text-sm text-muted-foreground">
              {survey?.surveyName || "Survey"} • {filteredResponses.length} responses
            </p>
          </div>
        </div>
        {survey && (
          <Link href={`/admin/survey/${survey.id}`}>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Survey
            </Button>
          </Link>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search responses by user or sentiment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Responses ({filteredResponses.length})
            </CardTitle>
            <CardDescription>
              All responses submitted for this survey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredResponses.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No responses found</p>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Try a different search term"
                    : "No responses have been submitted yet"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {response.isAnonymous
                              ? "Anonymous"
                              : response.responderUid || "Unknown User"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {response.sentiment && (
                          <Badge variant={getSentimentBadgeVariant(response.sentiment)}>
                            {response.sentiment}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(response.submittedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {response.isAnonymous ? "Anonymous" : "Identified"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/responses/${response.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}