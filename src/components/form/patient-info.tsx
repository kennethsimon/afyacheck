"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { regionsData } from "@/data/data"; 

// Define your component
export function PatientInfo({ form }: any) {
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
    <div className="space-y-8 py-8">
      {/* Personal Information Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Patient Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Name:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
                <FormLabel>Gender:</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <span>{field.value || "Select gender"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
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
                <FormLabel>Date of Birth:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Contact Information Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
                <FormLabel>Region:</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      setSelectedRegion(value); // Set the selected region
                      field.onChange(value); // Update form state
                      fetchDistricts(value); // Fetch districts for the selected region
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <span>{field.value || "Select region"}</span>
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
                <FormLabel>District:</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedRegion || districts.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <span>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Other Information Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Insurance/Bima */}
          <FormField
            control={form.control}
            name="insurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance/Bima:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (Where the Patient is Coming From):</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
