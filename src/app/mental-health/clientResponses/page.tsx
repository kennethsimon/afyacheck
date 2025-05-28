'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FaUserCircle,
  FaCalendarAlt,
  FaGraduationCap,
  FaBirthdayCake,
  FaVenusMars,
  FaHeartbeat,
  FaArrowLeft,
} from 'react-icons/fa';

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
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    const fetchResponses = async () => {
      try {
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
            <FaUserCircle className="mr-2" /> Client: {user?.name || 'Loading...'}
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
                <FaUserCircle className="mr-2 text-blue-600" /> <strong>Name:</strong> {user?.name}
              </li>
              <li className="flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" /> <strong>Date:</strong> {user?.date}
              </li>
              <li className="flex items-center">
                <FaGraduationCap className="mr-2 text-blue-600" /> <strong>Education Level:</strong> {user?.education_level}
              </li>
              <li className="flex items-center">
                <FaBirthdayCake className="mr-2 text-blue-600" /> <strong>Age:</strong> {user?.age}
              </li>
              <li className="flex items-center">
                <FaVenusMars className="mr-2 text-blue-600" /> <strong>Gender:</strong> {user?.gender}
              </li>
            </ul>
          </div>

          {/* Mental Health Status */}
          <div className="w-full lg:w-1/2 bg-emerald-100 rounded-lg shadow-lg p-4">
            <h4 className="mb-4 font-semibold text-lg text-blue-800">MENTAL HEALTH STATUS</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <FaHeartbeat className="mr-2 text-red-600 animate-pulse" /> <strong>Total Score:</strong> {totalScore ?? 'Loading...'}
              </li>
              <li className="flex items-center">
                <FaHeartbeat className="mr-2 text-red-600 animate-pulse" /> <strong>Status:</strong> {mentalStatus ?? 'Loading...'}
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
                {loading ? (
                  <tr>
                    <td className="px-4 py-2" colSpan={2}>Loading responses...</td>
                  </tr>
                ) : userResponses.length > 0 ? (
                  userResponses.map((response, index) => (
                    <tr key={index} className="border-b hover:bg-blue-100 transition duration-300">
                      <td className="px-4 py-2">{response.question.question_text}</td>
                      <td className="px-4 py-2">{response.answer}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-2" colSpan={2}>No responses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserResponsesPage;
