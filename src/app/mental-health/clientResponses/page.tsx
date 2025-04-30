'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

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
  user: UserData;
  total_score: number;
  mental_status: string;
  user_responses: QuestionResponse[];
};

const UserResponsesPage: React.FC<Props> = ({ user, total_score, mental_status, user_responses }) => {
  return (
    <div className="container mx-auto mt-10 px-4">
      {/* Centered Logo */}
      <div className="text-center mb-6">
        <Image src="/AC.png" alt="Logo" width={300} height={80} />
      </div>

      {/* Header and Back Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Client: {user.name}</h2>
        <Link href="/view-data">
          <button className="bg-blue-800 text-white font-bold px-4 py-2 rounded">BACK TO LIST</button>
        </Link>
      </div>

      {/* Info and Status Tables */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
        {/* User Info Table */}
        <div className="w-full lg:w-1/2">
          <h4 className="mb-2 font-semibold text-lg">USER INFORMATION</h4>
          <table className="w-full border-4 border-blue-700 rounded overflow-hidden text-white bg-blue-700">
            <tbody>
              <tr className="border"><th className="p-2">Name</th><td className="p-2">{user.name}</td></tr>
              <tr className="border"><th className="p-2">Date</th><td className="p-2">{user.date}</td></tr>
              <tr className="border"><th className="p-2">Education Level</th><td className="p-2">{user.education_level}</td></tr>
              <tr className="border"><th className="p-2">Age</th><td className="p-2">{user.age}</td></tr>
              <tr className="border"><th className="p-2">Gender</th><td className="p-2">{user.gender}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Mental Status Table */}
        <div className="w-full lg:w-1/2">
          <h4 className="mb-2 font-semibold text-lg">MENTAL HEALTH STATUS</h4>
          <table className="w-full border-4 border-blue-700 rounded overflow-hidden text-white bg-blue-700">
            <tbody>
              <tr className="border"><th className="p-2">Total Score</th><td className="p-2">{total_score}</td></tr>
              <tr className="border"><th className="p-2">Status</th><td className="p-2">{mental_status}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Responses Table */}
      <h4 className="mb-2 font-semibold text-lg">RESPONSES</h4>
      <table className="w-full border-4 border-blue-700 rounded overflow-hidden text-white bg-blue-700">
        <thead>
          <tr className="border-b"><th className="p-2">Question</th><th className="p-2">Answer</th></tr>
        </thead>
        <tbody>
          {user_responses.map((response, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{response.question.question_text}</td>
              <td className="p-2">{response.answer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserResponsesPage;