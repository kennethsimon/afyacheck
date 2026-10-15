'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  Brain,
  Frown,
  Bed,
  Pill,
  Activity,
  Users,
  HelpCircle,
  User,
  Calendar,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useState, useEffect } from 'react';

type Question = {
  _id: string;
  question_text: string;
  question_type: 'rating' | 'yes_no';
  icon: JSX.Element;
};

const QuestionnairePage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const iconMap = {
      depression: <Frown className="text-purple-700" />,
      sleep: <Bed className="text-blue-600" />,
      medication: <Pill className="text-red-600" />,
      activity: <Activity className="text-green-600" />,
      social: <Users className="text-pink-600" />,
      brain: <Brain className="text-indigo-600" />,
      default: <HelpCircle className="text-gray-500" />,
    };

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://atosclone.onrender.com/api/questions');
        const json = await res.json();

        if (json.status && json.data?.questions) {
          const questionsWithIcons = json.data.questions.map((q: any) => {
            const keyword = q.question_text.toLowerCase();
            let matchedIcon = iconMap.default;

            if (keyword.includes('depress')) matchedIcon = iconMap.depression;
            else if (keyword.includes('sleep')) matchedIcon = iconMap.sleep;
            else if (keyword.includes('medicat')) matchedIcon = iconMap.medication;
            else if (keyword.includes('active')) matchedIcon = iconMap.activity;
            else if (keyword.includes('social')) matchedIcon = iconMap.social;
            else if (keyword.includes('mental') || keyword.includes('brain')) matchedIcon = iconMap.brain;

            return { ...q, icon: matchedIcon };
          });

          setQuestions(questionsWithIcons);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (questionId: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [`answer_${questionId}`]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await fetch('https://atosclone.onrender.com/api/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setFormSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/mental-health">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Mental Health
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-xl">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Mental Health Assessment
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete the questionnaire to assess your mental well-being
              </p>
            </div>
          </div>
        </div>

        {!formSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information Card */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Please provide your basic information to begin the assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      onChange={handleInputChange}
                      className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education_level" className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      Education Level
                    </Label>
                    <Select name="education_level" required onValueChange={(value) => handleInputChange({ target: { name: 'education_level', value } } as any)}>
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Primary School">Primary School</SelectItem>
                        <SelectItem value="Secondary School">Secondary School</SelectItem>
                        <SelectItem value="College">College</SelectItem>
                        <SelectItem value="University">University</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="1"
                      required
                      onChange={handleInputChange}
                      placeholder="Enter your age"
                      className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select name="gender" required onValueChange={(value) => handleInputChange({ target: { name: 'gender', value } } as any)}>
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Card */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Assessment Questions
                </CardTitle>
                <CardDescription>
                  Please answer all questions honestly to get an accurate assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questions.map((q) => (
                      <div key={q._id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Label className="text-base font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          {q.icon}
                          {q.question_text}
                        </Label>
                        <RadioGroup
                          value={formData[`answer_${q._id}`] || ''}
                          onValueChange={(value) => handleRadioChange(q._id, value)}
                          className="mt-3"
                        >
                          <div className="flex flex-wrap gap-4">
                            {(q.question_type === 'rating'
                              ? ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
                              : ['Yes', 'No']
                            ).map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${q._id}-${option}`} />
                                <Label htmlFor={`${q._id}-${option}`} className="font-normal cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link href="/mental-health">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting || loading}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md min-w-[150px]"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Assessment'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <Card className="border-green-200 dark:border-green-800 max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Thank You!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Your mental health assessment has been successfully submitted. 
                  Your responses are confidential and will be reviewed by healthcare professionals.
                </p>
                <div className="flex gap-4 mt-6">
                  <Link href="/mental-health">
                    <Button variant="outline">Back to Mental Health</Button>
                  </Link>
                  <Link href="/mental-health/viewClientData">
                    <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                      View Client Data
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default QuestionnairePage;
