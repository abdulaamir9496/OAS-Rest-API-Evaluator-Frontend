// types.ts
export interface Endpoint {
  path: string;
  method: string;
  operationId: string;
  summary: string;
  description: string;
  parameters: any[];
  requestBodySchema: any;
  responses: any;
  specTitle?: string;
  specVersion?: string;
  tags?: string[];
  deprecated?: boolean;
}

export interface TestResult {
  endpoint: Endpoint;
  status: number;
  statusText: string;
  headers: any;
  data: any;
  requestBody: any | null;
  timestamp: string;
  duration?: number;
  specTitle?: string;
  specVersion?: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiStats {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  byMethod: MethodStat[];
  topPaths: PathStat[];
}

export interface MethodStat {
  _id: string;
  count: number;
  successful: number;
}

export interface PathStat {
  _id: string;
  count: number;
  avgStatus: number;
}


// export interface Endpoint {
//   path: string;
//   method: string;
//   operationId: string;
//   summary: string;
//   parameters: any[];
//   requestBodySchema: any;
//   responses: Record<string, any>;
// }

// export interface TestResult {
//   endpoint: Endpoint;
//   status: number;
//   statusText: string;
//   headers: any;
//   data: any;
//   requestBody: any;
//   timestamp: string;
// }