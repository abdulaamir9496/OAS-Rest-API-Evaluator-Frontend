import { Endpoint } from "../types/index";

export async function parseOpenApiSpec(spec: any): Promise<Endpoint[]> {
  const endpoints: Endpoint[] = [];

  try {
    // Extract the API server URL from the spec
    let specUrl = "";
    if (spec.servers && spec.servers.length > 0) {
      specUrl = spec.servers[0].url;
    } else if (spec.host) {
      // Handle Swagger 2.0
      const scheme =
        spec.schemes && spec.schemes.length > 0 ? spec.schemes[0] : "https";
      specUrl = `${scheme}://${spec.host}${spec.basePath || ""}`;
    }

    // Remove trailing slash if present
    specUrl = specUrl.endsWith("/") ? specUrl.slice(0, -1) : specUrl;

    // Extract metadata from the spec
    const specTitle = spec.info?.title || "Unknown API";
    const specVersion = spec.info?.version || "Unknown Version";
    const specDescription = spec.info?.description || "";

    // Handle Swagger/OpenAPI 2.0
    if (spec.swagger && spec.swagger.startsWith("2")) {
      const basePath = spec.basePath || "";

      // Iterate through all paths
      Object.entries(spec.paths || {}).forEach(
        ([path, pathItem]: [string, any]) => {
          // Filter out parameters at the path level
          const pathParameters = pathItem.parameters || [];

          // Process each HTTP method in the path
          Object.entries(pathItem).forEach(
            ([method, operation]: [string, any]) => {
              // Skip non-HTTP method properties
              if (
                ![
                  "get",
                  "post",
                  "put",
                  "delete",
                  "patch",
                  "options",
                  "head",
                ].includes(method.toLowerCase())
              ) {
                return;
              }

              // Determine the full path
              const fullPath = specUrl
                ? `${specUrl}${path}`
                : `${basePath}${path}`;

              // Combine path-level and operation-level parameters
              const combinedParameters = [
                ...pathParameters,
                ...(operation.parameters || []),
              ];

              // Extract request body schema for request methods
              let requestBodySchema = null;
              if (
                method.toLowerCase() !== "get" &&
                method.toLowerCase() !== "head"
              ) {
                // Look for body parameter in Swagger 2.0
                const bodyParam = combinedParameters.find(
                  (param: any) => param.in === "body" && param.schema
                );

                if (bodyParam) {
                  requestBodySchema = bodyParam.schema;
                }
              }

              // Add endpoint to the list
              endpoints.push({
                path: fullPath,
                method: method.toLowerCase(),
                operationId:
                  operation.operationId ||
                  `${method}${path.replace(/[^a-zA-Z0-9]/g, "")}`,
                summary: operation.summary || `${method.toUpperCase()} ${path}`,
                description: operation.description || "",
                parameters: combinedParameters,
                requestBodySchema,
                responses: operation.responses || {},
                specTitle,
                specVersion,
                tags: operation.tags || [],
                deprecated: operation.deprecated || false,
              });
            }
          );
        }
      );
    }
    // Handle OpenAPI 3.0
    else if (spec.openapi && spec.openapi.startsWith("3")) {
      // Iterate through all paths
      Object.entries(spec.paths || {}).forEach(
        ([path, pathItem]: [string, any]) => {
          // Filter out parameters at the path level
          const pathParameters = pathItem.parameters || [];

          // Process each HTTP method in the path
          Object.entries(pathItem).forEach(
            ([method, operation]: [string, any]) => {
              // Skip non-HTTP method properties and extensions
              if (
                ![
                  "get",
                  "post",
                  "put",
                  "delete",
                  "patch",
                  "options",
                  "head",
                ].includes(method.toLowerCase())
              ) {
                return;
              }

              // Determine the full path
              const fullPath = specUrl ? `${specUrl}${path}` : path;

              // Combine path-level and operation-level parameters
              const combinedParameters = [
                ...pathParameters,
                ...(operation.parameters || []),
              ];

              // Extract request body schema
              let requestBodySchema = null;
              if (
                method.toLowerCase() !== "get" &&
                method.toLowerCase() !== "head" &&
                operation.requestBody
              ) {
                const contentType = operation.requestBody.content || {};
                // Prefer JSON if available
                if (contentType["application/json"]) {
                  requestBodySchema = contentType["application/json"].schema;
                }
                // Otherwise take the first content type
                else if (Object.keys(contentType).length > 0) {
                  const firstContentType = Object.keys(contentType)[0];
                  requestBodySchema = contentType[firstContentType].schema;
                }
              }

              // Add endpoint to the list
              endpoints.push({
                path: fullPath,
                method: method.toLowerCase(),
                operationId:
                  operation.operationId ||
                  `${method}${path.replace(/[^a-zA-Z0-9]/g, "")}`,
                summary: operation.summary || `${method.toUpperCase()} ${path}`,
                description: operation.description || "",
                parameters: combinedParameters,
                requestBodySchema,
                responses: operation.responses || {},
                specTitle,
                specVersion,
                tags: operation.tags || [],
                deprecated: operation.deprecated || false,
              });
            }
          );
        }
      );
    } else {
      throw new Error("Unsupported OpenAPI specification version");
    }

    return endpoints;
  } catch (error) {
    console.error("Error parsing OpenAPI spec:", error);
    throw new Error(
      `Failed to parse OpenAPI specification: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
export function getRequestBodySchema(endpoint: Endpoint): any | null {
  return endpoint.requestBodySchema;
}
export function getResponseSchema(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.content) {
    const contentType = Object.keys(response.content)[0];
    return response.content[contentType].schema;
  }
  return null;
}
export function getEndpointUrl(endpoint: Endpoint): string {
  return endpoint.path;
}
export function getEndpointMethod(endpoint: Endpoint): string {
  return endpoint.method;
}
export function getEndpointSummary(endpoint: Endpoint): string {
  return endpoint.summary;
}
export function getEndpointDescription(endpoint: Endpoint): string {
  return endpoint.description;
}
export function getEndpointTags(endpoint: Endpoint): string[] {
  return endpoint.tags;
}
export function getEndpointDeprecated(endpoint: Endpoint): boolean {
  return endpoint.deprecated;
}
export function getEndpointParameters(endpoint: Endpoint): any[] {
  return endpoint.parameters;
}
export function getEndpointOperationId(endpoint: Endpoint): string {
  return endpoint.operationId;
}
export function getEndpointSpecTitle(endpoint: Endpoint): string {
  return endpoint.specTitle;
}
export function getEndpointSpecVersion(endpoint: Endpoint): string {
  return endpoint.specVersion;
}
export function getEndpointRequestBodySchema(endpoint: Endpoint): any | null {
  return endpoint.requestBodySchema;
}
export function getEndpointResponses(endpoint: Endpoint): any {
  return endpoint.responses;
}
export function getEndpointResponseSchema(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.content) {
    const contentType = Object.keys(response.content)[0];
    return response.content[contentType].schema;
  }
  return null;
}
export function getEndpointResponseDescription(
  endpoint: Endpoint,
  statusCode: string
): string | null {
  const response = endpoint.responses[statusCode];
  if (response) {
    return response.description || null;
  }
  return null;
}
export function getEndpointResponseHeaders(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.headers) {
    return response.headers;
  }
  return null;
}
export function getEndpointResponseCookies(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.cookies) {
    return response.cookies;
  }
  return null;
}
export function getEndpointResponseExamples(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.examples) {
    return response.examples;
  }
  return null;
}
export function getEndpointResponseLinks(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.links) {
    return response.links;
  }
  return null;
}
export function getEndpointResponseStatusCode(
  endpoint: Endpoint,
  statusCode: string
): string | null {
  const response = endpoint.responses[statusCode];
  if (response) {
    return response.statusCode || null;
  }
  return null;
}
export function getEndpointResponseContentType(
  endpoint: Endpoint,
  statusCode: string
): string | null {
  const response = endpoint.responses[statusCode];
  if (response && response.content) {
    const contentType = Object.keys(response.content)[0];
    return contentType || null;
  }
  return null;
}
export function getEndpointResponseSchemaType(
  endpoint: Endpoint,
  statusCode: string
): string | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema) {
    return response.schema.type || null;
  }
  return null;
}
export function getEndpointResponseSchemaFormat(
  endpoint: Endpoint,
  statusCode: string
): string | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema) {
    return response.schema.format || null;
  }
  return null;
}
export function getEndpointResponseSchemaProperties(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.properties) {
    return response.schema.properties;
  }
  return null;
}
export function getEndpointResponseSchemaItems(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.items) {
    return response.schema.items;
  }
  return null;
}
export function getEndpointResponseSchemaRequired(
  endpoint: Endpoint,
  statusCode: string
): string[] | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.required) {
    return response.schema.required;
  }
  return null;
}
export function getEndpointResponseSchemaEnum(
  endpoint: Endpoint,
  statusCode: string
): any[] | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.enum) {
    return response.schema.enum;
  }
  return null;
}
export function getEndpointResponseSchemaExample(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.example) {
    return response.schema.example;
  }
  return null;
}
export function getEndpointResponseSchemaDefault(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.default) {
    return response.schema.default;
  }
  return null;
}
export function getEndpointResponseSchemaNullable(
  endpoint: Endpoint,
  statusCode: string
): boolean | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.nullable) {
    return response.schema.nullable;
  }
  return null;
}
export function getEndpointResponseSchemaDiscriminator(
  endpoint: Endpoint,
  statusCode: string
): any | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.discriminator) {
    return response.schema.discriminator;
  }
  return null;
}
export function getEndpointResponseSchemaReadOnly(
  endpoint: Endpoint,
  statusCode: string
): boolean | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.readOnly) {
    return response.schema.readOnly;
  }
  return null;
}
export function getEndpointResponseSchemaWriteOnly(
  endpoint: Endpoint,
  statusCode: string
): boolean | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.writeOnly) {
    return response.schema.writeOnly;
  }
  return null;
}
export function getEndpointResponseSchemaDescription(
  endpoint: Endpoint,
  statusCode: string
): string | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.description) {
    return response.schema.description;
  }
  return null;
}
export function getEndpointResponseSchemaTitle(
  endpoint: Endpoint,
  statusCode: string
): string | null {
  const response = endpoint.responses[statusCode];
  if (response && response.schema && response.schema.title) {
    return response.schema.title;
  }
  return null;
}
