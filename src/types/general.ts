export type PatientFilters = {
  campId?: string;
  active?: boolean;
  createdAtStart?: string;
  createdAtEnd?: string;
  sortBy?: string;
  order?: "asc" | "desc";
};
