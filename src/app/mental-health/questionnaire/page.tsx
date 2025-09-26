'use client';
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
import { FaVenusMars } from 'react-icons/fa';
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
    }
  };

  fetchQuestions();
}, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload
    try {
      await fetch('https://atosclone.onrender.com/api/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setFormSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 py-16 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <Image src="/AFYACHECK-transformed.png" alt="Logo" width={600} height={200} />
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
                <div key={q._id} className="border border-green-800 rounded p-4 bg-blue-50">
                  <label className="block font-medium mb-2 text-gray-700 flex items-center gap-2">
                    {/* You must map `q.icon_name` to an actual icon element if `icon` is not part of backend */}
                    {q.icon} {q.question_text}
                  </label>
                  <div className="space-y-1">
                    {(q.question_type === 'rating'
                      ? ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
                      : ['Yes', 'No']
                    ).map((option) => (
                      <label key={option} className="block">
                        <input type="radio" name={`answer_${q._id}`} value={option} onChange={handleInputChange} className="mr-2" />
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
