"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { regionsData } from "@/data/data";
import { UserPlus, Phone, FileText, Calendar, MapPin, CreditCard } from "lucide-react";
import { DynamicFormField } from "./dynamic-form-field";
import { getFormFields } from "@/services/formFields";

// Define your component
export function PatientInfo({ form, projectConfig }: any) {
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
        
        // Filter fields that are in the config and belong to patientInfo section
        const patientInfoFields = allFields.filter((f: any) => 
          configFieldIds.includes(f._id?.toString() || f._id) && 
          f.section === 'patientInfo'
        );
        
        setCustomFields(patientInfoFields.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      } catch (error) {
        console.error("Error loading custom fields:", error);
      } finally {
        setLoadingFields(false);
      }
    };

    loadCustomFields();
  }, [projectConfig]);
  const [districts, setDistricts] = useState<any[]>([]); // For storing the districts
  const [selectedRegion, setSelectedRegion] = useState<any>("");

  // Function to fetch districts based on selected region
  const fetchDistricts = (region: any) => {
    const selectedRegionData = regionsData.find((r: any) => r.name === region);
    if (selectedRegionData) {
      setDistricts(selectedRegionData?.districts.map((district: any) => district.name)); // Set the fetched districts into state
    } else {
      setDistricts([]); // Reset districts if region is not found
    }
  };

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Personal Information</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Patient Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Patient Name
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter full name"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Full name of the patient
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Gender</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 focus:border-blue-500">
                      <span className={!field.value ? "text-gray-400" : ""}>
                        {field.value || "Select gender"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Patient's gender
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="date"
                    placeholder="YYYY-MM-DD"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Patient's date of birth
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Contact Information</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel"
                    placeholder="+255 XXX XXX XXX"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Contact phone number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Region Selection */}
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Region
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      setSelectedRegion(value);
                      field.onChange(value);
                      fetchDistricts(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 focus:border-blue-500">
                      <span className={!field.value ? "text-gray-400" : ""}>
                        {field.value || "Select region"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {regionsData.map((region: any) => (
                        <SelectItem key={region.name} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Select patient's region
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* District Selection */}
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  District
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedRegion || districts.length === 0}
                  >
                    <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 focus:border-blue-500 disabled:opacity-50">
                      <span className={!field.value ? "text-gray-400" : ""}>
                        {field.value || 
                          (!selectedRegion
                            ? "Select a region first"
                            : districts.length > 0
                            ? "Select district"
                            : "No districts available")}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Select district (select region first)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Other Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Additional Information</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Insurance/Bima */}
          <FormField
            control={form.control}
            name="insurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Insurance/Bima
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter insurance number (optional)"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Insurance or Bima number (if applicable)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2 lg:col-span-3">
                <FormLabel className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address (Where the Patient is Coming From)
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter full address"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Complete address where the patient is coming from
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Custom Fields Section */}
      {customFields.length > 0 && (
        <div className="space-y-4">
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
      )}
    </div>
  );
}
