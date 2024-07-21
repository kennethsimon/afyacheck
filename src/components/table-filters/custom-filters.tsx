import {
  channels,
  servicesOptions,
  deliveryOptions,
  itemsDispatchedStatusOptions,
} from "@/data/options";
import { DropdownFilter } from "@/components/table/new-dropdown-filter";
import React from "react";

export function CustomFilters() {
  const [selectedChannel, setSelectedChannel] = React.useState<string | null>(
    null
  );
  const [selectedDeliveryOption, setSelectedDeliveryOption] = React.useState<
    string | null
  >(null);
  const [
    selectedItemsDispatchedStatusOption,
    setSelectedItemsDispatchedStatusOption,
  ] = React.useState<string | null>(null);

  return (
    <div className="grid pb-2  gap-4 grid-cols-3 md:grid-cols-4 ">
      <DropdownFilter
        columnName="channel"
        className="mr-2"
        label="Channel"
        options={channels.map((channel) => ({
          label: channel.label,
          value: channel.value,
        }))}
        setSelected={setSelectedChannel}
      />

      <DropdownFilter
        columnName="serviceId"
        className="mr-2"
        label="Service Id"
        options={servicesOptions.map((service) => ({
          label: service.label,
          value: service.value,
        }))}
        setSelected={setSelectedChannel}
      />

      <DropdownFilter
        columnName="deliveryOption"
        label="Delivery Option"
        className="mr-2"
        options={deliveryOptions.map((deliveryOption) => ({
          label: deliveryOption.label,
          value: deliveryOption.value,
        }))}
        setSelected={setSelectedDeliveryOption}
      />

      <DropdownFilter
        columnName="itemDispatchedStatus"
        label="Items dispatched"
        options={itemsDispatchedStatusOptions.map(
          (itemsDispatchedStatusOption) => ({
            label: itemsDispatchedStatusOption.label,
            value: itemsDispatchedStatusOption.value,
          })
        )}
        setSelected={setSelectedItemsDispatchedStatusOption}
      />
    </div>
  );
}
