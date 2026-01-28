"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, FormInput, BarChart3, Save, Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import { FormBuilder } from "./form-builder";
import { AnalyticsConfig } from "./analytics-config";
import { SectionToggle } from "./section-toggle";
import { toast } from "sonner";
import { updateFormConfig, updateAnalyticsConfig } from "@/services/projectConfig";
import { useRouter } from "next/navigation";
import projectApi from "@/services/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectSettingsClientProps {
  projectPromise: Promise<any>;
  configPromise: Promise<any>;
}

export function ProjectSettingsClient({
  projectPromise,
  configPromise,
}: ProjectSettingsClientProps) {
  const router = useRouter();
  const [project, setProject] = React.useState<any>(null);
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

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

  const handleDeleteProject = async () => {
    if (deleteConfirmText !== project.name) {
      toast.error("Project name doesn't match. Please type the project name exactly.");
      return;
    }

    setDeleting(true);
    try {
      const response = await projectApi.delete(`/projects/${project._id}`);
      if (response.data?.status) {
        toast.success(`Project "${project.name}" and all related camps have been deleted successfully`);
        router.push("/project");
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error(error?.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText("");
    }
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-lg font-semibold mb-4">Project not found</div>
        <Button onClick={() => router.push("/project")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
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
          <Button
            variant="outline"
            onClick={() => router.push("/project")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
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

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                View and edit basic project details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={project.name || ""}
                    readOnly
                    className="mt-1 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Description</Label>
                  <textarea
                    id="project-description"
                    value={project.description || ""}
                    readOnly
                    className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Created At</Label>
                    <Input
                      value={project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "N/A"}
                      readOnly
                      className="mt-1 bg-gray-50 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Input
                      value={project.active ? "Active" : "Inactive"}
                      readOnly
                      className="mt-1 bg-gray-50 dark:bg-gray-900"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions. Please be certain before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Delete Project
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Once you delete a project, there is no going back. This will permanently delete the project,
                all associated camps, form schemas, and related data. This action cannot be undone.
              </p>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="ml-4">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription className="space-y-3 pt-2">
                    <p>
                      This action cannot be undone. This will permanently delete:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>The project: <strong>{project.name}</strong></li>
                      <li>All associated medical camps</li>
                      <li>All form schemas and configurations</li>
                      <li>All form submissions</li>
                    </ul>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="delete-confirm">
                        Please type <strong>{project.name}</strong> to confirm:
                      </Label>
                      <Input
                        id="delete-confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder={project.name}
                        className="mt-2"
                      />
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeleteConfirmText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteProject}
                    disabled={deleteConfirmText !== project.name || deleting}
                  >
                    {deleting ? "Deleting..." : "Yes, delete project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

