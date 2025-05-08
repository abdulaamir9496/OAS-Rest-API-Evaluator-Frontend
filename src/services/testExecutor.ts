import axios, { AxiosResponse } from "axios";
import { Endpoint, TestResult } from "../types";
import { generateDummyData } from "./dummyDataGenerator";

// const API_URL = "https://oas-rest-api-evaluator-backend.onrender.com/api";
const API_URL = "https://oas-rest-api-evaluator-backend.onrender.com/api";


export async function executeTests(
    endpoints: Endpoint[],
    headers: Record<string, string> = {}
): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const endpoint of endpoints) {
        const startTime = performance.now();

        try {
            let response: AxiosResponse;
            let requestBody = null;

            try {
                // Extract the base URL from the endpoint path
                const urlParts = new URL(endpoint.path);
                const baseUrl = `${urlParts.protocol}//${urlParts.hostname}${urlParts.port ? ":" + urlParts.port : ""
                    }`;
                const path = urlParts.pathname;

                const axiosConfig = {
                    headers: { ...headers },
                    validateStatus: () => true, // Don't throw on any status
                    timeout: 10000, // 10 second timeout
                };

                // Fill in path parameters with dummy values
                let resolvedPath = path;
                const pathParams = path.match(/{([^}]+)}/g) || [];

                pathParams.forEach((param) => {
                    const paramName = param.replace(/{|}/g, "");
                    const dummyValue = generatePathParamValue(paramName);
                    resolvedPath = resolvedPath.replace(param, dummyValue);
                });

                const fullUrl = `${baseUrl}${resolvedPath}`;

                console.log(`Testing ${endpoint.method.toUpperCase()} ${fullUrl}`);

                // Generate request body if needed
                if (["post", "put", "patch"].includes(endpoint.method)) {
                    requestBody = generateDummyData(endpoint.requestBodySchema);
                }

                // Execute the API call based on method
                switch (endpoint.method.toLowerCase()) {
                    case "get":
                        response = await axios.get(fullUrl, axiosConfig);
                        break;
                    case "post":
                        response = await axios.post(fullUrl, requestBody, axiosConfig);
                        break;
                    case "put":
                        response = await axios.put(fullUrl, requestBody, axiosConfig);
                        break;
                    case "delete":
                        response = await axios.delete(fullUrl, axiosConfig);
                        break;
                    case "patch":
                        response = await axios.patch(fullUrl, requestBody, axiosConfig);
                        break;
                    default:
                        console.warn(`Unsupported method: ${endpoint.method}`);
                        continue;
                }
            } catch (requestError) {
                // Handle request errors (e.g., network errors)
                console.error(
                    `Request error for ${endpoint.method.toUpperCase()} ${endpoint.path
                    }:`,
                    requestError
                );

                response = {
                    status: 0,
                    statusText: "Request Failed",
                    headers: {},
                    data: {
                        error:
                            requestError instanceof Error
                                ? requestError.message
                                : String(requestError),
                    },
                    config: {},
                } as AxiosResponse;
            }

            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            // Prepare test result object
            const testResult: TestResult = {
                endpoint,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data,
                requestBody,
                timestamp: new Date().toISOString(),
                duration: duration,
                specTitle: endpoint.specTitle || "Unknown", // If available from the parsed spec
                specVersion: endpoint.specVersion || "Unknown", // If available from the parsed spec
            };

            // Save test result to backend
            try {
                await axios.post(`${API_URL}/test-results`, testResult, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    timeout: 5000, // 5 second timeout for saving results
                });
                console.log(
                    `Saved test result for ${endpoint.method.toUpperCase()} ${endpoint.path
                    }`
                );
            } catch (saveError) {
                console.warn(
                    "Could not save test result to backend:",
                    saveError.message
                );
                // Continue without failing the test
            }

            results.push(testResult);
        } catch (error) {
            console.error(
                `Error testing endpoint ${endpoint.method.toUpperCase()} ${endpoint.path
                }:`,
                error
            );

            const errorResult = {
                endpoint,
                status: 0,
                statusText: "Request Failed",
                headers: {},
                data: {
                    error: error instanceof Error ? error.message : String(error),
                },
                requestBody: null,
                timestamp: new Date().toISOString(),
                duration: 0,
            };

            try {
                // Save error result to backend
                await axios.post(`${API_URL}/test-results`, errorResult);
            } catch (saveError) {
                console.warn(
                    "Could not save error result to backend:",
                    saveError.message
                );
            }

            results.push(errorResult);
        }
    }

    return results;
}

