export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (params?: Record<string, unknown>) => ["projects", "list", params ?? {}] as const,
    custom: () => ["projects", "custom"] as const,
    detail: (projectId: string) => ["projects", "detail", projectId] as const,
  },
  camps: {
    all: ["camps"] as const,
    byProject: (projectId: string) => ["camps", "project", projectId || "all"] as const,
    detail: (campId: string) => ["camps", "detail", campId] as const,
  },
  patients: {
    all: ["patients"] as const,
    list: (params?: Record<string, unknown>) => ["patients", "list", params ?? {}] as const,
    detail: (patientId: string) => ["patients", "detail", patientId] as const,
  },
  diagnoses: {
    all: ["diagnoses"] as const,
    list: (params?: Record<string, unknown>) => ["diagnoses", "list", params ?? {}] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    stats: (params?: Record<string, unknown>) => ["analytics", "stats", params ?? {}] as const,
    camp: (params?: Record<string, unknown>) => ["analytics", "camp", params ?? {}] as const,
    customForm: (projectId: string, params?: Record<string, unknown>) =>
      ["analytics", "custom-form", projectId, params ?? {}] as const,
  },
  forms: {
    all: ["forms"] as const,
    fields: (projectId?: string) => ["forms", "fields", projectId ?? "all"] as const,
    schemas: (projectId?: string, includeInactive?: boolean) =>
      ["forms", "schemas", projectId ?? "all", Boolean(includeInactive)] as const,
    schema: (schemaId: string) => ["forms", "schema", schemaId] as const,
    submissions: (params?: Record<string, unknown>) =>
      ["forms", "submissions", params ?? {}] as const,
    submission: (submissionId: string) => ["forms", "submission", submissionId] as const,
  },
  wellness: {
    all: ["wellness"] as const,
    questions: () => ["wellness", "questions"] as const,
    responses: (params?: Record<string, unknown>) =>
      ["wellness", "responses", params ?? {}] as const,
    response: (id: string) => ["wellness", "response", id] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params?: Record<string, unknown>) => ["users", "list", params ?? {}] as const,
    detail: (userId: string) => ["users", "detail", userId] as const,
    roles: () => ["users", "roles"] as const,
  },
};
