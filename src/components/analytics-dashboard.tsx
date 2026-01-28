"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getPatientAnalyticsData } from "@/services/projects";
import { Users, Activity, Heart, TrendingUp } from "lucide-react";

interface AnalyticsDashboardProps {
  projectId: string;
  campId?: string;
}

export function AnalyticsDashboard({ projectId, campId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const loadAnalytics = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPatientAnalyticsData({ projectId, campId: campId || "all" });
      setAnalytics(result?.items || null);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, campId]);

  React.useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        No analytics data available
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Safe access to analytics properties
  const totalPatients = Number(analytics?.totalPatients) || 0;
  const screeningStats = Number(analytics?.screeningStats) || 0;
  const clinicalStats = Number(analytics?.clinicalStats) || 0;
  const customMetrics = Array.isArray(analytics?.customMetrics) ? analytics.customMetrics : [];
  const genderStats = Array.isArray(analytics?.genderStats) ? analytics.genderStats : [];
  const ageGroups = Array.isArray(analytics?.ageGroups) ? analytics.ageGroups : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screening Records</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{screeningStats}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clinical Records</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicalStats}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Metrics</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customMetrics.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        {genderStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
              <CardDescription>Patient distribution by gender</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.genderStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ gender, count }) => `${gender}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {genderStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Age Groups */}
        {ageGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Age Distribution</CardTitle>
              <CardDescription>Patient distribution by age groups</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Custom Metrics */}
      {customMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Metrics</CardTitle>
            <CardDescription>Project-specific analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customMetrics.map((metric: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500">{metric.name}</div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

