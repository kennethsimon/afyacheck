export type ReportTypeId =
  | "executive"
  | "project"
  | "camp"
  | "wellness"
  | "custom-project";

export type ReportSectionKey =
  | "cover"
  | "executiveSummary"
  | "programInfo"
  | "demographics"
  | "clinicalScreening"
  | "campComparisons"
  | "wellnessAnalysis"
  | "customFormAnalysis"
  | "dataTables"
  | "methodology";

export interface ReportSectionOption {
  key: ReportSectionKey;
  label: string;
  description: string;
  mandatory?: boolean;
  applicableTypes: ReportTypeId[];
}

export const REPORT_SECTION_OPTIONS: ReportSectionOption[] = [
  {
    key: "cover",
    label: "Cover Page",
    description: "Editorial cover with AfyaCheck branding and confidentiality classification",
    applicableTypes: ["executive", "project", "camp", "wellness", "custom-project"],
  },
  {
    key: "executiveSummary",
    label: "Executive Summary & KPIs",
    description: "Core KPI grid with documented definitions and factual findings",
    applicableTypes: ["executive", "project", "camp", "wellness", "custom-project"],
  },
  {
    key: "programInfo",
    label: "Program & Scope Information",
    description: "Two-column metadata table with location, dates, and applied filters",
    applicableTypes: ["executive", "project", "camp", "wellness", "custom-project"],
  },
  {
    key: "demographics",
    label: "Demographic Analysis",
    description: "Age brackets, gender, insurance coverage, geographic distribution, and trends",
    applicableTypes: ["executive", "project", "camp"],
  },
  {
    key: "clinicalScreening",
    label: "Clinical Screening Analysis",
    description: "Dynamic clinical domains, vitals completeness, findings, and recorded referrals",
    applicableTypes: ["executive", "project", "camp"],
  },
  {
    key: "campComparisons",
    label: "Multi-Camp Comparison",
    description: "Side-by-side camp registration, encounter completion, and referral metrics",
    applicableTypes: ["executive", "project"],
  },
  {
    key: "wellnessAnalysis",
    label: "Wellness Indicator Analysis",
    description: "Score bands, respondent profile, trends, and non-diagnostic governance notice",
    applicableTypes: ["wellness"],
  },
  {
    key: "customFormAnalysis",
    label: "Custom Form Indicator Analysis",
    description: "Version-isolated field distributions, numeric summaries, and missing-data rates",
    applicableTypes: ["custom-project"],
  },
  {
    key: "dataTables",
    label: "Detailed Reference Tables",
    description: "Full indicator count, denominator, and rate breakdown tables",
    applicableTypes: ["executive", "project", "camp", "wellness", "custom-project"],
  },
  {
    key: "methodology",
    label: "Methodology & Confidentiality",
    description: "Mandatory metric definitions, missing-data policy, and confidentiality notice",
    mandatory: true,
    applicableTypes: ["executive", "project", "camp", "wellness", "custom-project"],
  },
];

export const DEFAULT_SECTIONS_BY_TYPE: Record<ReportTypeId, ReportSectionKey[]> = {
  executive: [
    "executiveSummary",
    "programInfo",
    "demographics",
    "clinicalScreening",
    "campComparisons",
    "methodology",
  ],
  project: [
    "cover",
    "executiveSummary",
    "programInfo",
    "demographics",
    "clinicalScreening",
    "campComparisons",
    "dataTables",
    "methodology",
  ],
  camp: [
    "cover",
    "executiveSummary",
    "programInfo",
    "demographics",
    "clinicalScreening",
    "dataTables",
    "methodology",
  ],
  wellness: [
    "cover",
    "executiveSummary",
    "programInfo",
    "wellnessAnalysis",
    "dataTables",
    "methodology",
  ],
  "custom-project": [
    "cover",
    "executiveSummary",
    "programInfo",
    "customFormAnalysis",
    "dataTables",
    "methodology",
  ],
};

export interface DemographicBucket {
  label: string;
  count: number;
  percentage: number | null;
}

export interface ReportKpi {
  id: string;
  metricId?: string;
  label: string;
  value: number | null;
  formattedValue: string;
  sublabel?: string;
  denominator?: string;
  unit?: string;
  definition: string;
}

export interface ClinicalDomainRow {
  domain: string;
  indicator: string;
  performedCount: number;
  notPerformedCount: number;
  normalOrNegativeCount: number;
  abnormalOrReactiveCount: number;
  referralCount: number;
  denominator: number;
  findingRate: number | null;
  findingRateDisplay?: string;
  findingLabel: string;
}

export interface VitalsCompletenessRow {
  metric: string;
  unit: string;
  recordedCount: number;
  missingCount: number;
  completenessRate: number | null;
  meanValue?: number | null;
}

export interface CampComparisonRow {
  campId: string;
  campName: string;
  projectName: string;
  location: string;
  registered: number;
  encounters: number;
  completed: number;
  pending: number;
  completionRate: number | null;
  insuredRate: number | null;
  referrals: number;
}

