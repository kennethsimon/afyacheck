'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
} from 'lucide-react';

import {FaVenusMars} from 'react-icons/fa';

type Question = {
  id: number;
  question_text: string;
  question_type: 'rating' | 'yes_no';
  icon: JSX.Element;
};

const questions: Question[] = [
  { id: 1, question_text: 'How often do you feel overwhelmed or stressed?', question_type: 'rating', icon: <Brain className="text-purple-600 animate-bounce" /> },
  { id: 2, question_text: 'How often do you feel sad or depressed?', question_type: 'rating', icon: <Frown className="text-blue-600 animate-pulse" /> },
  { id: 3, question_text: 'How often do you feel anxious or worried?', question_type: 'rating', icon: <Brain className="text-pink-600 animate-spin" /> },
  { id: 4, question_text: 'How often do you feel irritable or angry?', question_type: 'rating', icon: <Frown className="text-red-600 animate-bounce" /> },
  { id: 5, question_text: 'How often do you feel lonely or isolated?', question_type: 'rating', icon: <Users className="text-yellow-600 animate-pulse" /> },
  { id: 6, question_text: 'How often do you have trouble sleeping?', question_type: 'rating', icon: <Bed className="text-indigo-600 animate-bounce" /> },
  { id: 7, question_text: 'How often do you feel tired or fatigued?', question_type: 'rating', icon: <Bed className="text-indigo-400 animate-spin" /> },
  { id: 8, question_text: 'Do you often lack pleasure in activities you used to enjoy?', question_type: 'rating', icon: <Activity className="text-green-500 animate-pulse" /> },
  { id: 9, question_text: 'How often do you struggle with concentration or focus?', question_type: 'rating', icon: <Brain className="text-purple-500 animate-bounce" /> },
  { id: 10, question_text: 'Have you experienced any major life changes recently?', question_type: 'yes_no', icon: <HelpCircle className="text-orange-600 animate-pulse" /> },
  { id: 11, question_text: 'Have you ever sought professional help for mental health?', question_type: 'yes_no', icon: <Pill className="text-cyan-600 animate-bounce" /> },
  { id: 12, question_text: 'If yes, did it help?', question_type: 'yes_no', icon: <Pill className="text-cyan-400 animate-spin" /> },
  { id: 13, question_text: 'Do you have a support system (e.g., friends, family)?', question_type: 'yes_no', icon: <Users className="text-yellow-500 animate-bounce" /> },
  { id: 14, question_text: 'Are you currently on any mental health medication?', question_type: 'yes_no', icon: <Pill className="text-blue-500 animate-pulse" /> },
  { id: 15, question_text: 'Do you engage in self-care activities (e.g., exercise)?', question_type: 'yes_no', icon: <Activity className="text-lime-500 animate-bounce" /> },
  { id: 16, question_text: 'If yes, what activities do you enjoy?', question_type: 'yes_no', icon: <Activity className="text-lime-400 animate-spin" /> },
];

const QuestionnairePage = () => {
  const [formData, setFormData] = useState<any>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unanswered = questions.some((q) => !formData[`answer_${q.id}`]);
    if (unanswered) {
      alert('Please answer all the questions before submitting.');
      return;
    }
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 py-16 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <Image src="/AC.png" alt="Logo" width={600} height={200} />
        </div>

        <h2 className="text-center text-3xl font-semibold text-emerald-700 mb-8">
          Mental Health Assessment Form
        </h2>

        {!formSubmitted ? (
          <form onSubmit={handleSubmit}>
            {/* User Info */}
            <div className="bg-emerald-100 border-l-4 border-emerald-500 rounded p-6 mb-8">
              <h3 className="text-xl font-bold mb-4 text-emerald-800 flex items-center gap-2">
                <User className="text-emerald-600 animate-bounce" />
                User Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <User className="text-blue-600" size={16} /> Full Name
                  </label>
                  <input type="text" name="name" required onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="text-pink-600" size={16} /> Date
                  </label>
                  <input type="date" name="date" required onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <GraduationCap className="text-purple-600" size={16} /> Education Level
                  </label>
                  <select name="education_level" required onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded">
                    <option value="">-- Select --</option>
                    <option value="None">None</option>
                    <option value="Primary School">Primary School</option>
                    <option value="Secondary School">Secondary School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="text-orange-600" size={16} /> Age
                  </label>
                  <input type="number" name="age" min="1" required onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <FaVenusMars className="text-red-600" size={16} /> Gender
                  </label>
                  <select name="gender" required onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded">
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-emerald-800 mb-4">Mental Health Questions</h3>
              {questions.map((q) => (
                <div key={q.id} className="border border-green-800 rounded p-4 bg-blue-50">
                  <label className="block font-medium mb-2 text-gray-700 flex items-center gap-2">
                    {q.icon} {q.question_text}
                  </label>
                  <div className="space-y-1">
                    {(q.question_type === 'rating'
                      ? ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
                      : ['Yes', 'No']
                    ).map((option) => (
                      <label key={option} className="block">
                        <input type="radio" name={`answer_${q.id}`} value={option} onChange={handleInputChange} className="mr-2" />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold py-2 px-6 rounded transition">
                SUBMIT ASSESSMENT
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center mt-12">
            <h3 className="text-2xl font-semibold text-green-700">Thank you for completing the questionnaire.</h3>
            <p className="mt-2 text-gray-600">Your responses have been successfully submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnairePage;

