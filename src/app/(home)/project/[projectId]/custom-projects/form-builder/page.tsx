'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, Play, Plus, X, Settings, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import projectApi from '@/services/config';
import { useSession } from 'next-auth/react';

interface FormField {
  _id?: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'boolean' | 'radio' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  order: number;
  section: 'patientInfo' | 'screening' | 'clinicalFindings' | 'doctorComments' | 'custom';
}

interface FormSection {
  name: string;
  label: string;
  order: number;
  enabled: boolean;
  fields: string[]; // Field IDs
}

interface FormSchema {
  _id?: string;
  project: string;
  name: string;
  description?: string;
  version?: number;
  isActive?: boolean;
  fields: FormField[];
  sections: FormSection[];
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'date', label: 'Date Picker' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'boolean', label: 'Yes/No Toggle' },
];

const SECTIONS = [
  { value: 'patientInfo', label: 'Patient Information' },
  { value: 'screening', label: 'Screening' },
  { value: 'clinicalFindings', label: 'Clinical Findings' },
  { value: 'doctorComments', label: 'Doctor Comments' },
  { value: 'custom', label: 'Custom Section' },
];

export default function FormBuilderPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const schemaId = searchParams.get('schema');

  const [schema, setSchema] = useState<FormSchema>({
    project: params.projectId,
    name: '',
    description: '',
    fields: [],
    sections: [
      { name: 'patientInfo', label: 'Patient Information', order: 0, enabled: true, fields: [] },
      { name: 'screening', label: 'Screening', order: 1, enabled: true, fields: [] },
      { name: 'clinicalFindings', label: 'Clinical Findings', order: 2, enabled: true, fields: [] },
      { name: 'doctorComments', label: 'Doctor Comments', order: 3, enabled: true, fields: [] },
    ],
  });

  const [availableFields, setAvailableFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (schemaId) {
      loadSchema(schemaId);
    }
    loadAvailableFields();
  }, [schemaId]);

  const loadSchema = async (id: string) => {
    try {
      const response = await projectApi.get(`/form-schemas/${id}`);
      const data = response.data;
      if (data.status) {
        setSchema(data.schema);
      }
    } catch (error) {
      console.error('Error loading schema:', error);
      toast.error('Failed to load form schema');
    }
  };

  const loadAvailableFields = async () => {
    console.log('Loading fields for custom project:', params.projectId);
    try {
      const response = await projectApi.get(`/form-fields?customProject=${params.projectId}`);
      const data = response.data;
      console.log('Loaded fields:', data);
      if (data.status) {
        setAvailableFields(data.data.formFields);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  };

  const handleSaveSchema = async () => {
    console.log('handleSaveSchema called with schema:', schema);
    if (!schema.name.trim()) {
      toast.error('Form name is required');
      return;
    }

    setLoading(true);
    try {
      const endpoint = schema._id ? `/form-schemas/${schema._id}` : '/form-schemas';

      const response = await (schema._id
        ? projectApi.put(endpoint, {
            ...schema,
            customProject: params.projectId,
          })
        : projectApi.post(endpoint, {
            ...schema,
            customProject: params.projectId,
          }));

      const data = response.data;
      console.log('Form save response:', data);
      if (data.status) {
        toast.success(schema._id ? 'Form updated successfully' : 'Form created successfully');
        if (!schema._id) {
          setSchema({ ...schema, _id: data.schema._id });
        }
      } else {
        console.error('Form save failed:', data);
        toast.error('Failed to save form');
      }
    } catch (error: any) {
      console.error('Error saving schema:', error);
      if (error.response?.data?.message?.includes('validation failed')) {
        toast.error('Form validation failed. Please check all required fields.');
      } else if (error.response?.data?.message?.includes('ObjectId')) {
        toast.error('Authentication error. Please refresh the page and try again.');
      } else {
        toast.error('Failed to save form');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    const newField: FormField = {
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      order: availableFields.length,
      section: 'patientInfo',
    };
    setSelectedField(newField);
    setShowFieldDialog(true);
  };

  const handleEditField = (field: FormField) => {
    setSelectedField({ ...field });
    setShowFieldDialog(true);
  };

  const handleSaveField = async () => {
    if (!selectedField) return;

    try {
      const endpoint = selectedField._id ? `/form-fields/${selectedField._id}` : '/form-fields';

      const response = await (selectedField._id
        ? projectApi.put(endpoint, {
            ...selectedField,
            customProject: params.projectId,
          })
        : projectApi.post(endpoint, {
            ...selectedField,
            customProject: params.projectId,
          }));

      const data = response.data;
      if (data.status) {
        toast.success(selectedField._id ? 'Field updated successfully' : 'Field created successfully');
        setShowFieldDialog(false);
        setSelectedField(null);
        loadAvailableFields();
      } else {
        toast.error('Failed to save field');
      }
    } catch (error: any) {
      console.error('Error saving field:', error);
      if (error.response?.data?.message?.includes('duplicate')) {
        toast.error(`A field with the name "${selectedField?.name}" already exists. Please choose a different name.`);
      } else {
        toast.error('Failed to save field');
      }
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      const response = await projectApi.delete(`/form-fields/${fieldId}`);
      const data = response.data;
      if (data.status) {
        toast.success('Field deleted successfully');
        loadAvailableFields();
      } else {
        toast.error('Failed to delete field');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Failed to delete field');
    }
  };

  const addFieldToSection = (fieldId: string, sectionName: string) => {
    setSchema(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.name === sectionName
          ? { ...section, fields: [...section.fields, fieldId] }
          : section
      ),
    }));
  };

  const handleDrop = (e: React.DragEvent, sectionName: string) => {
    e.preventDefault();
    const fieldId = e.dataTransfer.getData('fieldId');
    if (fieldId && !schema.sections.find(s => s.name === sectionName)?.fields.includes(fieldId)) {
      addFieldToSection(fieldId, sectionName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFieldFromSection = (fieldId: string, sectionName: string) => {
    setSchema(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.name === sectionName
          ? { ...section, fields: section.fields.filter(id => id !== fieldId) }
          : section
      ),
    }));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same section
      if (source.droppableId === 'available-fields') {
        // Reordering available fields - no action needed
        return;
      }

      const section = schema.sections.find(s => s.name === source.droppableId);
      if (!section) return;

      const newFields = Array.from(section.fields);
      const [removed] = newFields.splice(source.index, 1);
      newFields.splice(destination.index, 0, removed);

      setSchema(prev => ({
        ...prev,
        sections: prev.sections.map(s =>
          s.name === source.droppableId ? { ...s, fields: newFields } : s
        ),
      }));
    } else {
      // Moving between different areas
      if (source.droppableId === 'available-fields') {
        // Adding field from available fields to a section
        const destSection = schema.sections.find(s => s.name === destination.droppableId);
        if (!destSection) return;

        const destFields = Array.from(destSection.fields);
        destFields.splice(destination.index, 0, draggableId);

        setSchema(prev => ({
          ...prev,
          sections: prev.sections.map(s =>
            s.name === destination.droppableId ? { ...s, fields: destFields } : s
          ),
        }));
      } else if (destination.droppableId === 'available-fields') {
        // Removing field from section back to available fields
        const sourceSection = schema.sections.find(s => s.name === source.droppableId);
        if (!sourceSection) return;

        const sourceFields = Array.from(sourceSection.fields);
        sourceFields.splice(source.index, 1);

        setSchema(prev => ({
          ...prev,
          sections: prev.sections.map(s =>
            s.name === source.droppableId ? { ...s, fields: sourceFields } : s
          ),
        }));
      } else {
        // Moving between sections
        const sourceSection = schema.sections.find(s => s.name === source.droppableId);
        const destSection = schema.sections.find(s => s.name === destination.droppableId);

        if (!sourceSection || !destSection) return;

        const sourceFields = Array.from(sourceSection.fields);
        const destFields = Array.from(destSection.fields);
        const [removed] = sourceFields.splice(source.index, 1);
        destFields.splice(destination.index, 0, removed);

        setSchema(prev => ({
          ...prev,
          sections: prev.sections.map(s => {
            if (s.name === source.droppableId) return { ...s, fields: sourceFields };
            if (s.name === destination.droppableId) return { ...s, fields: destFields };
            return s;
          }),
        }));
      }
    }
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
                Form Builder
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {schemaId ? 'Edit existing form' : 'Create a new custom form'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={handleSaveSchema} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Form'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="form-name">Form Name</Label>
                <Input
                  id="form-name"
                  value={schema.name}
                  onChange={(e) => setSchema(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter form name"
                />
              </div>
              <div>
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  value={schema.description || ''}
                  onChange={(e) => setSchema(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Available Fields */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Available Fields</CardTitle>
                <Button size="sm" onClick={handleAddField}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="available-fields" type="field">
                {(provided) => (
                  <div
                    className="space-y-2 max-h-96 overflow-y-auto"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {availableFields.map((field, index) => (
                      <Draggable key={field._id} draggableId={field._id!} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                              snapshot.isDragging ? 'shadow-lg bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div>
                              <p className="font-medium text-sm">{field.label}</p>
                              <p className="text-xs text-gray-500">{field.type}</p>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditField(field)}
                              >
                                <Settings className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteField(field._id!)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-3">
          {isPreview ? (
            <FormPreview schema={schema} availableFields={availableFields} />
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="space-y-6">
                {schema.sections.map((section) => (
                  <Card key={section.name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{section.label}</CardTitle>
                        <Switch
                          checked={section.enabled}
                          onCheckedChange={(enabled) =>
                            setSchema(prev => ({
                              ...prev,
                              sections: prev.sections.map(s =>
                                s.name === section.name ? { ...s, enabled } : s
                              ),
                            }))
                          }
                        />
                      </div>
                    </CardHeader>
                    {section.enabled && (
                      <CardContent>
                        <Droppable droppableId={section.name}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              onDrop={(e) => handleDrop(e, section.name)}
                              onDragOver={handleDragOver}
                              className={`min-h-[100px] border-2 border-dashed rounded-lg p-4 transition-colors ${
                                snapshot.isDraggingOver
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              {section.fields.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                  Drop fields here or drag from available fields
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {section.fields.map((fieldId, index) => {
                                    const field = availableFields.find(f => f._id === fieldId);
                                    if (!field) return null;

                                    return (
                                      <Draggable key={fieldId} draggableId={fieldId} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`flex items-center justify-between p-3 border rounded bg-white dark:bg-gray-800 ${
                                              snapshot.isDragging ? 'shadow-lg' : ''
                                            }`}
                                          >
                                            <div>
                                              <p className="font-medium">{field.label}</p>
                                              <p className="text-sm text-gray-500">{field.type}</p>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => removeFieldFromSection(fieldId, section.name)}
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Field Editor Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedField?._id ? 'Edit Field' : 'Create New Field'}</DialogTitle>
          </DialogHeader>

          {selectedField && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-name">Field Name</Label>
                  <Input
                    id="field-name"
                    value={selectedField.name}
                    onChange={(e) => setSelectedField(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="field_name"
                  />
                </div>
                <div>
                  <Label htmlFor="field-label">Display Label</Label>
                  <Input
                    id="field-label"
                    value={selectedField.label}
                    onChange={(e) => setSelectedField(prev => prev ? { ...prev, label: e.target.value } : null)}
                    placeholder="Field Label"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-type">Field Type</Label>
                  <Select
                    value={selectedField.type}
                    onValueChange={(value: any) => setSelectedField(prev => prev ? { ...prev, type: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="field-section">Section</Label>
                  <Select
                    value={selectedField.section}
                    onValueChange={(value: any) => setSelectedField(prev => prev ? { ...prev, section: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map((section) => (
                        <SelectItem key={section.value} value={section.value}>
                          {section.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="field-placeholder">Placeholder (Optional)</Label>
                <Input
                  id="field-placeholder"
                  value={selectedField.placeholder || ''}
                  onChange={(e) => setSelectedField(prev => prev ? { ...prev, placeholder: e.target.value } : null)}
                  placeholder="Enter placeholder text"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="field-required"
                  checked={selectedField.required}
                  onCheckedChange={(required) => setSelectedField(prev => prev ? { ...prev, required } : null)}
                />
                <Label htmlFor="field-required">Required field</Label>
              </div>

              {/* Options for select/multiselect/radio/checkbox */}
              {(selectedField.type === 'select' || selectedField.type === 'multiselect' ||
                selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2 mt-2">
                    {selectedField.options?.map((option, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          placeholder="Label"
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...(selectedField.options || [])];
                            newOptions[index] = { ...newOptions[index], label: e.target.value };
                            setSelectedField(prev => prev ? { ...prev, options: newOptions } : null);
                          }}
                        />
                        <Input
                          placeholder="Value"
                          value={option.value}
                          onChange={(e) => {
                            const newOptions = [...(selectedField.options || [])];
                            newOptions[index] = { ...newOptions[index], value: e.target.value };
                            setSelectedField(prev => prev ? { ...prev, options: newOptions } : null);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newOptions = (selectedField.options || []).filter((_, i) => i !== index);
                            setSelectedField(prev => prev ? { ...prev, options: newOptions } : null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newOptions = [...(selectedField.options || []), { label: '', value: '' }];
                        setSelectedField(prev => prev ? { ...prev, options: newOptions } : null);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveField}>
                  {selectedField._id ? 'Update Field' : 'Create Field'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Form Preview Component
function FormPreview({ schema, availableFields }: { schema: FormSchema; availableFields: FormField[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Preview: {schema.name}</CardTitle>
          <CardDescription>{schema.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {schema.sections
            .filter(section => section.enabled)
            .map((section) => (
              <div key={section.name} className="mb-6">
                <h3 className="text-lg font-semibold mb-4">{section.label}</h3>
                <div className="space-y-4">
                  {section.fields.map((fieldId) => {
                    const field = availableFields.find(f => f._id === fieldId);
                    if (!field) return null;

                    return (
                      <div key={fieldId} className="space-y-2">
                        <Label>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {renderFieldPreview(field)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function renderFieldPreview(field: FormField) {
  switch (field.type) {
    case 'text':
    case 'number':
    case 'date':
      return <Input type={field.type} placeholder={field.placeholder} disabled />;
    case 'textarea':
      return <Textarea placeholder={field.placeholder} disabled />;
    case 'boolean':
      return <Switch disabled />;
    case 'select':
      return (
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || 'Select option'} />
          </SelectTrigger>
        </Select>
      );
    case 'multiselect':
      return (
        <div className="text-sm text-gray-500">
          Multi-select field (multiple options can be selected)
        </div>
      );
    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input type="radio" disabled />
              <Label>{option.label}</Label>
            </div>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input type="checkbox" disabled />
              <Label>{option.label}</Label>
            </div>
          ))}
        </div>
      );
    default:
      return <div className="text-gray-500">Unsupported field type</div>;
  }
}
