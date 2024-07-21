import { DateRangePicker } from "@/components/table-filters/date-range-picker";

export function DateFilters() {
  return (
    <div className="grid pb-4 gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <DateRangePicker
        triggerSize="sm"
        triggerClassName="ml-auto w-56 sm:w-60"
      />
      <DateRangePicker
        triggerSize="sm"
        triggerClassName="ml-auto w-56 sm:w-60"
        fromField="dispatchedFrom"
        toField="dispatchedTo"
        placeholder="Dispatched Date"
      />
      <DateRangePicker
        triggerSize="sm"
        triggerClassName="ml-auto w-56 sm:w-60"
        fromField="completedFrom"
        toField="completedTo"
        placeholder="Completed Date"
      />

      <DateRangePicker
        triggerSize="sm"
        triggerClassName="ml-auto w-56 sm:w-60"
        fromField="refundedFrom"
        toField="refundedTo"
        placeholder="Refunded Date"
      />
    </div>
  );
}
