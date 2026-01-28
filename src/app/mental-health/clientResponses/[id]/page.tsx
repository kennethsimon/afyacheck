'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  User,
  Calendar,
  GraduationCap,
  HeartPulse,
  ArrowLeft,
  Brain,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type QuestionResponse = {
  question: { question_text: string };
  answer: string;
};

type UserData = {
  name: string;
  date: string;
  education_level: string;
  age: number;
  gender: string;
};

const UserResponsesPage: React.FC = () => {
  const [userResponses, setUserResponses] = useState<QuestionResponse[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [mentalStatus, setMentalStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchResponses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://atosclone.onrender.com/api/responses/${id}`);
        const data = await res.json();

        setUser(data.user);
        setUserResponses(data.responses || []);
        setTotalScore(data.total_score);
        setMentalStatus(data.mental_status);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id]);

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    if (statusLower.includes('good') || statusLower.includes('healthy')) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Good</Badge>;
    } else if (statusLower.includes('moderate') || statusLower.includes('mild')) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Moderate</Badge>;
    } else if (statusLower.includes('severe') || statusLower.includes('poor')) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Needs Attention</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/mental-health/viewClientData">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Client List
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-xl">
              <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Client Assessment Details
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.name || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">Loading client data...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* User Information and Status Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Information Card */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Assessment Date</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.date || 'N/A'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Education Level</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.education_level || 'N/A'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.age || 'N/A'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                      <Badge variant="outline" className="mt-1">
                        {user?.gender || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mental Health Status Card */}
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Assessment Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <HeartPulse className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {totalScore !== null ? totalScore : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mental Health Status</p>
                      {getStatusBadge(mentalStatus)}
                      {mentalStatus && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{mentalStatus}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Responses Table Card */}
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Assessment Responses
                </CardTitle>
                <CardDescription>
                  Detailed responses to all mental health assessment questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userResponses.length > 0 ? (
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-900">
                          <TableHead className="font-semibold w-2/3">Question</TableHead>
                          <TableHead className="font-semibold">Answer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userResponses.map((response, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <TableCell className="font-medium">
                              {response.question?.question_text || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal">
                                {response.answer || 'N/A'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No responses found for this client.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserResponsesPage;

