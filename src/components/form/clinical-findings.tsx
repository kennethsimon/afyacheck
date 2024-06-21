import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ClinicalFindings() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">CLINICAL FINDINGS</h2>
      <div className="grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm):</Label>
          <Input id="height" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg):</Label>
          <Input id="weight" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bmi">BMI:</Label>
          <Input id="bmi" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blood-pressure">Blood pressure:</Label>
          <Input id="blood-pressure" type="text" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="rbg">RBG/FBS:</Label>
          <Input id="rbg" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blood-group">Blood group:</Label>
          <Input id="blood-group" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cholesterol">Cholesterol:</Label>
          <Input id="cholesterol" type="text" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="physical-appearance">Physical appearance</Label>
        <Textarea id="physical-appearance" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cancer-report">Cancer screened and report</Label>
        <Textarea id="cancer-report" />
      </div>
    </div>
  );
}
