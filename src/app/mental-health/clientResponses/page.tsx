'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaUserCircle, FaCalendarAlt, FaGraduationCap, FaBirthdayCake, FaVenusMars, FaHeartbeat, FaArrowLeft } from 'react-icons/fa';

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

type Props = {
  user?: UserData;
  total_score?: number;
  mental_status?: string;
  user_responses?: QuestionResponse[];
};

const UserResponsesPage: React.FC<Props> = ({
  user = {
    name: 'Test User',
    date: '2025-05-08',
    education_level: 'High School',
    age: 25,
    gender: 'Male',
  },
  total_score = 10,
  mental_status = 'Mild Anxiety',
  user_responses = [
    {
      question: { question_text: 'Do you feel stressed frequently?' },
      answer: 'Sometimes',
    },
    {
      question: { question_text: 'How often do you feel happy?' },
      answer: 'Often',
    },
  ],
}) => {
  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 py-10 px-4">
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image src="/AC.png" alt="Logo" width={600} height={200} />
      </div>

      {/* Header and Back Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-black flex items-center">
          <FaUserCircle className="mr-2" /> Client: {user.name}
        </h2>
        <Link
          href="/mental-health/viewClientData"
          className="flex items-center bg-blue-800 hover:bg-blue-900 text-white font-bold px-4 py-2 rounded transition duration-300"
        >
          <FaArrowLeft className="mr-2" /> Back to List
        </Link>
      </div>

      {/* Info and Status Tables */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
        {/* User Info */}
        <div className="w-full lg:w-1/2 bg-emerald-100 rounded-lg shadow-lg p-4">
          <h4 className="mb-4 font-semibold text-lg text-blue-800">USER INFORMATION</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <FaUserCircle className="mr-2 text-blue-600" /> <strong>Name:</strong> {user.name}
            </li>
            <li className="flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" /> <strong>Date:</strong> {user.date}
            </li>
            <li className="flex items-center">
              <FaGraduationCap className="mr-2 text-blue-600" /> <strong>Education Level:</strong> {user.education_level}
            </li>
            <li className="flex items-center">
              <FaBirthdayCake className="mr-2 text-blue-600" /> <strong>Age:</strong> {user.age}
            </li>
            <li className="flex items-center">
              <FaVenusMars className="mr-2 text-blue-600" /> <strong>Gender:</strong> {user.gender}
            </li>
          </ul>
        </div>

        {/* Mental Health Status */}
        <div className="w-full lg:w-1/2 bg-emerald-100 rounded-lg shadow-lg p-4">
          <h4 className="mb-4 font-semibold text-lg text-blue-800">MENTAL HEALTH STATUS</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <FaHeartbeat className="mr-2 text-red-600 animate-pulse" /> <strong>Total Score:</strong> {total_score}
            </li>
            <li className="flex items-center">
              <FaHeartbeat className="mr-2 text-red-600 animate-pulse" /> <strong>Status:</strong> {mental_status}
            </li>
          </ul>
        </div>
      </div>

      {/* Responses */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h4 className="mb-4 font-semibold text-lg text-blue-800">Responses</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-700">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-2">Question</th>
                <th className="px-4 py-2">Answer</th>
              </tr>
            </thead>
            <tbody>
              {user_responses.map((response, index) => (
                <tr key={index} className="border-b hover:bg-blue-100 transition duration-300">
                  <td className="px-4 py-2">{response.question.question_text}</td>
                  <td className="px-4 py-2">{response.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
};

export default UserResponsesPage;
