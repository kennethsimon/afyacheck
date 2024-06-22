"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";

export function ClinicalFindings({ form }: any) {
  return (
    <div className="space-y-4 py-8">
      <h2 className="text-center text-lg font-bold">CLINICAL FINDINGS</h2>

      <FormField
        control={form.control}
        name="height"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="height">Height (cm):</FormLabel>
            <FormControl>
              <Input id="height" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="weight"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="weight">Weight (kg):</FormLabel>
            <FormControl>
              <Input id="weight" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bmi"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="bmi">BMI:</FormLabel>
            <FormControl>
              <Input id="bmi" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bloodPressure"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="blood-pressure">Blood pressure:</FormLabel>
            <FormControl>
              <Input id="blood-pressure" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="rbg"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="rbg">RBG/FBS:</FormLabel>
            <FormControl>
              <Input id="rbg" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bloodGroup"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="blood-group">Blood group:</FormLabel>
            <FormControl>
              <Input id="blood-group" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cholesterol"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="cholesterol">Cholesterol:</FormLabel>
            <FormControl>
              <Input id="cholesterol" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="physicalAppearance"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="physical-appearance">
              Physical appearance
            </FormLabel>
            <FormControl>
              <Textarea id="physical-appearance" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cancerReport"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="cancer-report">
              Cancer screened and report
            </FormLabel>
            <FormControl>
              <Textarea id="cancer-report" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
