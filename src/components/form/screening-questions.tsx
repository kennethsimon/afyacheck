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

export function ScreeningQuestions({ form }: any) {
  return (
    <div className="space-y-4 py-8">
      <h2 className="text-center text-lg font-bold">SCREENING QUESTIONS</h2>
      <div className="space-y-2">
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
