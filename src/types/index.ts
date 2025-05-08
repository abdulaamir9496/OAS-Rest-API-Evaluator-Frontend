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


/**
## ✅ Why Use This File? (`types.ts`)
This file contains **strong type definitions** for entities in your API Testing App (e.g., SwaggerDrill), like endpoints, test results, and stats.
### Benefits:
### 1. **Type Safety**
You catch errors at compile time. For example:
```ts
const result: TestResult = {
  endpoint: {}, // ❌ will show error if required props are missing
  status: 200,
  // ...
};
---
### 2. **Better IntelliSense**
When you hover or autocomplete in VSCode or any modern IDE, it shows hints, docs, and structure.
---
### 3. **Code Reuse and Scalability**
Centralizes all type definitions so your frontend and backend components or services can reuse them.
---
### 4. **Documentation for Developers**
Reading the types tells another developer (or future you) what each object looks like — like a live schema or contract.

### 🔍 Breakdown of Key Interfaces

#### ✅ `Endpoint`

Represents a single API endpoint from your OpenAPI spec.

```ts
interface Endpoint {
  path: string;       // e.g. "/users"
  method: string;     // e.g. "GET", "POST"
  operationId: string;// e.g. "getUsers"
  summary: string;
  parameters: any[];  // query/path params
  requestBodySchema: any;
  responses: any;     // Swagger/OpenAPI response structure
}
```

#### ✅ `TestResult`

Stores the result of hitting an endpoint (status, headers, body, etc.).
Useful for:

* Displaying response data in your dashboard
* Logging test outcomes

#### ✅ `PaginatedResponse<T>`

Generic type for pagination, reusable with any entity.

#### ✅ `ApiStats`, `MethodStat`, `PathStat`

Used for analytics — these help you build graphs or dashboards that show API success/failure breakdowns by method/path.
 */

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