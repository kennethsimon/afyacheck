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
    try {
      if (type === "Camp") {
        if (!projectId) {
          toast.error("Project ID is required to create a camp");
          setLoading(false);
          return;
        }
        console.log({ ...data, project: projectId });
        const res = await projectApi.post("/camps", {
          ...data,
          project: projectId,
        });
        if (res?.data?.status) {
          toast.success("Camp created successfully.", {
            description: "The camp has been added to your project.",
          });
          setIsOpen(false);
          // Use router refresh instead of window.location.reload()
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          throw new Error(res?.data?.message || "Failed to create camp");
        }
      } else {
        const res = await projectApi.post("/projects", { ...data });
        if (res?.data?.status) {
          toast.success("Project created successfully.", {
            description: "The project has been created.",
          });
          setIsOpen(false);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          throw new Error(res?.data?.message || "Failed to create project");
        }
      }
    } catch (error: any) {
      console.error(`Error creating ${type}:`, error);
      toast.error(`Failed to create ${type.toLowerCase()}`, {
        description: error?.response?.data?.message || error?.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
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
