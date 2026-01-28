"use client";
import { useState } from "react";
import { AddForm, AddFormSchema } from "@/components/add-form";
import AwesomeDrawer from "@/components/drawer";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { toast } from "sonner";
import projectApi from "../services/config";
import { Activity } from "lucide-react";

type AddProjectOrCampDialogProps = {
  type: "Project" | "Camp";
  projectId: string;
  id: string;
};

export function AddProjectOrCampDialog({
  type,
  projectId,
  id,
}: AddProjectOrCampDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof AddFormSchema>) => {
    // Handle form submission here...
    // remember the type has be passed in the props as either "project" or "camp"
    setLoading(true);
    if (type === "Camp") {
      console.log({ ...data, project: projectId });
      const res = await projectApi.post("/camps", {
        ...data,
        project: projectId,
      });
      if (res) {
        toast("Camp created successfully.", {
          description: "",
          action: {
            label: "Open",
            onClick: () => {
              console.log("Opening item...");
            },
          },
        });
        setLoading(false);
      }
    } else {
      const res = await projectApi.post("/projects", { ...data });
      if (res) {
        toast("Project created successfully.", {
          description: "",
          action: {
            label: "Open",
            onClick: () => {
              console.log("Opening item...");
            },
          },
        });
        setLoading(false);
      }
    }

    // Close the drawer
    setIsOpen(false);
    setLoading(false);
    window.location.reload();
  };

  const onClose = () => {
    toast("Item creation cancelled.", {
      description: "You can close the drawer.",
    });
    setIsOpen(false);
  };

  return (
    <AwesomeDrawer
      openTrigger={
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Activity className="w-4 h-4 mr-2" />
          Create {type === "Project" ? "Health Program" : "Medical Camp"}
        </Button>
      }
      title={`Create New ${type === "Project" ? "Health Program" : "Medical Camp"}`}
      isForm={true}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      closeTrigger={<Button onClick={() => setIsOpen(false)} variant="outline">Close</Button>}
    >
      <AddForm loading={loading} onSubmit={onSubmit} onClose={onClose} />
    </AwesomeDrawer>
  );
}
