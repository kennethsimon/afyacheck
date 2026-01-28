'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Users, FileText, TrendingUp, Calendar, Download, RefreshCw } from 'lucide-react';
import projectApi from '@/services/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/table-filters/date-range-picker';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AnalyticsData {
  summary: {
    totalSubmissions: number;
    uniqueUsers: number;
    completionRate: number;
    lastUpdated: string;
  };
  metrics: {
    name: string;
    field: string;
    type: string;
    value: number;
    label: string;
    description?: string;
  }[];
  charts: {
    id: string;
    title: string;
    type: string;
    data: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string;
        fill?: boolean;
      }[];
    };
    config: any;
  }[];
  fieldAnalytics: {
    [fieldName: string]: {
      type: string;
      totalResponses: number;
      uniqueValues: number;
      distribution: { [value: string]: number };
      statistics?: {
        min?: number;
        max?: number;
        avg?: number;
        median?: number;
        mode?: string;
      };
    };
  };
}

export default function CustomProjectsAnalyticsPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

  const generateAnalytics = React.useCallback(async () => {
    try {
      const period = getPeriodFromSelection(selectedPeriod);
      const response = await projectApi.post('/form-analytics/generate', {
        projectId: params.projectId,
        formSchemaId: null, // Generate for all schemas
        period,
      });

      const data = response.data;
      if (data.status) {
        toast.success('Analytics generated successfully');
        return true;
      } else {
        toast.error('Failed to generate analytics');
        return false;
      }
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast.error('Failed to generate analytics');
      return false;
    }
  }, [params.projectId, selectedPeriod]);

  const loadAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectApi.get(`/form-analytics/dashboard/${params.projectId}`);
      const data = response.data;

      if (data.status && data.dashboard) {
        setAnalytics(data.dashboard);
      } else {
        // If no analytics exist, generate them
        const generated = await generateAnalytics();
        if (generated) {
          // Reload after generation
          const reloadResponse = await projectApi.get(`/form-analytics/dashboard/${params.projectId}`);
          const reloadData = reloadResponse.data;
          if (reloadData.status && reloadData.dashboard) {
            setAnalytics(reloadData.dashboard);
          }
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, generateAnalytics]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const getPeriodFromSelection = (selection: string) => {
    const now = new Date();
    const periods = {
      '7d': { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now, type: 'daily' },
      '30d': { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now, type: 'weekly' },
      '90d': { start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), end: now, type: 'monthly' },
      '1y': { start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), end: now, type: 'quarterly' },
    };
    return periods[selection as keyof typeof periods] || periods['30d'];
  };

  const exportAnalytics = async () => {
    try {
      const response = await projectApi.get(`/form-analytics/dashboard/${params.projectId}`);
      const data = response.data;

      if (data.status) {
        const blob = new Blob([JSON.stringify(data.dashboard, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${params.projectId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Analytics exported successfully');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics');
    }
  };

  const renderChart = (chart: any) => {
    const chartData = chart.data.labels.map((label: string, index: number) => ({
      name: label,
      value: chart.data.datasets[0]?.data[index] || 0,
    }));

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = chartData.map((item: any, index: number) => ({
          ...item,
          fill: chart.data.datasets[0]?.backgroundColor?.[index] || '#3b82f6',
        }));
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar name="Value" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center py-8 text-gray-500">Chart type not supported</div>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Insights and metrics for your custom forms
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportAnalytics}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={generateAnalytics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Period:</span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!analytics ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Analytics Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Generate analytics to view insights from your form submissions.
              </p>
              <Button onClick={generateAnalytics}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.totalSubmissions}</div>
                <p className="text-xs text-muted-foreground">
                  Form responses collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.uniqueUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Distinct respondents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Forms completed vs started
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(analytics.summary.lastUpdated).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(analytics.summary.lastUpdated).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {analytics.charts && analytics.charts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.charts.map((chart) => (
                <Card key={chart.id}>
                  <CardHeader>
                    <CardTitle>{chart.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderChart(chart)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Field Analytics */}
          {analytics.fieldAnalytics && Object.keys(analytics.fieldAnalytics).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Field Response Analytics</CardTitle>
                <CardDescription>
                  Detailed breakdown of responses for each form field
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(analytics.fieldAnalytics).map(([fieldName, fieldData]) => (
                    <div key={fieldName} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{fieldName}</h4>
                        <Badge variant="outline">{fieldData.type}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Responses</p>
                          <p className="text-lg font-semibold">{fieldData.totalResponses}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Unique Values</p>
                          <p className="text-lg font-semibold">{fieldData.uniqueValues}</p>
                        </div>
                        {fieldData.statistics && (
                          <>
                            {fieldData.statistics.avg !== undefined && (
                              <div>
                                <p className="text-sm text-gray-600">Average</p>
                                <p className="text-lg font-semibold">{fieldData.statistics.avg.toFixed(2)}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Distribution Chart */}
                      {fieldData.type === 'select' || fieldData.type === 'radio' ? (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Response Distribution</h5>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                              data={Object.entries(fieldData.distribution).map(([key, value]) => ({
                                name: key.length > 20 ? key.substring(0, 20) + '...' : key,
                                value,
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#8b5cf6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metrics Table */}
          {analytics.metrics && analytics.metrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Calculated metrics from your form data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.metrics.map((metric) => (
                    <div key={metric.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{metric.label}</p>
                          <p className="text-2xl font-bold">{metric.value}</p>
                        </div>
                        <Badge variant="secondary">{metric.type}</Badge>
                      </div>
                      {metric.description && (
                        <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
