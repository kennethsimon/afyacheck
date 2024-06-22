"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";

export function DoctorComments({ form }: any) {
  return (
    <div className="space-y-4 py-8">
      <h2 className="text-center text-lg font-bold">DOCTOR&lsquo;S COMMENTS</h2>

      <FormField
        control={form.control}
        name="ecgReport"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="ecg-report">ECG/ECHO and report</FormLabel>
            <FormControl>
              <Textarea id="ecg-report" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="mse"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="mse">MSE:</FormLabel>
            <FormControl>
              <Input id="mse" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="physio"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="physio">PHYSIO:</FormLabel>
            <FormControl>
              <Input id="physio" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ot"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="ot">OT:</FormLabel>
            <FormControl>
              <Input id="ot" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dentalReport"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="dental-report">
              Dental screening and report
            </FormLabel>
            <FormControl>
              <Textarea id="dental-report" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ophthalmologyReport"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="ophthalmology-report">
              Ophthalmology screening and report
            </FormLabel>
            <FormControl>
              <Textarea id="ophthalmology-report" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="doctorsComment"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="doctors-comment">
              Doctors comment and/or diagnosis if any:
            </FormLabel>
            <FormControl>
              <Textarea id="doctors-comment" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="prescription"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="prescription">Prescription if any:</FormLabel>
            <FormControl>
              <Textarea id="prescription" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="referral"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Referral:</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-row space-x-2"
              >
                <FormItem className="flex items-baseline space-x-4">
                  <RadioGroupItem value="yes" />
                  <FormLabel>Yes (where?)</FormLabel>
                </FormItem>
                <FormItem className="flex items-baseline space-x-4">
                  <RadioGroupItem value="no-need-counselled" />
                  <FormLabel>No need counselled</FormLabel>
                </FormItem>
                <FormItem className="flex items-baseline space-x-4">
                  <RadioGroupItem value="no-need-healthy" />
                  <FormLabel>No need healthy</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