// Helper function to generate sensible dummy values for path parameters
function generatePathParamValue(paramName: string): string {
    const commonParams: Record<string, string> = {
        id: "1",
        userId: "123",
        petId: "456",
        orderId: "789",
        username: "testuser",
        status: "available",
        category: "dogs",
        tag: "tag1",
    };

    // Check if we have a predefined value for this parameter
    if (paramName in commonParams) {
        return commonParams[paramName];
    }

    // Handle common parameter naming patterns
    if (paramName.toLowerCase().includes("id")) {
        return "42";
    }

    if (paramName.toLowerCase().includes("name")) {
        return "test_name";
    }

    if (paramName.toLowerCase().includes("date")) {
        return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    }

    // Default fallback
    return "test_value";
}

// import axios, { AxiosResponse } from "axios";
// import { Endpoint, TestResult } from "../types";
// import { generateDummyData } from "./dummyDataGenerator";

// const API_URL = "https://oas-rest-api-evaluator-backend.onrender.com/api";

// export async function executeTests(
//     endpoints: Endpoint[],
//     headers: Record<string, string> = {}
// ): Promise<TestResult[]> {
//     const results: TestResult[] = [];

//     for (const endpoint of endpoints) {
//         try {
//             let response: AxiosResponse;
//             let requestBody = null;

//             // Extract the base URL from the endpoint path
//             // This is the key fix - we need to use the full URL, not just the path
//             const urlParts = new URL(endpoint.path);
//             const baseUrl = `${urlParts.protocol}//${urlParts.hostname}${urlParts.port ? ":" + urlParts.port : ""
//                 }`;
//             const path = urlParts.pathname;

//             const axiosConfig = {
//                 headers: { ...headers },
//                 validateStatus: () => true,
//             };

//             // Fill in path parameters with dummy values
//             let resolvedPath = path;
//             const pathParams = path.match(/{([^}]+)}/g) || [];

//             pathParams.forEach((param) => {
//                 const paramName = param.replace(/{|}/g, "");
//                 const dummyValue = generatePathParamValue(paramName);
//                 resolvedPath = resolvedPath.replace(param, dummyValue);
//             });

//             const fullUrl = `${baseUrl}${resolvedPath}`;

//             console.log(`Testing ${endpoint.method.toUpperCase()} ${fullUrl}`);

//             if (endpoint.method === "get") {
//                 response = await axios.get(fullUrl, axiosConfig);
//             } else if (endpoint.method === "post") {
//                 requestBody = generateDummyData(endpoint.requestBodySchema);
//                 response = await axios.post(fullUrl, requestBody, axiosConfig);
//             } else if (endpoint.method === "put") {
//                 requestBody = generateDummyData(endpoint.requestBodySchema);
//                 response = await axios.put(fullUrl, requestBody, axiosConfig);
//             } else if (endpoint.method === "delete") {
//                 response = await axios.delete(fullUrl, axiosConfig);
//             } else if (endpoint.method === "patch") {
//                 requestBody = generateDummyData(endpoint.requestBodySchema);
//                 response = await axios.patch(fullUrl, requestBody, axiosConfig);
//             } else {
//                 console.warn(`Unsupported method: ${endpoint.method}`);
//                 continue;
//             }

