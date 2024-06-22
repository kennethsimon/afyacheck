"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function PatientInfo() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="patient-name">Patient name:</Label>
          <Input id="patient-name" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age:</Label>
          <Input id="age" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender:</Label>
          <Input id="gender" type="text" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of birth:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input id="dob" type="text" />
            </PopoverTrigger>
            <PopoverContent className="p-0 max-w-[276px]">
              <Calendar />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tel-no">Tel. no:</Label>
          <Input id="tel-no" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location (District):</Label>
          <Input id="location" type="text" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="insurance">Insurance/Bima:</Label>
        <Input id="insurance" type="text" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">
          Address (where the patient is coming from):
        </Label>
        <Input id="address" type="text" />
      </div>
    </div>
  );
}
