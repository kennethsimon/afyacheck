export type PatientFilters = {
  campId?: string;
  active?: boolean;
  createdAtStart?: string;
  createdAtEnd?: string;
  sortBy?: string;
  order?: "asc" | "desc";
};

export interface ChartProps {
  data: any;
  className?: string;
}
