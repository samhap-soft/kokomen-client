interface ReportEventPayloads {
  "report:submitted": { evaluation_id: string };
  "report:created": undefined;
  "report:updated": undefined;
  "report:error": { error: string };
}

type ReportEventType = keyof ReportEventPayloads;
export type { ReportEventType, ReportEventPayloads };
