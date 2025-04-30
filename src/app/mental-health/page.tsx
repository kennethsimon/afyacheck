// src/app/mental-health/page.tsx
import React from 'react';
import Link from "next/link";


const MentalHealthPage = () => {
  return (
    <div className="min-h-screen bg-blue-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <img src="/AC.png" alt="AfyaCheck Logo" className="mx-auto h-28" />
          <h1 className="text-3xl font-bold text-blue-800 mt-4">Mental Health Assessment</h1>
        </div>

        <p className="text-gray-700 text-lg mb-4">
          Welcome to this section. This app helps you assess and improve your mental health through a series of guided questions.
        </p>
        <p>Click the START ASSESSMENT button to start your assessment journey!</p>

        <div className="flex flex-col gap-4 mt-8">
          <Link href="/mental-health/questionnaire" className="bg-blue-700 text-white py-3 px-6 rounded hover:bg-blue-800 font-semibold text-center">
            START ASSESSMENT
          </Link>
          <Link href="/mental-health/specialist" className="bg-gray-600 text-white py-3 px-6 rounded hover:bg-gray-700 font-semibold text-center">
            SPECIALIST ZONE
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthPage;
