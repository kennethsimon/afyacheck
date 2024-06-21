import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function DoctorComments() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">DOCTOR&lsquo;S COMMENTS</h2>

      <div className="space-y-2">
        <Label htmlFor="ecg-report">ECG/ECHO and report</Label>
        <Textarea id="ecg-report" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mse">MSE:</Label>
        <Input id="mse" type="text" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="physio">PHYSIO:</Label>
        <Input id="physio" type="text" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ot">OT:</Label>
        <Input id="ot" type="text" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dental-report">Dental screening and report</Label>
        <Textarea id="dental-report" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ophthalmology-report">
          Ophthalmology screening and report
        </Label>
        <Textarea id="ophthalmology-report" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="doctors-comment">
          Doctors comment and/or diagnosis if any:
        </Label>
        <Textarea id="doctors-comment" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prescription">Prescription if any:</Label>
        <Textarea id="prescription" />
      </div>
      <div className="space-y-2">
        <Label>Referral:</Label>
        <div className="flex items-center space-x-4">
          <RadioGroup>
            <RadioGroupItem value="yes" />
            <Label>Yes (where?)</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem value="no-need-counselled" />
            <Label>No need counselled</Label>
          </RadioGroup>
          <RadioGroup>
            <RadioGroupItem value="no-need-healthy" />
            <Label>No need healthy</Label>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
