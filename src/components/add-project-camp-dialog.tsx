"use client";
import { useState } from "react";
import { AddForm, AddFormSchema } from "@/components/add-form";
import AwesomeDrawer from "@/components/drawer";
import { Button } from "@/components/ui/button";
import { z } from "zod";

type AddProjectOrCampDialogProps = {
  type: "Project" | "Camp";
};

export function AddProjectOrCampDialog({ type }: AddProjectOrCampDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (data: z.infer<typeof AddFormSchema>) => {
    // Handle form submission here...
    // remember the type has be passed in the props as either "project" or "camp"
    console.log(data);

    // Close the drawer
    setIsOpen(false);
  };

  return (
    <AwesomeDrawer
      openTrigger={<Button onClick={() => setIsOpen(true)}>Add {type}</Button>}
      title={`Add ${type}`}
      isForm={true}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <AddForm onSubmit={onSubmit} />
    </AwesomeDrawer>
  );
}
