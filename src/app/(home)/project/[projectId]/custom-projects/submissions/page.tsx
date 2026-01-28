'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, Download, Filter, Search, Calendar, User, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import projectApi from '@/services/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface FormSubmission {
  _id: string;
  project: string;
  formSchema: {
    _id: string;
    name: string;
    version: number;
  };
  submittedBy: {
    name: string;
    username: string;
  };
  patient?: {
    name: string;
    patientIdentifier: string;
  };
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  responses: { [key: string]: any };
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
}

export default function SubmissionsPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 50,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadSubmissions();
  }, [filters]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') queryParams.append(key, value.toString());
      });

      const response = await projectApi.get(`/form-submissions?customProject=${params.projectId}&${queryParams}`);
      const data = response.data;

      if (data.status) {
        setSubmissions(data.submissions);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (submissionId: string, status: string, notes?: string) => {
    try {
      const response = await projectApi.patch(`/form-submissions/${submissionId}/status`, {
        status,
        notes,
      });

      const data = response.data;
      if (data.status) {
        toast.success('Status updated successfully');
        loadSubmissions();
        setSelectedSubmission(null);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const exportSubmissions = async () => {
    try {
      const response = await projectApi.get(`/form-submissions?customProject=${params.projectId}&limit=1000`);
      const data = response.data;

      if (data.status) {
        const csvData = convertToCSV(data.submissions);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `submissions-${params.projectId}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Submissions exported successfully');
      }
    } catch (error) {
      console.error('Error exporting submissions:', error);
      toast.error('Failed to export submissions');
    }
  };

  const convertToCSV = (submissions: FormSubmission[]): string => {
    if (submissions.length === 0) return '';

    const headers = [
      'Submission ID',
      'Form Name',
      'Form Version',
      'Submitted By',
      'Patient',
      'Status',
      'Submitted At',
      'Approved At',
    ];

    // Get all unique response keys
    const responseKeys = new Set<string>();
    submissions.forEach(sub => {
      Object.keys(sub.responses).forEach(key => responseKeys.add(key));
    });

    headers.push(...Array.from(responseKeys));

    const rows = submissions.map(sub => [
      sub._id,
      sub.formSchema.name,
      sub.formSchema.version.toString(),
      sub.submittedBy.name,
      sub.patient?.name || '',
      sub.status,
      sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '',
      sub.approvedAt ? new Date(sub.approvedAt).toLocaleString() : '',
      ...Array.from(responseKeys).map(key => {
        const value = sub.responses[key];
        return Array.isArray(value) ? value.join('; ') : String(value || '');
      }),
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'draft':
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      submitted: 'default',
      approved: 'secondary',
      rejected: 'destructive',
      draft: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Form Submissions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage form responses
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportSubmissions}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search submissions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Submissions ({total})</span>
            <Button variant="outline" size="sm" onClick={loadSubmissions}>
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Submissions Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No form submissions match your current filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{submission.formSchema.name}</p>
                        <p className="text-sm text-gray-500">v{submission.formSchema.version}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{submission.submittedBy.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.patient ? (
                        <div>
                          <p className="font-medium">{submission.patient.name}</p>
                          <p className="text-sm text-gray-500">{submission.patient.patientIdentifier}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        {getStatusBadge(submission.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.submittedAt ? (
                        <div>
                          <p>{new Date(submission.submittedAt).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(submission.submittedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Submission Details</DialogTitle>
                            <DialogDescription>
                              Form: {submission.formSchema.name} v{submission.formSchema.version}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Submission Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Submitted By</Label>
                                <p className="text-sm">{submission.submittedBy.name}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div className="flex items-center space-x-2 mt-1">
                                  {getStatusIcon(submission.status)}
                                  {getStatusBadge(submission.status)}
                                </div>
                              </div>
                              <div>
                                <Label>Submitted At</Label>
                                <p className="text-sm">
                                  {submission.submittedAt
                                    ? new Date(submission.submittedAt).toLocaleString()
                                    : 'Not submitted'
                                  }
                                </p>
                              </div>
                              <div>
                                <Label>Patient</Label>
                                <p className="text-sm">
                                  {submission.patient
                                    ? `${submission.patient.name} (${submission.patient.patientIdentifier})`
                                    : 'No patient linked'
                                  }
                                </p>
                              </div>
                            </div>

                            {/* Responses */}
                            <div>
                              <Label className="text-base font-semibold">Form Responses</Label>
                              <div className="mt-4 space-y-4">
                                {Object.entries(submission.responses).map(([fieldName, value]) => (
                                  <div key={fieldName} className="border-b pb-2">
                                    <Label className="font-medium">{fieldName}</Label>
                                    <div className="mt-1 text-sm">
                                      {Array.isArray(value) ? (
                                        <ul className="list-disc list-inside">
                                          {value.map((item, index) => (
                                            <li key={index}>{String(item)}</li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p>{String(value || 'No response')}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Status Actions */}
                            {submission.status === 'submitted' && (
                              <div className="flex space-x-2 pt-4 border-t">
                                <Button
                                  onClick={() => handleStatusUpdate(submission._id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(submission._id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
