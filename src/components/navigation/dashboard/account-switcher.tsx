import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useParams } from "next/navigation";

interface AccountSwitcherProps {
  queryName: string;
  isCollapsed: boolean;
  items: {
    name: string;
    icon?: React.ReactNode;
    _id: string;
  }[];
}

export function Switcher({
  isCollapsed,
  items,
  queryName,
}: AccountSwitcherProps) {
  const router = useRouter();
  const params = useParams();

  // Determine the initial selected account based on the queryName in the URL parameters
  const initialSelectedAccount = React.useMemo(() => {
    const paramValue = params[queryName];
    const foundItem = items.find((item) => item._id === paramValue);
    return foundItem ? foundItem._id : items[0]?._id ?? "";
  }, [params, queryName, items]);

  const [selectedAccount, setSelectedAccount] = React.useState<string>(
    initialSelectedAccount
  );

  const handleAccountChange = (_id: string) => {
    const selected = items.find((account) => account._id === _id);
    if (selected) {
      setSelectedAccount(_id);

      let newPath;
      console.log({ queryName });
      if (queryName === "projectId") {
        newPath = `/dashboard/${selected._id}/all/analytics`;
      } else if (queryName === "campId") {
        newPath = `/dashboard/${params.projectId}/${selected._id}/analytics`;
      } else {
        console.error("Invalid queryName");
        return;
      }

      router.push(newPath);
    }
  };

  return (
    <Select defaultValue={selectedAccount} onValueChange={handleAccountChange}>
      <SelectTrigger
        className={cn(
          "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
          isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
        )}
        aria-label="Select account"
      >
        {items.find((account) => account._id === selectedAccount)?.icon || null}
        <span>
          {queryName === "projectId" ? "Project" : "Camp"} :{" "}
          {items.find((account) => account._id === selectedAccount)?.name}
        </span>
      </SelectTrigger>
      <SelectContent>
        {items.map((account) => (
          <SelectItem
            key={account._id}
            value={account._id}
            className="flex items-center gap-2"
          >
            {account.icon || null}
            <SelectValue> {account.name}</SelectValue>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
