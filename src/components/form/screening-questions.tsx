"use client";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../ui/form";
import {
  Activity,
  Ruler,
  Weight,
  Heart,
  Droplets,
  FileText,
  User,
  AlertCircle,
  Pill,
  Wine,
  Users,
  Syringe
} from "lucide-react";

export function ScreeningQuestions({ form }: any) {
  useEffect(() => {
    const weight = form.watch("screening.weight");
    const height = form.watch("screening.height");

    if (weight && height) {
      const bmi = weight / Math.pow(height / 100, 2);
      form.setValue("screening.bmi", bmi.toFixed(2));
    }
  }, [form.watch("screening.weight"), form.watch("screening.height")]);

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Screening Questions
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Record patient vitals and health screening information
        </p>
      </div>

      {/* Patient Identifier */}
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
            name="screening.patientIdentifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter patient identifier"
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500 font-mono"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Vitals Section */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            Vital Signs
          </CardTitle>
          <CardDescription>
            Record patient height, weight, BMI, blood pressure, and hemoglobin levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Height */}
            <FormField
              control={form.control}
              name="screening.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-gray-500" />
                    Height (cm)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value !== undefined ? field.value.toString() : ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Enter height"
                      className="border-gray-300 dark:border-gray-600 focus:border-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight */}
            <FormField
              control={form.control}
              name="screening.weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-gray-500" />
                    Weight (kg)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value !== undefined ? field.value.toString() : ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Enter weight"
                      className="border-gray-300 dark:border-gray-600 focus:border-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BMI */}
            <FormField
              control={form.control}
              name="screening.bmi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    BMI (Auto-calculated)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value !== undefined ? field.value.toString() : ""}
                      readOnly
                      className="border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 font-semibold"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Automatically calculated from height and weight
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Blood Pressure */}
            <FormField
              control={form.control}
              name="screening.bloodPressure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-500" />
                    Blood Pressure
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-green-500">
                        <SelectValue placeholder="Select blood pressure status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* HB */}
            <FormField
              control={form.control}
              name="screening.hb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-500" />
                    Hemoglobin (HB)
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-green-500">
                        <SelectValue placeholder="Select HB status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Health History Questions */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Health History & Screening Questions
          </CardTitle>
          <CardDescription>
            Answer the following questions about medical history and current health status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chronic Illnesses */}
          <FormField
            control={form.control}
            name="screening.illness"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Do you have any chronic illnesses?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-row flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="illness-yes" />
                      <Label htmlFor="illness-yes" className="font-normal cursor-pointer">
                        Yes (name it)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="illness-no" />
                      <Label htmlFor="illness-no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dont-know" id="illness-dont-know" />
                      <Label htmlFor="illness-dont-know" className="font-normal cursor-pointer">
                        I don&apos;t know
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Medication */}
          <FormField
            control={form.control}
            name="screening.medication"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base flex items-center gap-2">
                  <Pill className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Are you on any medication?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-row flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="medication-yes" />
                      <Label htmlFor="medication-yes" className="font-normal cursor-pointer">
                        Yes (name them)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="medication-no" />
                      <Label htmlFor="medication-no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stopped" id="medication-stopped" />
                      <Label htmlFor="medication-stopped" className="font-normal cursor-pointer">
                        I stopped
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Alcohol/Smoke Usage */}
          <FormField
            control={form.control}
            name="screening.alcoholOrSmokeUsage"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base flex items-center gap-2">
                  <Wine className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Do you smoke/drink alcohol?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-row flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="alcohol-yes" />
                      <Label htmlFor="alcohol-yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="alcohol-no" />
                      <Label htmlFor="alcohol-no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stopped" id="alcohol-stopped" />
                      <Label htmlFor="alcohol-stopped" className="font-normal cursor-pointer">
                        I stopped
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Family History */}
          <FormField
            control={form.control}
            name="screening.chronicDiseases"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Does your family have any history of chronic diseases?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-row flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="family-yes" />
                      <Label htmlFor="family-yes" className="font-normal cursor-pointer">
                        Yes (name them)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="family-no" />
                      <Label htmlFor="family-no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dont-know" id="family-dont-know" />
                      <Label htmlFor="family-dont-know" className="font-normal cursor-pointer">
                        I don&apos;t know
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vaccination History */}
          <FormField
            control={form.control}
            name="screening.vaccinationHistory"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Vaccination history
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-row flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="vaccine-yes" />
                      <Label htmlFor="vaccine-yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="vaccine-no" />
                      <Label htmlFor="vaccine-no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ready" id="vaccine-ready" />
                      <Label htmlFor="vaccine-ready" className="font-normal cursor-pointer">
                        Ready to vaccinate
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="refuse" id="vaccine-refuse" />
                      <Label htmlFor="vaccine-refuse" className="font-normal cursor-pointer">
                        I don&apos;t want to vaccinate (reason)
                      </Label>
                    </div>
                  </RadioGroup>
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
