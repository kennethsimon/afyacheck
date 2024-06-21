"use client";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/awesome/credenza";
import { Button } from "@/components/ui/button";

type DrawerProps = {
  openTrigger?: React.ReactNode;
  closeTrigger?: React.ReactNode;
  openTriggerLabel?: string;
  closeTriggerLabel?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  bodyText?: string;
  isForm?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
};

export default function AwesomeDrawer({
  openTriggerLabel = "Open modal",
  closeTriggerLabel = "Close",
  openTrigger = <Button>{openTriggerLabel}</Button>,
  closeTrigger = <Button>{closeTriggerLabel}</Button>,
  title = "Credenza",
  description = "A responsive modal component for shadcn/ui.",
  bodyText = "This component is built using shadcn/ui's dialog and drawer component, which is built on top of Vaul.",
  children = <div>{bodyText}</div>,
  isForm = false,
  isOpen = true,
  onClose = () => {},
}: DrawerProps) {
  return (
    <Credenza open={isOpen} onClose={onClose}>
      <CredenzaTrigger asChild>{openTrigger}</CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{title}</CredenzaTitle>
          <CredenzaDescription>{description}</CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>{children}</CredenzaBody>
        {!isForm && (
          <CredenzaFooter>
            <CredenzaClose asChild>{closeTrigger}</CredenzaClose>
          </CredenzaFooter>
        )}
      </CredenzaContent>
    </Credenza>
  );
}
