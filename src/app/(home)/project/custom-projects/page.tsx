'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProjects } from "../../../../services/projects";
import projectApi from "@/services/config";
import { Plus, FileText, BarChart3, Settings, Eye, Edit, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Project {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  active: boolean;
}

interface FormSchema {
  _id: string;
  name: string;
  version: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export default function CustomProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formSchemas, setFormSchemas] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [customProjects, setCustomProjects] = useState<Project[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadCustomProjects();
  }, []);

  const loadCustomProjects = async () => {
    try {
      setLoading(true);

      // Get custom projects directly from the dedicated API
      const response = await projectApi.get('/custom-projects');
      const customProjectsList = response.data.data?.customProjects || [];

      setCustomProjects(customProjectsList);

      // Debug logging
      console.log('Custom projects loaded:', customProjectsList.length);
      console.log('Custom projects:', customProjectsList.map((p: any) => ({ id: p._id, name: p.name })));
      setLoading(false);
    } catch (error) {
      console.error('Error loading custom projects:', error);
      toast.error('Failed to load custom projects');
      setLoading(false);
    }
  };


  const loadFormSchemas = async (projectId: string) => {
    try {
      const response = await projectApi.get(`/form-schemas?project=${projectId}&includeInactive=true`);
      const data = response.data;
      if (data.status) {
        setFormSchemas(data.schemas);
      }
    } catch (error) {
      console.error('Error loading form schemas:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    loadFormSchemas(project._id);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      const response = await projectApi.post('/custom-projects', {
        name: newProjectName,
        description: newProjectDescription,
        category: 'healthcare',
        active: true,
      });

      const data = response.data;
      if (data.status) {
        toast.success('Custom project created successfully! Now create forms and configurations.');
        setShowCreateDialog(false);
        setNewProjectName('');
        setNewProjectDescription('');

        // Add the new custom project to the list
        setCustomProjects(prev => [...prev, data.customProject]);

        // Redirect to form builder for the new project
        console.log('Redirecting to form builder for custom project:', data.customProject._id);
        setTimeout(() => {
          router.push(`/project/${data.customProject._id}/custom-projects/form-builder`);
        }, 1000);
        // Add the new project to the projects list
        const newProject = {
          _id: data.project._id,
          name: data.project.name,
          description: data.project.description,
          active: data.project.active,
        };
        setProjects(prev => [...prev, newProject]);
        // New projects don't have custom features yet, so they won't appear in customProjects
        // They will appear after forms/schemas are created
      } else {
        toast.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleCreateForm = (projectId: string) => {
    router.push(`/project/${projectId}/custom-projects/form-builder`);
  };

  const handleViewAnalytics = (projectId: string) => {
    router.push(`/project/${projectId}/custom-projects/analytics`);
  };

  const handleViewForm = (projectId: string, schemaId: string) => {
    router.push(`/project/${projectId}/custom-projects/forms/${schemaId}`);
  };

  const handleEditForm = (projectId: string, schemaId: string) => {
    router.push(`/project/${projectId}/custom-projects/form-builder?schema=${schemaId}`);
  };

  const handleViewSubmissions = (projectId: string) => {
    router.push(`/project/${projectId}/custom-projects/submissions`);
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Custom Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Projects with custom forms and advanced analytics
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Only projects with custom project configurations will appear here.{' '}
              <Link href="/project" className="text-blue-600 hover:underline">
                View all projects →
              </Link>
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new custom project to build forms and collect responses.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Description (Optional)</Label>
                  <Textarea
                    id="project-description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject}>
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <p><strong>Debug:</strong> Total projects: {projects.length}, Custom projects: {customProjects.length}</p>
        {projects.length > 0 && (
          <details>
            <summary>All Projects</summary>
            <ul className="mt-2">
              {projects.map(p => (
                <li key={p._id} className="text-sm">{p.name} ({p._id})</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Projects Grid */}
      {customProjects.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Custom Projects Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first custom project to start building forms and collecting responses.
            Projects will appear here once they have custom forms, schemas, or configurations.
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(customProjects.length > 0 ? customProjects : projects.slice(0, 6)).map((project) => (
            <Card key={project._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: project.color || '#3b82f6' }}
                    >
                      {project.icon || project.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>{project.description || 'No description'}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={project.active ? 'default' : 'secondary'}>
                    {project.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateForm(project._id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Form
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAnalytics(project._id)}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSubmissions(project._id)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Submissions
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleProjectSelect(project)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Schemas Modal */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProject.name} - Form Schemas</DialogTitle>
              <DialogDescription>
                Manage form schemas for this project
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {formSchemas.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No form schemas created yet
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => handleCreateForm(selectedProject._id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Form
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formSchemas.map((schema) => (
                    <div
                      key={schema._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{schema.name}</h4>
                          <Badge variant={schema.isActive ? 'default' : 'outline'}>
                            v{schema.version}
                          </Badge>
                          {schema.isActive && (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </div>
                        {schema.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {schema.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(schema.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewForm(selectedProject._id, schema._id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditForm(selectedProject._id, schema._id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAnalytics(selectedProject._id)}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedProject(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
