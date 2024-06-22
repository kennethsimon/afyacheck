"use client";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ScreeningQuestions() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">SCREENING QUESTIONS</h2>
      <div className="space-y-2">
        <Label>Do you have any chronic illnesses?</Label>
        <div className="flex gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          <RadioGroup>
            <RadioGroupItem id="chronic-illness" value="yes" />
            <Label>Yes (name it)</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="chronic-illness" value="no" />
            <Label>No</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="chronic-illness" value="dont-know" />
            <Label>I don&lsquo;t know</Label>
          </RadioGroup>
        </div>

        <Label>Are you on any medications?</Label>
        <div className="flex gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          <RadioGroup>
            <RadioGroupItem id="medications" value="yes" />
            <Label>Yes (name them)</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="medications" value="no" />
            <Label>No</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="medications" value="stopped" />
            <Label>I stopped</Label>
          </RadioGroup>
        </div>

        <Label>Do you smoke/drink alcohol?</Label>
        <div className="flex gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          <RadioGroup>
            <RadioGroupItem id="smoke-drink" value="yes" />
            <Label>Yes</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="smoke-drink" value="no" />
            <Label>No</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="smoke-drink" value="stopped" />
            <Label>I stopped</Label>
          </RadioGroup>
        </div>

        <Label>Does your family have any history of chronic diseases?</Label>
        <div className="flex gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          <RadioGroup>
            <RadioGroupItem id="family-history" value="yes" />
            <Label>Yes (name them)</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="family-history" value="no" />
            <Label>No</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="family-history" value="dont-know" />
            <Label>I don&lsquo;t know</Label>
          </RadioGroup>
        </div>

        <Label>Vaccination history</Label>
        <div className="flex gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          <RadioGroup>
            <RadioGroupItem id="vaccination-history" value="yes" />
            <Label>Yes</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="vaccination-history" value="no" />
            <Label>No</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="vaccination-history" value="ready" />
            <Label>Ready to vaccinate</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem id="vaccination-history" value="refuse" />
            <Label>I don&lsquo;t want to vaccinate (reason)</Label>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
