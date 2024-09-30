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

      {/* New Patient Identifier Input */}
      <FormField
        control={form.control}
        name="doctorComments.patientIdentifier"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="patient-identifier">Patient Identifier</FormLabel>
            <FormControl>
              <Input id="patient-identifier" {...field} placeholder="Enter patient ID" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="doctorComments.doctorsComment"
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
        name="doctorComments.prescription"
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
    </div>
  );
}