//             const testResult = {
//                 endpoint,
//                 status: response.status,
//                 statusText: response.statusText,
//                 headers: response.headers,
//                 data: response.data,
//                 requestBody,
//                 timestamp: new Date().toISOString(),
//             };

//             try {
//                 // Save test result to backend (if server is running)
//                 await axios.post(`${API_URL}/test-results`, testResult);
//             } catch (saveError) {
//                 console.warn(
//                     "Could not save test results to backend:",
//                     saveError.message
//                 );
//                 // Continue without failing the test
//             }

//             results.push(testResult);
//         } catch (error) {
//             console.error(
//                 `Error testing endpoint ${endpoint.method.toUpperCase()} ${endpoint.path
//                 }:`,
//                 error
//             );

//             const errorResult = {
//                 endpoint,
//                 status: 0,
//                 statusText: "Request Failed",
//                 headers: {},
//                 data: {
//                     error: error instanceof Error ? error.message : String(error),
//                 },
//                 requestBody: null,
//                 timestamp: new Date().toISOString(),
//             };

//             try {
//                 // Save error result to backend (if server is running)
//                 await axios.post(`${API_URL}/test-results`, errorResult);
//             } catch (saveError) {
//                 console.warn(
//                     "Could not save error results to backend:",
//                     saveError.message
//                 );
//                 // Continue without failing the test
//             }

//             results.push(errorResult);
//         }
//     }

//     return results;
// }

// // Helper function to generate sensible dummy values for path parameters
// function generatePathParamValue(paramName: string): string {
//     const commonParams: Record<string, string> = {
//         id: "1",
//         userId: "123",
//         petId: "456",
//         orderId: "789",
//         username: "testuser",
//         status: "available",
//     };

//     // Check if we have a predefined value for this parameter
//     if (paramName in commonParams) {
//         return commonParams[paramName];
//     }

//     // Handle common parameter naming patterns
//     if (paramName.toLowerCase().includes("id")) {
//         return "42";
//     }

//     // Default fallback
//     return "test";
// }

// import axios, { AxiosResponse } from 'axios';
// import { Endpoint, TestResult } from '../types';
// import { generateDummyData } from './dummyDataGenerator';

// const API_URL = 'https://oas-rest-api-evaluator-backend.onrender.com/api';

// export async function executeTests(
//   endpoints: Endpoint[],
//   headers: Record<string, string> = {}
// ): Promise<TestResult[]> {
//   const results: TestResult[] = [];

//   for (const endpoint of endpoints) {
//     try {
//       let response: AxiosResponse;
//       let requestBody = null;

//       const axiosConfig = {
//         headers: { ...headers },
//         validateStatus: () => true,
//       };

//       if (endpoint.method === 'get') {
//         response = await axios.get(endpoint.path, axiosConfig);
//       } else if (endpoint.method === 'post') {
//         requestBody = generateDummyData(endpoint.requestBodySchema);
//         response = await axios.post(endpoint.path, requestBody, axiosConfig);
//       } else {
//         continue;
//       }

//       const testResult = {
//         endpoint,
//         status: response.status,
//         statusText: response.statusText,
//         headers: response.headers,
//         data: response.data,
//         requestBody,
//         timestamp: new Date().toISOString(),
//       };

//       // Save test result to backend
//       await axios.post(`${API_URL}/test-results`, testResult);

//       results.push(testResult);
//     } catch (error) {
//       console.error(`Error testing endpoint ${endpoint.method.toUpperCase()} ${endpoint.path}:`, error);

//       const errorResult = {
//         endpoint,
//         status: 0,
//         statusText: 'Request Failed',
//         headers: {},
//         data: {
//           error: error instanceof Error ? error.message : String(error)
//         },
//         requestBody: null,
//         timestamp: new Date().toISOString(),
//       };

//       // Save error result to backend
//       await axios.post(`${API_URL}/test-results`, errorResult);

//       results.push(errorResult);
//     }
//   }

//   return results;
// }
