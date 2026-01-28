'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, FileText, ArrowRight, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MentalHealthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-xl">
              <Brain className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                Mental Health Assessment
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Comprehensive mental well-being evaluation
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Start Assessment Card */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Start Assessment</CardTitle>
              </div>
              <CardDescription className="text-base">
                Complete a comprehensive mental health questionnaire to assess your well-being
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/mental-health/questionnaire">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md"
                >
                  Begin Questionnaire
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* View Client Data Card */}
          <Card className="border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg">
                  <HeartPulse className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-2xl">View Client Data</CardTitle>
              </div>
              <CardDescription className="text-base">
                Access and review mental health assessment responses and client information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/mental-health/viewClientData">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950"
                >
                  View Clients
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    About Mental Health Assessment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our mental health assessment tool helps you understand your mental well-being through 
                    a series of carefully designed questions. Your responses are confidential and will help 
                    healthcare professionals provide appropriate support and guidance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Projects Link */}
        <div className="mt-8 text-center">
          <Link href="/project">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              ← Back to Health Programs
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default MentalHealthPage;
