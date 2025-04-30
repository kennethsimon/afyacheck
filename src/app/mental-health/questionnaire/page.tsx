'use client';

import React, { useState } from 'react';
import Image from 'next/image';

type Question = {
  id: number;
  question_text: string;
  question_type: 'rating' | 'yes_no';
};

const questions: Question[] = [
  {
    id: 1,
    question_text: 'How often do you feel overwhelmed or stressed?',
    question_type: 'rating',
  },

  {
    id: 2,
    question_text: 'How often do you feel sad or depressed?',
    question_type: 'rating',
  },

  {
    id: 3,
    question_text: 'How often do you feel anxious or worried?',
    question_type: 'rating',
  },

  {
    id: 4,
    question_text: 'How often do you feel irritable or angry?',
    question_type: 'rating',
  },

  {
    id: 5,
    question_text: 'How often do you feel lonely or isolated?',
    question_type: 'rating',
  },

  {
    id: 6,
    question_text: 'How often do you have trouble sleeping?',
    question_type: 'rating',
  },

  {
    id: 7,
    question_text: 'How often do you feel tired or fatigued?',
    question_type: 'rating',
  },

  {
    id: 8,
    question_text: 'Do you often feel lack of pleasure or interest in activities you used to enjoy?',
    question_type: 'rating',
  },

  {
    id: 9,
    question_text: 'How often do you have trouble concentrating or focusing?',
    question_type: 'rating',
  },

  {
    id: 10,
    question_text: 'Have you experienced  any major life change recently?',
    question_type: 'yes_no',
  },
  
  {
    id: 11,
    question_text: 'Have you sought professional help for mental health before?',
    question_type: 'yes_no',
  },

  {
    id: 12,
    question_text: 'If the answer for previous question is yes , did it help?',
    question_type: 'yes_no',
  },

  {
    id: 13,
    question_text: 'Do you have a support system? (eg.Friends, family)',
    question_type: 'yes_no',
  },

  {
    id: 14,
    question_text: 'Are you on medications on mental health issues?',
    question_type: 'yes_no',
  },

  {
    id: 15,
    question_text: 'Do you engage in any selfcare activities? Eg. exercises',
    question_type: 'yes_no',
  },

  {
    id: 16,
    question_text: 'If yes , which activity do you enjoy?',
    question_type: 'yes_no',
  },
  
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

    const unanswered = questions.some(q => !formData[`answer_${q.id}`]);

    if (unanswered) {
      alert('Please answer all the questions.');
      return;
    }

    setFormSubmitted(true);
    alert('FORM SUBMITTED SUCCESSFULLY..!!');
  };

  return (
    <div className="container mx-auto mt-10 p-4 max-w-2xl">
      <div className="flex justify-center mb-4">
        <Image src="/AC.png" alt="Logo" width={300} height={80} />
      </div>

      <h2 className="text-center text-2xl font-bold mb-6">MENTAL HEALTH QUESTIONNAIRE</h2>

      <form onSubmit={handleSubmit}>
        <h4 className="text-xl font-bold text-center mb-4">User Information</h4>
        <div className="border-4 border-blue-700 rounded-lg p-6 mb-6 mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-6">
            <label className="font-bold">NAME : </label>
            <input
              type="text"
              name="name"
              required
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-3">
            <label className="font-bold">DATE : </label>
            <input
              type="date"
              name="date"
              required
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-3">
            <label className="font-bold">EDUCATION LEVEL : </label>
            <select
              name="education_level"
              required
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select --</option>
              <option value="None">None</option>
              <option value="Primary School">Primary School</option>
              <option value="Secondary School">Secondary School</option>
              <option value="College">College</option>
              <option value="University">University</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="font-bold">AGE : </label>
            <input
              type="number"
              name="age"
              min="1"
              required
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-3">
            <label className="font-bold">GENDER : </label>
            <select
              name="gender"
              required
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <h4 className="text-lg font-semibold mb-4">Please answer the following questions:</h4>

        {questions.map((question) => (
          <div key={question.id} className="mb-4 border p-4 rounded-lg">
            <label className="font-bold block mb-2">{question.question_text}</label>
            {question.question_type === 'rating' ? (
              ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'].map((option) => (
                <label key={option} className="block mb-1">
                  <input
                    type="radio"
                    name={`answer_${question.id}`}
                    value={option}
                    onChange={handleInputChange}
                  />{' '}
                  {option}
                </label>
              ))
            ) : (
              ['Yes', 'No'].map((option) => (
                <label key={option} className="block mb-1">
                  <input
                    type="radio"
                    name={`answer_${question.id}`}
                    value={option}
                    onChange={handleInputChange}
                  />{' '}
                  {option}
                </label>
              ))
            )}
          </div>
        ))}

        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-2 text-xl rounded hover:bg-blue-700"
          >
            SUBMIT
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionnairePage;
