"use client";

import { useState, useEffect } from "react";
import { getFormFields } from "@/services/formFields";
import { DynamicFormField } from "./dynamic-form-field";
import { FileText } from "lucide-react";

interface CustomFieldsSectionProps {
  form: any;
  projectConfig: any;
  section: 'patientInfo' | 'screening' | 'clinicalFindings' | 'doctorComments' | 'custom';
}

export function CustomFieldsSection({ form, projectConfig, section }: CustomFieldsSectionProps) {
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);

  useEffect(() => {
    const loadCustomFields = async () => {
      if (!projectConfig?.formConfig?.fields || projectConfig.formConfig.fields.length === 0) {
        setCustomFields([]);
        return;
      }

      setLoadingFields(true);
      try {
        // Get project ID from config
        const projectId = projectConfig?.project?._id || projectConfig?.project;
        if (!projectId) {
          setCustomFields([]);
          setLoadingFields(false);
          return;
        }
        
        const result = await getFormFields(projectId);
        const allFields = result.formFields || [];
        
        // Get field IDs from config (could be objects or IDs)
        const configFieldIds = projectConfig.formConfig.fields.map((f: any) => 
          typeof f === 'object' ? f._id?.toString() || f._id : f?.toString() || f
        );
        
        // Filter fields that are in the config and belong to the specified section
        const sectionFields = allFields.filter((f: any) => 
          configFieldIds.includes(f._id?.toString() || f._id) && 
          f.section === section
        );
        
        setCustomFields(sectionFields.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      } catch (error) {
        console.error("Error loading custom fields:", error);
      } finally {
        setLoadingFields(false);
      }
    };

    loadCustomFields();
  }, [projectConfig, section]);

  if (customFields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
          <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Custom Fields</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customFields.map((field) => (
          <DynamicFormField
            key={field._id || field.name}
            field={field}
            form={form}
          />
        ))}
      </div>
    </div>
  );
}

