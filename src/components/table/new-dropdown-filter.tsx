"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface DropdownFilterProps {
  columnName: string;
  label: string;
  className?: string;
  options: { label: string; value: string }[];
  setSelected: (value: string | null) => void;
}

export const DropdownFilter: React.FC<DropdownFilterProps> = ({
  columnName,
  label,
  options,
  setSelected,
  className = "",
}) => {
  const [selectedOption, setSelectedOption] = React.useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  //   console.log({ searchParams });

  // Get initial selected option from URL
  React.useEffect(() => {
    const initialSelectedOption = searchParams.get(columnName);
    if (initialSelectedOption) {
      setSelectedOption(initialSelectedOption);
    }
  }, []);

  // Create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const updateUrlParams = (value: string | null) => {
    // console.log("updateUrlParams :", value);
    const newQueryString = createQueryString({ [columnName]: value });
    // console.log("newQueryString", newQueryString);

    router.push(`${pathname}?${newQueryString}`, {
      scroll: false,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn(className)}>
          {label} : {selectedOption ? `${selectedOption}` : " All"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={selectedOption}
          onValueChange={(value) => {
            setSelectedOption(value);
            setSelected(value);
            updateUrlParams(value);
          }}
        >
          <DropdownMenuRadioItem value={""}>All</DropdownMenuRadioItem>
          {options.map((option) => {
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
