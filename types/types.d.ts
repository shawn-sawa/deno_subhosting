interface RequestParams {
  url: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  headers: HeadersInit;
  // deno-lint-ignore no-explicit-any
  body?: { [key: string]: any } | null;
}

interface KVDatabaseData {
  id: string;
  organizationId: string;
  description: string;
  updatedAt: string;
  createdAt: string;
}
interface ListParams {
  page?: null | number; // The page number to return (optional).
  limit?: null | number; // The maximum number of items to return per page (optional).
  q?: null | string; // Query by domain (optional).
  sort?: null | "domain" | "created_at" | "updated_at"; // The field to sort by (optional).
  order?: null | "asc" | "desc"; // Sort order (optional).
}

interface AnalyticsParams {
  /** MUST be in RFC3339 format */
  since: string;
  /** MUST be in RFC3339 format */
  until: string;
}

interface AnalyticsData {
  fields: MetricField[];
  values: MetricValue[];
}

interface MetricField {
  name:
    | "time"
    | "requestCount"
    | "cpuSeconds"
    | "uptimeSeconds"
    | "maxRssMemoryBytes"
    | "networkIngressBytes"
    | "networkEgressBytes"
    | "kvReadCount"
    | "kvWriteCount"
    | "kvReadUnits"
    | "kvWriteUnits"
    | "kvStorageBytes";
  type: "time" | "number";
}

type MetricValue = (string | number)[];

type ErrorResponse =
  | {
    statusCode: string;
    message: string;
  }
  | Error
  | void;

type APIResponse<T> = {
  status: "success" | "error";
  data?: T;
  error?: ErrorResponse;
};
