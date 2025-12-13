interface ReportEventPayloads {
  "report:submitted": { report_id: string };
  "report:created": { report_id: string };
  "report:updated": undefined;
  "report:error": { error: string };
}

type ReportEventType = keyof ReportEventPayloads;
export type { ReportEventType, ReportEventPayloads };
