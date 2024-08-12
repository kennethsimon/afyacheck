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
        name="clinicalFindings.height"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="height">Height (cm):</FormLabel>
            {/*  select */}
            <FormControl>
              <Input
                id="height"
                type="number"
                value={field.value !== undefined ? field.value.toString() : ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.weight"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="weight">Weight (kg):</FormLabel>
            {/* input*/}

            <FormControl>
              <Input
                id="weight"
                type="number"
                value={field.value !== undefined ? field.value.toString() : ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.bmi"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="bmi">BMI:</FormLabel>
            {/* input*/}

            <FormControl>
              <Input
                id="bmi"
                type="number"
                value={field.value !== undefined ? field.value.toString() : ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.bloodPressure"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="blood-pressure">Blood pressure:</FormLabel>
            {/* input */}

            <FormControl>
              <Input id="blood-pressure" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.rbgFbs"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="rbg-fbs">RBG/FBS:</FormLabel>
            {/* input */}
            <FormControl>
              <Input id="rbg-fbs" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.bloodGroup"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="blood-group">Blood group:</FormLabel>
            {/* select */}
            <FormControl>
              <Input id="blood-group" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.cholesterol"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="cholesterol">Cholesterol:</FormLabel>
            {/* input */}
            <FormControl>
              <Input id="cholesterol" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.physicalAppearance"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="physical-appearance">
              Physical appearance:
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
        name="clinicalFindings.cancer"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="cancer">Cancer:</FormLabel>
            <FormControl>
              <Textarea id="cancer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.ecgEcho"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="ecg-echo">ECG/Echo:</FormLabel>
            <FormControl>
              <Textarea id="ecg-echo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.mse"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="mse">MSE:</FormLabel>
            <FormControl>
              <Textarea id="mse" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.physio"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="physio">Physio:</FormLabel>
            <FormControl>
              <Textarea id="physio" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.ot"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="ot">OT:</FormLabel>
            <FormControl>
              <Textarea id="ot" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.dental"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="dental">Dental:</FormLabel>
            <FormControl>
              <Textarea id="dental" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.ophthalmology"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="ophthalmology">Ophthalmology:</FormLabel>
            <FormControl>
              <Textarea id="ophthalmology" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.comments"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="comments">Comments:</FormLabel>
            <FormControl>
              <Textarea id="comments" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.prescription"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="prescription">Prescription:</FormLabel>
            <FormControl>
              <Textarea id="prescription" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinicalFindings.referral"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="referral">Referral:</FormLabel>
            <FormControl>
              <Textarea id="referral" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
