"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { getFormFields, createFormField, updateFormField, deleteFormField } from "@/services/formFields";
import { toast } from "sonner";
// Drag and drop can be added later with @dnd-kit packages

interface FormBuilderProps {
  projectId: string;
  formConfig: any;
  onSave: (config: any) => void;
  saving: boolean;
}

interface FormField {
  _id?: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  section: string;
  order: number;
}

function FieldItem({ field, onEdit, onDelete }: { field: FormField; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 p-3 border rounded-lg bg-white dark:bg-gray-800">
      <div className="flex-1">
        <div className="font-medium">{field.label}</div>
        <div className="text-sm text-gray-500">{field.type} • {field.section}</div>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        Edit
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function FormBuilder({ projectId, formConfig, onSave, saving }: FormBuilderProps) {
  const [fields, setFields] = React.useState<FormField[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [editingField, setEditingField] = React.useState<FormField | null>(null);
  const [selectedSection, setSelectedSection] = React.useState("patientInfo");


  React.useEffect(() => {
    loadFields();
  }, [formConfig]);

  const loadFields = async () => {
    setLoading(true);
    try {
      // Fetch fields for this specific project
      const result = await getFormFields(projectId);
      const allFields = result.formFields || [];
      
      // Check if formConfig.fields is already populated (contains objects) or just IDs
      const configFields = formConfig?.fields || [];
      
      if (configFields.length > 0) {
        if (typeof configFields[0] === 'object' && configFields[0]._id) {
          // Fields are already populated from backend
          setFields(configFields.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
        } else {
          // Fields are just IDs, need to filter
          const configFieldIds = configFields.map((id: any) => id?.toString?.() || id);
          const filteredFields = allFields.filter((f: any) => 
            configFieldIds.includes(f._id?.toString?.() || f._id)
          );
          setFields(filteredFields.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
        }
      } else {
        // No fields in config yet, show empty list
        setFields([]);
      }
    } catch (error) {
      console.error("Error loading fields:", error);
      toast.error("Failed to load form fields");
    } finally {
      setLoading(false);
    }
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    setFields((items) => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= items.length) return items;
      const newItems = [...items];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return newItems.map((item, idx) => ({ ...item, order: idx }));
    });
  };

  const handleSave = async () => {
    const fieldIds = fields.map((f) => f._id).filter(Boolean);
    await onSave({
      ...formConfig,
      fields: fieldIds,
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading form fields...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Form Fields</h3>
          <p className="text-sm text-gray-500">Manage and reorder form fields</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <FieldItem
            key={field._id || field.name}
            field={field}
            onEdit={() => setEditingField(field)}
            onDelete={async () => {
              if (field._id) {
                await deleteFormField(field._id);
                await loadFields();
                toast.success("Field deleted");
              }
            }}
          />
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500 border rounded-lg">
          No form fields yet. Click "Add Field" to create one.
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>

      {(showAddDialog || editingField) && (
        <FieldDialog
          field={editingField}
          section={selectedSection}
          onClose={() => {
            setShowAddDialog(false);
            setEditingField(null);
          }}
          onSave={async (fieldData) => {
            try {
              if (editingField?._id) {
                await updateFormField(editingField._id, fieldData);
                toast.success("Field updated");
                await loadFields();
                setShowAddDialog(false);
                setEditingField(null);
              } else {
                // Create the field with project ID
                const result = await createFormField(projectId, fieldData);
                // The backend returns { status, formField }
                const newField = result?.formField || result?.data?.formField || result;
                
                if (newField?._id) {
                  // Add the new field to the local state immediately
                  const fieldWithId = { ...fieldData, _id: newField._id };
                  
                  // Update the formConfig to include this field
                  const currentFieldIds = fields.map((f) => f._id).filter(Boolean);
                  const updatedFieldIds = [...currentFieldIds, newField._id];
                  
                  // Save the updated config
                  await onSave({
                    ...formConfig,
                    fields: updatedFieldIds,
                  });
                  
                  // Reload fields to get the updated list
                  await loadFields();
                  toast.success("Field created and added to form");
                } else {
                  // Fallback: just reload all fields
                  await loadFields();
                  toast.success("Field created");
                }
                setShowAddDialog(false);
                setEditingField(null);
              }
            } catch (error: any) {
              const errorMessage = error?.response?.data?.message || error?.message || "Failed to save field";
              toast.error(errorMessage);
            }
          }}
        />
      )}
    </div>
  );
}

function FieldDialog({
  field,
  section,
  onClose,
  onSave,
}: {
  field: FormField | null;
  section: string;
  onClose: () => void;
  onSave: (data: FormField) => void;
}) {
  const [formData, setFormData] = React.useState<FormField>({
    name: field?.name || "",
    label: field?.label || "",
    type: field?.type || "text",
    required: field?.required || false,
    placeholder: field?.placeholder || "",
    options: field?.options || [],
    section: field?.section || section,
    order: field?.order || 0,
  });

  const [newOption, setNewOption] = React.useState({ label: "", value: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addOption = () => {
    if (newOption.label && newOption.value) {
      setFormData((prev) => ({
        ...prev,
        options: [...(prev.options || []), newOption],
      }));
      setNewOption({ label: "", value: "" });
    }
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{field ? "Edit Field" : "Add New Field"}</CardTitle>
          <CardDescription>Configure form field properties</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Field Name (ID)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., patientName"
                  required
                />
              </div>
              <div>
                <Label>Field Label</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Patient Name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Field Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="multiselect">Multi-Select</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => setFormData({ ...formData, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patientInfo">Patient Info</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="clinicalFindings">Clinical Findings</SelectItem>
                    <SelectItem value="doctorComments">Doctor Comments</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Placeholder</Label>
              <Input
                value={formData.placeholder}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                placeholder="Enter placeholder text"
              />
            </div>

            {(formData.type === "select" || formData.type === "multiselect" || formData.type === "radio") && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {formData.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={option.label} disabled />
                      <Input value={option.value} disabled />
                      <Button type="button" variant="ghost" onClick={() => removeOption(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Label"
                      value={newOption.label}
                      onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                    />
                    <Input
                      placeholder="Value"
                      value={newOption.value}
                      onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                    />
                    <Button type="button" onClick={addOption}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="required">Required field</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Field</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

