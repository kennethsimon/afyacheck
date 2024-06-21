"use client";
import { useState } from "react";
import { AddForm, AddFormSchema } from "@/components/add-form";
import AwesomeDrawer from "@/components/drawer";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { toast } from "sonner";

type AddProjectOrCampDialogProps = {
  type: "project" | "camp";
};

export function AddProjectOrCampDialog({ type }: AddProjectOrCampDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (data: z.infer<typeof AddFormSchema>) => {
    // Handle form submission here...
    // remember the type has be passed in the props as either "project" or "camp"
    console.log(data);
    toast("Item created successfully.", {
      description: "You can now open the item.",
      action: {
        label: "Open",
        onClick: () => {
          console.log("Opening item...");
        },
      },
    });

    // Close the drawer
    setIsOpen(false);
  };

  const onClose = () => {
    toast("Item creation cancelled.", {
      description: "You can close the drawer.",
    });
    setIsOpen(false);
  };

  return (
    <AwesomeDrawer
      openTrigger={<Button onClick={() => setIsOpen(true)}>Add {type}</Button>}
      title={`Add ${type}`}
      isForm={true}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      closeTrigger={<Button onClick={() => setIsOpen(false)}>Close</Button>}
    >
      <AddForm onSubmit={onSubmit} onClose={onClose} />
    </AwesomeDrawer>
  );
}
