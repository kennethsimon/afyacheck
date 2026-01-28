"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionToggleProps {
  config: any;
  onSave: (config: any) => void;
  saving: boolean;
}

export function SectionToggle({ config, onSave, saving }: SectionToggleProps) {
  const [formConfig, setFormConfig] = React.useState(config);

  React.useEffect(() => {
    setFormConfig(config);
  }, [config]);

  const handleToggle = (section: string, value: boolean) => {
    setFormConfig((prev: any) => ({
      ...prev,
      [section]: value,
    }));
  };

  const handleSave = () => {
    onSave(formConfig);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="screening" className="text-base font-semibold">
              Screening Section
            </Label>
            <p className="text-sm text-gray-500">
              Enable screening questions and initial health assessment
            </p>
          </div>
          <Switch
            id="screening"
            checked={formConfig.enableScreening}
            onCheckedChange={(checked) => handleToggle("enableScreening", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="clinical" className="text-base font-semibold">
              Clinical Findings Section
            </Label>
            <p className="text-sm text-gray-500">
              Enable clinical examination and findings data collection
            </p>
          </div>
          <Switch
            id="clinical"
            checked={formConfig.enableClinicalFindings}
            onCheckedChange={(checked) => handleToggle("enableClinicalFindings", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="doctor" className="text-base font-semibold">
              Doctor Comments Section
            </Label>
            <p className="text-sm text-gray-500">
              Enable doctor comments, prescriptions, and referrals
            </p>
          </div>
          <Switch
            id="doctor"
            checked={formConfig.enableDoctorComments}
            onCheckedChange={(checked) => handleToggle("enableDoctorComments", checked)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

