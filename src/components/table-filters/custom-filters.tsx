import { genders } from "@/data/options";
import { DropdownFilter } from "@/components/table/new-dropdown-filter";
import React from "react";

export function CustomFilters() {
  const [selectedGender, setSelectedGender] = React.useState<string | null>(
    null
  );

  return (
    <div className="grid pb-2  gap-4 grid-cols-3 md:grid-cols-4 ">
      <DropdownFilter
        columnName="gender"
        className="mr-2"
        label="Gender"
        options={genders.map((gender) => ({
          label: gender.label,
          value: gender.value,
        }))}
        setSelected={setSelectedGender}
      />
    </div>
  );
}
