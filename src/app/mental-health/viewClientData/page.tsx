'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSearch, FaSignOutAlt, FaUserMd } from 'react-icons/fa';

export default function ViewDataPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [userInfo, setUserInfo] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch client data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://atosclone.onrender.com/api/responses');
        const data = await res.json();
        setUserInfo(data);
        setFilteredData(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = userInfo.filter((user) => {
      const matchesName = name ? user.name.toLowerCase().includes(name.toLowerCase()) : true;
      const matchesDate = date ? user.date === date : true;
      return matchesName && matchesDate;
    });
    setFilteredData(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 py-16 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/AFYACHECK-transformed.png" alt="Logo" width={600} height={200} className="img-fluid" />
        </div>

        <h2 className="text-center text-3xl font-bold text-emerald-500 mb-6 flex items-center justify-center">
          <FaUserMd className="mr-2 animate-bounce" /> ALL CLIENTS
        </h2>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              name="name"
              className="flex-grow p-2 border border-gray-600 rounded"
              placeholder="Search by Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="date"
              name="date"
              className="p-2 border border-gray-600 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <FaSearch className="mr-2" /> Search
            </button>
            <Link href="/specialist-login" className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-auto">
              <FaSignOutAlt className="mr-2" />
              Logout
            </Link>
          </div>
        </form>

        {/* Clients Table */}
        <div className="overflow-y-auto max-h-[500px]">
          <table className="min-w-full table-auto border-collapse">
            <thead className="sticky top-0 bg-emerald-500 text-white">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Education Level</th>
                <th className="p-3 text-left">Age</th>
                <th className="p-3 text-left">Gender</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-100">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.date}</td>
                    <td className="p-3">{user.education_level}</td>
                    <td className="p-3">{user.age}</td>
                    <td className="p-3">{user.gender}</td>
                    <td className="p-3">
                      <Link
                        href={`/user-responses/${user.id}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-3 rounded"
                      >
                        View Responses
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
