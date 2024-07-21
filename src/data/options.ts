import { Channels, DeliveryOptions } from "@/types/general";

// export type Channels = "b2b" | "b2c" | "uza" | "b2cb";

// export const channels is an array of objects, each representing a channel option.
export const channels: { label: string; value: Channels }[] = [
  { label: "B2B", value: "b2b" },
  { label: "B2C", value: "b2c" },
  { label: "UZA", value: "uza" },
  { label: "B2CB", value: "b2cb" },
];

export const deliveryOptions: {
  label: string;
  value: DeliveryOptions;
}[] = [
  {
    label: "Delivery",
    value: "delivery",
  },
  {
    label: "self pickup",
    value: "self pickup",
  },
];

export type ItemsDispatchedStatusOptions = "yes" | "no";

export const itemsDispatchedStatusOptions: {
  label: string;
  value: ItemsDispatchedStatusOptions;
}[] = [
  {
    label: "Yes",
    value: "yes",
  },
  {
    label: "No",
    value: "no",
  },
];

export type ServicesOptions = "inalipa" | "jumla" | "uza";

export const servicesOptions: {
  label: string;
  value: ServicesOptions;
}[] = [
  {
    label: "Inalipa",
    value: "inalipa",
  },
  {
    label: "JUMLA",
    value: "jumla",
  },
  {
    label: "uza",
    value: "uza",
  },
];
