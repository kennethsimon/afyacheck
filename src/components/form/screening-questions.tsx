// components/ScreeningQuestions.tsx
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ScreeningQuestions() {
  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-bold">SCREENING QUESTIONS</h2>
      <div className="space-y-2">
        <Label>Do you have any chronic illnesses?</Label>
        <div className="flex items-center space-x-4">
          <RadioGroup>
            <RadioGroupItem id="chronic-illness" value="yes" />
            <Label>Yes (value it)</Label>
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
      </div>
      {/* Repeat for other questions */}
    </Card>
  );
}
