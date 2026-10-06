"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { FileText, Pill, User, ClipboardList } from "lucide-react";

export function DoctorComments({ form }: any) {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Doctor&apos;s Comments
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Record clinical diagnosis, observations, and treatment prescriptions
        </p>
      </div>

      {/* Patient Identifier Card */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="doctorComments.patientIdentifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Identifier</FormLabel>
                <FormDescription>
                  Enter the unique patient identifier for this record
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter patient ID"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500 font-mono"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Doctor's Comments Card */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-green-600 dark:text-green-400" />
            Clinical Diagnosis & Comments
          </CardTitle>
          <CardDescription>
            Document your clinical findings, diagnosis, and any relevant observations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="doctorComments.doctorsComment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor&apos;s Comment and/or Diagnosis</FormLabel>
                <FormDescription>
                  Provide detailed clinical observations, diagnosis, and any additional notes
                </FormDescription>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter clinical diagnosis, observations, and any relevant medical notes..."
                    className="border-gray-300 dark:border-gray-600 focus:border-green-500 min-h-[150px] resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Prescription Card */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Prescription
          </CardTitle>
          <CardDescription>
            Record any medications, dosages, and treatment instructions prescribed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="doctorComments.prescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prescription Details</FormLabel>
                <FormDescription>
                  List medications, dosages, frequency, duration, and any special instructions
                </FormDescription>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter prescription details (medications, dosages, instructions)..."
                    className="border-gray-300 dark:border-gray-600 focus:border-purple-500 min-h-[150px] resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
