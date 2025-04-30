'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ViewDataPage({ userInfo }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (name) query.append('name', name);
    if (date) query.append('date', date);
    router.push(`/view-data?${query.toString()}`);
  };

  return (
    <div className="container mt-5">
      {/* Logo */}
      <div className="text-center mb-4">
        <Image src="/AC.png" alt="Logo" width={750} height={135} className="img-fluid" />
      </div>

      <h2 className="text-center">ALL CLIENTS</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="row align-items-center">
          <div className="col-md-5">
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="SEARCH BY NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              name="date"
              className="form-control"
              value={date}
              style={{ color: date ? '#000' : '#aaa' }}
              onChange={(e) => setDate(e.target.value)}
              onFocus={(e) => (e.target.style.color = '#000')}
            />
          </div>
          <div className="col-md-1">
            <button type="submit" className="btn btn-primary w-100 fw-bold">SEARCH</button>
          </div>
          <div className="col-md-3 text-end">
            <Link href="/specialist-login" className="btn btn-danger fw-bold" style={{ marginLeft: '315px' }}>
              LOGOUT
            </Link>
          </div>
        </div>
      </form>

      {/* Clients Table */}
      <table className="table table-bordered" style={{ backgroundColor: 'blue', color: 'white' }}>
        <thead style={{ backgroundColor: 'darkblue' }}>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Education Level</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {userInfo && userInfo.length > 0 ? (
            userInfo.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.date}</td>
                <td>{user.education_level}</td>
                <td>{user.age}</td>
                <td>{user.gender}</td>
                <td>
                  <Link href={`/user-responses/${user.id}`} className="btn btn-primary">
                    View Responses
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

