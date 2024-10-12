export type PatientFilters = {
  campId?: string;
  active?: boolean;
  createdAtStart?: string;
  createdAtEnd?: string;
  sortBy?: string;
  order?: "asc" | "desc";
};

export type Genders = "male" | "female" | "others";

export interface ChartProps {
  data: any;
  className?: string;
}

export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface DataTableFilterField<TData> {
  label: string;
  value: keyof TData;
  placeholder?: string;
  options?: Option[];
}

export interface DataTableFilterOption<TData> {
  id: string;
  label: string;
  value: keyof TData;
  options: Option[];
  filterValues?: string[];
  filterOperator?: string;
  isMulti?: boolean;
}

export type Patient = {
  _id: string;
  patientIdentifier?: string;
  name?: string;
  gender: "female" | "male" | "others";
  dateOfBirth?: string; // ISO date string
  phoneNumber?: string;
  region?: string;
  district?: string;
  address?: string;
  insurance?: string;
  camp: string; // Assuming this is the ObjectId as a string
  createdBy: string; // Assuming this is the ObjectId as a string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type Order = {
  _id: string;
  discounts: any;
  shippingAddress: any;
  serviceId: string;
  platform: any;
  payment: any;
  delivery?: any;
  amount: {
    itemsTotal: number;
    deliveryTotal: number;
    total: number;
    currency: string;
  };
  charges: any;
  createdBy: any;
  partialRefunds: any;
  transactions?: string[];
  shops?: any[];
  refundTransactions?: any[];
  isDiscounted?: boolean;
  paymentFeedbackReceived?: boolean;
  disputed?: boolean;
  hasPendingRefund?: boolean;
  hasPendingDispute?: boolean;
  trackingUrl?: string;
  status: string;
  hasPartialRefund: boolean;
  partialRefundPending: boolean;
  refundAllowed?: boolean;
  channel: string;
  user?: any;
  source?: string;
  referenceNumber?: string;
  trackingNumber: string;
  items?: Item[];
  uuid?: string;
  lastUpdate?: string;
  __v?: number;
  paymentFeedbackReceivedAt?: string;
  metadata: any;
  dateCreated: string;
};

type Item = {
  wholesaleInfo: {
    vatExempted: boolean;
    price: number;
  };
  price: number;
  quantity: number;
  vatExempted: boolean;
  pendingRefund: boolean;
  refunded: boolean;
  pricingBand: any;
  packaging: Packaging;
  _id: string;
  name: string;
  sku: string;
  description: string;
};

type Packaging = {
  quantity: number;
  bands: any[];
  _id: string;
  name: string;
  image: string;
};
