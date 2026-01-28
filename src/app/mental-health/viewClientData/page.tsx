'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowLeft, 
  Users, 
  Calendar, 
  GraduationCap, 
  User, 
  Eye,
  Brain,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ViewDataPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [userInfo, setUserInfo] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch client data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://atosclone.onrender.com/api/responses');
        const data = await res.json();
        setUserInfo(data);
        setFilteredData(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = userInfo.filter((user) => {
      const matchesName = name ? user.name?.toLowerCase().includes(name.toLowerCase()) : true;
      const matchesDate = date ? user.date === date : true;
      return matchesName && matchesDate;
    });
    setFilteredData(filtered);
  };

  const handleReset = () => {
    setName('');
    setDate('');
    setFilteredData(userInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/mental-health">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Client Records
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage mental health assessment responses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <Card className="mb-6 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Search Clients
            </CardTitle>
            <CardDescription>
              Filter clients by name or assessment date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Search by client name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <div className="ml-auto">
                  <Badge variant="secondary" className="text-sm">
                    {filteredData.length} {filteredData.length === 1 ? 'client' : 'clients'}
                  </Badge>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Clients Table Card */}
        <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              All Clients
            </CardTitle>
            <CardDescription>
              Click &quot;View Responses&quot; to see detailed assessment data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading client data...</span>
              </div>
            ) : filteredData.length > 0 ? (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Education</TableHead>
                      <TableHead className="font-semibold">Age</TableHead>
                      <TableHead className="font-semibold">Gender</TableHead>
                      <TableHead className="font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {user.name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {user.date || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            {user.education_level || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{user.age || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.gender || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/mental-health/clientResponses/${user.id}`}>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <Eye className="w-4 h-4" />
                              View Responses
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No client records found
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
