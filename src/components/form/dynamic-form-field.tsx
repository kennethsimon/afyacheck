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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DynamicFormFieldProps {
  field: any; // FormField from backend
  form: any; // React Hook Form instance
  value?: any; // Current value
}

export function DynamicFormField({ field: formField, form, value }: DynamicFormFieldProps) {
  const fieldName = formField.name;
  const fieldType = formField.type;
  const isRequired = formField.required;

  const renderField = () => {
    switch (fieldType) {
      case "text":
      case "number":
      case "date":
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: isRequired ? `${formField.label} is required` : false }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  {formField.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={fieldType}
                    placeholder={formField.placeholder || `Enter ${formField.label.toLowerCase()}`}
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    value={field.value || ""}
                  />
                </FormControl>
                {formField.placeholder && (
                  <FormDescription className="text-gray-500 dark:text-gray-400">
                    {formField.placeholder}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "textarea":
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: isRequired ? `${formField.label} is required` : false }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  {formField.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={formField.placeholder || `Enter ${formField.label.toLowerCase()}`}
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500 min-h-[100px]"
                    value={field.value || ""}
                  />
                </FormControl>
                {formField.placeholder && (
                  <FormDescription className="text-gray-500 dark:text-gray-400">
                    {formField.placeholder}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: isRequired ? `${formField.label} is required` : false }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  {formField.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 focus:border-blue-500">
                      <SelectValue placeholder={formField.placeholder || `Select ${formField.label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {formField.options?.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formField.placeholder && (
                  <FormDescription className="text-gray-500 dark:text-gray-400">
                    {formField.placeholder}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "multiselect":
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: isRequired ? `${formField.label} is required` : false }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  {formField.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {formField.options?.map((option: any) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${fieldName}-${option.value}`}
                          checked={Array.isArray(field.value) && field.value.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValue = Array.isArray(field.value) ? field.value : [];
                            if (checked) {
                              field.onChange([...currentValue, option.value]);
                            } else {
                              field.onChange(currentValue.filter((v: string) => v !== option.value));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`${fieldName}-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                {formField.placeholder && (
                  <FormDescription className="text-gray-500 dark:text-gray-400">
                    {formField.placeholder}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "boolean":
      case "checkbox":
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: isRequired ? `${formField.label} is required` : false }}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    {formField.label}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                  {formField.placeholder && (
                    <FormDescription className="text-gray-500 dark:text-gray-400">
                      {formField.placeholder}
                    </FormDescription>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "radio":
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: isRequired ? `${formField.label} is required` : false }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  {formField.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    className="flex flex-col space-y-1"
                  >
                    {formField.options?.map((option: any) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${fieldName}-${option.value}`} />
                        <Label
                          htmlFor={`${fieldName}-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                {formField.placeholder && (
                  <FormDescription className="text-gray-500 dark:text-gray-400">
                    {formField.placeholder}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: isRequired ? `${formField.label} is required` : false }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  {formField.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={formField.placeholder || `Enter ${formField.label.toLowerCase()}`}
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    value={field.value || ""}
                  />
                </FormControl>
                {formField.placeholder && (
                  <FormDescription className="text-gray-500 dark:text-gray-400">
                    {formField.placeholder}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return <div>{renderField()}</div>;
}

