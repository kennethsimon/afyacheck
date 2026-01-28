"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsConfigProps {
  analyticsConfig: any;
  onSave: (config: any) => void;
  saving: boolean;
}

export function AnalyticsConfig({ analyticsConfig, onSave, saving }: AnalyticsConfigProps) {
  const [config, setConfig] = React.useState(analyticsConfig);
  const [newMetric, setNewMetric] = React.useState({ name: "", field: "", aggregation: "count" });

  React.useEffect(() => {
    setConfig(analyticsConfig);
  }, [analyticsConfig]);

  const handleToggle = (enabled: boolean) => {
    setConfig((prev: any) => ({ ...prev, enabled }));
  };

  const addMetric = () => {
    if (newMetric.name && newMetric.field) {
      setConfig((prev: any) => ({
        ...prev,
        customMetrics: [...(prev.customMetrics || []), newMetric],
      }));
      setNewMetric({ name: "", field: "", aggregation: "count" });
    }
  };

  const removeMetric = (index: number) => {
    setConfig((prev: any) => ({
      ...prev,
      customMetrics: prev.customMetrics.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="analytics-enabled" className="text-base font-semibold">
            Enable Analytics
          </Label>
          <p className="text-sm text-gray-500">
            Enable analytics and reporting for this project
          </p>
        </div>
        <Switch
          id="analytics-enabled"
          checked={config.enabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {config.enabled && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold mb-4 block">Custom Metrics</Label>
            <div className="space-y-2">
              {config.customMetrics?.map((metric: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-sm text-gray-500">
                      {metric.field} • {metric.aggregation}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMetric(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 border rounded-lg space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Metric Name"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                />
                <Input
                  placeholder="Field Name"
                  value={newMetric.field}
                  onChange={(e) => setNewMetric({ ...newMetric, field: e.target.value })}
                />
                <Select
                  value={newMetric.aggregation}
                  onValueChange={(value) => setNewMetric({ ...newMetric, aggregation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="min">Min</SelectItem>
                    <SelectItem value="max">Max</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addMetric} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Metric
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}

