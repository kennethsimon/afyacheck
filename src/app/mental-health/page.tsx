'use client';

import React from 'react';
import Link from 'next/link';
import { FaHeartbeat, FaUserMd } from 'react-icons/fa';

const MentalHealthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 py-16 px-4">
      <div className="min-h-[83vh] max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-12 flex flex-col justify-between">
        <div className="text-center">
          <img
            src="/AC.png"
            alt="AfyaCheck Logo"
            className="mx-auto h-24 sm:h-28 mb-6"
          />
          <h1 className="mt-8 text-4xl font-extrabold text-green-600 leading-tight">
            Mental Health Assessment
          </h1>
          <p className="mt-12 text-black-600 text-2xl">
            Assess your mental well-being through a series of simple, guided questions designed to help you understand yourself better.
          </p>
        </div>

        <div className="mt-10 space-y-14">
          <Link
            href="/mental-health/questionnaire"
            className=" flex items-center justify-center gap-3 bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold py-3 px-6 rounded-xl transition duration-300"
          >
            <FaHeartbeat className="text-xl" />
            START ASSESSMENT
          </Link>

          <Link
            href="/mental-health/specialist"
            className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-800 text-white text-lg font-semibold py-3 px-6 rounded-xl transition duration-300"
          >
            <FaUserMd className="text-xl" />
            Specialist Zone
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthPage;
