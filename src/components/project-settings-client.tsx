"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, FormInput, BarChart3, Save } from "lucide-react";
import { FormBuilder } from "./form-builder";
import { AnalyticsConfig } from "./analytics-config";
import { SectionToggle } from "./section-toggle";
import { toast } from "sonner";
import { updateFormConfig, updateAnalyticsConfig } from "@/services/projectConfig";

interface ProjectSettingsClientProps {
  projectPromise: Promise<any>;
  configPromise: Promise<any>;
}

export function ProjectSettingsClient({
  projectPromise,
  configPromise,
}: ProjectSettingsClientProps) {
  const [project, setProject] = React.useState<any>(null);
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    Promise.all([projectPromise, configPromise]).then(([projectData, configData]) => {
      setProject(projectData.items?.data?.project || projectData.items?.project);
      // Handle config structure - it might be configData.config or configData.data.config
      const config = configData?.config || configData?.data?.config || {
        formConfig: {
          enableScreening: true,
          enableClinicalFindings: true,
          enableDoctorComments: true,
          fields: [],
          customSections: [],
        },
        analyticsConfig: {
          enabled: true,
          customMetrics: [],
        },
      };
      setConfig(config);
      setLoading(false);
    });
  }, [projectPromise, configPromise]);

  const handleSaveFormConfig = async (formConfig: any) => {
    setSaving(true);
    try {
      await updateFormConfig(project._id, formConfig);
      setConfig((prev: any) => ({ ...prev, formConfig }));
      toast.success("Form configuration saved successfully");
    } catch (error) {
      toast.error("Failed to save form configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnalyticsConfig = async (analyticsConfig: any) => {
    setSaving(true);
    try {
      await updateAnalyticsConfig(project._id, analyticsConfig);
      setConfig((prev: any) => ({ ...prev, analyticsConfig }));
      toast.success("Analytics configuration saved successfully");
    } catch (error) {
      toast.error("Failed to save analytics configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading project settings...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Project not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-xl">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Project Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {project.name} - Configure forms and analytics
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">
            <Settings className="w-4 h-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="forms">
            <FormInput className="w-4 h-4 mr-2" />
            Form Builder
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enable/Disable Sections</CardTitle>
              <CardDescription>
                Choose which sections to include in patient data collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SectionToggle
                config={config.formConfig}
                onSave={handleSaveFormConfig}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Builder</CardTitle>
              <CardDescription>
                Create and customize form fields for patient data collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormBuilder
                projectId={project._id}
                formConfig={config.formConfig}
                onSave={handleSaveFormConfig}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Configuration</CardTitle>
              <CardDescription>
                Configure analytics and custom metrics for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsConfig
                analyticsConfig={config.analyticsConfig}
                onSave={handleSaveAnalyticsConfig}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

