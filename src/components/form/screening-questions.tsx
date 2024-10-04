"use client";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect } from "react";

export function ScreeningQuestions({ form }: any) {

  const weight = form.watch("screening");

  console.log(weight)

  useEffect(() => {
    const weight = form.watch("screening.weight");
    const height = form.watch("screening.height");

    if (weight && height) {
      const bmi = weight / Math.pow(height / 100, 2); // BMI formula
      form.setValue("screening.bmi", bmi.toFixed(2)); // Update BMI field with 2 decimal places
    }
  }, [form.watch("screening.weight"), form.watch("screening.height")]);
  return (
    <div className="space-y-4 py-8">
      <h2 className="text-center text-lg font-bold">SCREENING QUESTIONS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patient Number */}
        <FormField
          control={form.control}
          name="screening.patientIdentifier"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="patient-number">Patient Number:</FormLabel>
              <FormControl>
                <Input id="patient-number" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Height */}
        <FormField
          control={form.control}
          name="screening.height"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="height">Height (cm):</FormLabel>
              <FormControl>
                <Input
                  id="height"
                  value={field.value !== undefined ? field.value.toString() : ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
            <FormItem className="space-y-2">
              <FormLabel htmlFor="weight">Weight (kg):</FormLabel>
              <FormControl>
                <Input
                  id="weight"
                  value={field.value !== undefined ? field.value.toString() : ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Second Section - BMI, Blood Pressure, HB all in the same row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* BMI */}
        <FormField
          control={form.control}
          name="screening.bmi"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="bmi">BMI:</FormLabel>
              <FormControl>
                <Input
                  id="bmi"
                  type="number"
                  value={field.value !== undefined ? field.value.toString() : ""}
                  readOnly // Making the BMI field read-only as it auto-calculates
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Blood Pressure */}
        <FormField
          control={form.control}
          name="screening.bloodPressure"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="blood-pressure">Blood Pressure:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
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
            <FormItem className="space-y-2">
              <FormLabel htmlFor="hb">HB:</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
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
      
      {/* New Patient Identifier Input */}
      <div className="space-y-2">
        {/* Existing Screening Questions */}
        <FormField
          control={form.control}
          name="screening.illness"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Do you have any chronic illnesses?</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row space-x-2"
                >
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="yes">Yes (name it)</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="no">No</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="dont-know" />
                    <Label htmlFor="dont-know">I don&lsquo;t know</Label>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="screening.medication"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Are you on any medication?</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row space-x-2"
                >
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="yes">Yes (name them)</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="no">No</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="stopped" />
                    <Label htmlFor="stopped">I stopped</Label>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="screening.alcoholOrSmokeUsage"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Do you smoke/drink alcohol?</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row space-x-2"
                >
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="no">No</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="stopped" />
                    <Label htmlFor="stopped">I stopped</Label>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="screening.chronicDiseases"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>
                Does your family have any history of chronic diseases?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row space-x-2"
                >
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="yes">Yes (name them)</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="no">No</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="dont-know" />
                    <Label htmlFor="dont-know">I don&lsquo;t know</Label>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="screening.vaccinationHistory"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Vaccination history</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row space-x-2"
                >
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="no">No</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="ready" />
                    <Label htmlFor="ready">Ready to vaccinate</Label>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="refuse" />
                    <Label htmlFor="refuse">
                      I don&lsquo;t want to vaccinate (reason)
                    </Label>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