export interface CustomFormFieldAnalytics {
  fieldName: string;
  label: string;
  type: string;
  required?: boolean;
  section?: string;
  totalResponses: number;
  missingCount: number;
  completionRate: number | null;
  isMultipleResponse?: boolean;
  denominatorLabel?: string;
  distribution?: Record<string, number>;
  numericSummary?: {
    min: number;
    max: number;
    avg: number;
    median?: number;
    count: number;
  };
  dateTrend?: Array<{ date: string; count: number }>;
  redactedFreeText?: boolean;
}

export interface StructuredReportPayload {
  meta: {
    reportRef: string;
    reportType: ReportTypeId;
    title: string;
    subtitle: string;
    generatedAt: string;
    generatedBy: string;
    confidentiality: string;
    deidentified: boolean;
    smallSampleWarning: boolean;
    smallSampleThreshold: number;
    periodLabel: string;
    appliedFilters: Record<string, string | null | undefined>;
    dataSource: string;
  };
  programInfo: {
    projectName: string;
    projectDescription?: string | null;
    programType: string;
    campName: string;
    campDescription?: string | null;
    campLocation?: string | null;
    campCount: number;
    activeCampCount: number;
    regions: string[];
    districts: string[];
    reportingPeriod: string;
    schemaName?: string;
    schemaVersion?: number;
    dateRange: {
      firstRecordAt?: string | null;
      lastRecordAt?: string | null;
    };
  };
  kpis: ReportKpi[];
  executiveNarrative: string[];
  demographics?: {
    totalRegistered: number;
    gender: DemographicBucket[];
    ageGroups: DemographicBucket[];
    insurance: DemographicBucket[];
    regions: DemographicBucket[];
    attendanceTrend: Array<{
      date: string;
      registrations: number;
      encounters: number;
    }>;
  };
  clinicalScreening?: {
    totalRegistered: number;
    encountersTotal: number;
    encountersCompleted: number;
    encountersPending: number;
    screeningCoverageRate: number | null;
    completionRate: number | null;
    totalRecordedReferrals: number;
    dataCompletenessRate: number | null;
    vitalsCompleteness: VitalsCompletenessRow[];
    domains: ClinicalDomainRow[];
    allDomainsEvaluated: number;
    preventiveInterventions: Array<{
      label: string;
      count: number;
      denominator: number;
      rate: number | null;
    }>;
  };
  campComparisons?: CampComparisonRow[];
  wellness?: {
    totalAssessments: number;
    questionCount: number;
    avgScore: number | null;
    medianScore: number | null;
    minScore: number | null;
    maxScore: number | null;
    elevatedReviewCount: number;
    completionRate: number | null;
    scoreBands: Array<{
      band: string;
      range: string;
      count: number;
      percentage: number | null;
      interpretationNote: string;
    }>;
    demographics: {
      gender: DemographicBucket[];
      ageGroups: DemographicBucket[];
      education: DemographicBucket[];
    };
    trend: Array<{ date: string; count: number; avgScore: number }>;
    interpretationGuidance: string;
  };
  customProject?: {
    schemaId: string | null;
    schemaName: string;
    schemaVersion: number;
    versionNote: string;
    versionBreakdown?: Record<string, number>;
    excludedOtherVersionCount?: number;
    availableSchemas: Array<{
      _id: string;
      name: string;
      version: number;
      isActive: boolean;
    }>;
    totalSubmissions: number;
    statusBreakdown: {
      draft: number;
      submitted: number;
      approved: number;
      rejected: number;
    };
    overallCompletenessRate: number | null;
    submissionTrend: Array<{ date: string; count: number }>;
    campBreakdown: Array<{ campName: string; total: number; approved: number }>;
    fields: CustomFormFieldAnalytics[];
  };
  methodology: {
    dataSource: string;
    reportingPeriod: string;
    appliedFiltersSummary: string;
    metricDefinitions: Array<{ term: string; definition: string }>;
    missingDataHandling: string;
    limitations: string[];
    confidentialityNotice: string;
  };
}

export interface PatientClinicalReportPayload {
  meta: {
    reportRef: string;
    reportType: "patient-clinical";
    title: string;
    subtitle: string;
    generatedAt: string;
    generatedBy: string;
    confidentiality: string;
    deidentified: false;
    dataSource: string;
  };
  patient: {
    id: string;
    patientIdentifier: string;
    name: string;
    gender: string;
    dateOfBirth: string | null;
    phoneNumber: string;
    region: string;
    district: string;
    address: string;
    insurance: string;
    registeredAt: string | null;
    registeredBy: string;
  };
  context: {
    projectName: string;
    campName: string;
    campLocation: string;
  };
  encounters: Array<{
    id: string;
    status: string;
    version: number;
    recordedAt: string | null;
    finalizedAt: string | null;
    recordedBy: string;
    finalizedBy: string | null;
    screening: Record<string, unknown>;
    clinicalFindings: Record<string, unknown>;
    doctorComments: Record<string, unknown>;
  }>;
  legacyClinicalData: {
    screening: Record<string, unknown>;
    clinicalFindings: Record<string, unknown>;
    doctorComments: Record<string, unknown>;
  } | null;
  clinicalGovernanceNotice: string;
}
