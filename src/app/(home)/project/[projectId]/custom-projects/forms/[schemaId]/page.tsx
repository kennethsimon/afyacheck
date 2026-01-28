'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save, Send, Eye } from 'lucide-react';
import projectApi from '@/services/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface FormField {
  _id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'boolean' | 'radio' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface FormSection {
  name: string;
  label: string;
  enabled: boolean;
  fields: string[];
}

interface FormSchema {
  _id: string;
  name: string;
  description?: string;
  sections: FormSection[];
  fields: FormField[];
}

export default function FormViewerPage({
  params
}: {
  params: { projectId: string; schemaId: string }
}) {
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [responses, setResponses] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const loadFormSchema = React.useCallback(async () => {
    try {
      const response = await projectApi.get(`/form-schemas/${params.schemaId}`);
      const data = response.data;
      if (data.status) {
        setSchema(data.schema);
      } else {
        toast.error('Form not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading form:', error);
      toast.error('Failed to load form');
    } finally {
      setLoading(false);
    }
  }, [params.schemaId, router]);

  useEffect(() => {
    loadFormSchema();
  }, [loadFormSchema]);

  const handleFieldChange = (fieldName: string, value: any) => {
    const newResponses = new Map(responses);
    newResponses.set(fieldName, value);
    setResponses(newResponses);
  };

  const validateForm = (): boolean => {
    if (!schema) return false;

    const allFields = schema.fields;
    const enabledSections = schema.sections.filter(s => s.enabled);

    for (const section of enabledSections) {
      for (const fieldId of section.fields) {
        const field = allFields.find(f => f._id === fieldId);
        if (!field) continue;

        if (field.required) {
          const value = responses.get(field.name);
          if (value === undefined || value === null || value === '') {
            toast.error(`"${field.label}" is required`);
            return false;
          }

          // For arrays (multiselect, checkbox), check if not empty
          if (Array.isArray(value) && value.length === 0) {
            toast.error(`"${field.label}" is required`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const { data: session } = useSession();

  const handleSubmit = async (status: 'draft' | 'submitted' = 'submitted') => {
    if (!schema) return;

    if (status === 'submitted' && !validateForm()) {
      return;
    }

    if (!session?.user) {
      toast.error('You must be logged in to submit a form');
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = {
        project: params.projectId,
        formSchema: params.schemaId,
        submittedBy: {
          _id: (session.user as any).id || (session.user as any)._id || '',
          name: session.user.name || 'Unknown User',
          username: (session.user as any).username || session.user.email || '',
        },
        responses: Object.fromEntries(responses),
        status,
      };

      const response = await projectApi.post('/form-submissions', submissionData);
      const data = response.data;
      if (data.status) {
        toast.success(status === 'submitted' ? 'Form submitted successfully!' : 'Draft saved successfully!');
        if (status === 'submitted') {
          router.back();
        }
      } else {
        toast.error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = responses.get(field.name) || '';
    const fieldId = `field-${field.name}`;

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={fieldId}
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={previewMode}
          />
        );

      case 'number':
        return (
          <Input
            id={fieldId}
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || '')}
            disabled={previewMode}
          />
        );

      case 'date':
        return (
          <Input
            id={fieldId}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={previewMode}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={previewMode}
            rows={4}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={fieldId}
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              disabled={previewMode}
            />
            <Label htmlFor={fieldId} className="text-sm">
              {value ? 'Yes' : 'No'}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleFieldChange(field.name, newValue)}
            disabled={previewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${fieldId}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    let newValues: string[];
                    if (checked) {
                      newValues = [...selectedValues, option.value];
                    } else {
                      newValues = selectedValues.filter(v => v !== option.value);
                    }
                    handleFieldChange(field.name, newValues);
                  }}
                  disabled={previewMode}
                />
                <Label htmlFor={`${fieldId}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => handleFieldChange(field.name, newValue)}
            disabled={previewMode}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${fieldId}-${option.value}`} />
                <Label htmlFor={`${fieldId}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${fieldId}-${option.value}`}
                  checked={checkboxValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    let newValues: string[];
                    if (checked) {
                      newValues = [...checkboxValues, option.value];
                    } else {
                      newValues = checkboxValues.filter(v => v !== option.value);
                    }
                    handleFieldChange(field.name, newValues);
                  }}
                  disabled={previewMode}
                />
                <Label htmlFor={`${fieldId}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="text-gray-500">Unsupported field type</div>;
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

  if (!schema) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Form not found
          </h2>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                {schema.name}
              </h1>
              {schema.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {schema.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-8">
            {schema.sections
              .filter(section => section.enabled)
              .map((section) => (
                <div key={section.name} className="space-y-6">
                  <div className="border-b pb-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {section.label}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.fields.map((fieldId) => {
                      const field = schema.fields.find(f => f._id === fieldId);
                      if (!field) return null;

                      return (
                        <div key={field._id} className="space-y-2">
                          <Label htmlFor={`field-${field.name}`}>
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          {renderField(field)}
                          {field.placeholder && !previewMode && (
                            <p className="text-xs text-gray-500">
                              Hint: {field.placeholder}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </form>
        </CardContent>
      </Card>

      {/* Actions */}
      {!previewMode && (
        <div className="flex justify-end space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('submitted')}
            disabled={submitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        </div>
      )}

      {/* Preview Mode Notice */}
      {previewMode && (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Preview Mode
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This is how the form will appear to respondents. Switch to edit mode to make changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
