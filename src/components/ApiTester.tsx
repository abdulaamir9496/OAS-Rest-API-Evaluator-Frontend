import React, { useState, useEffect } from 'react';
import { UploadCloud, ExternalLink, Play, Database } from 'lucide-react';
import SpecificationInput from './SpecificationInput';
import EndpointsList from './EndpointsList';
import TestResults from './TestResults';
import { parseOpenApiSpec } from '../services/openApiParser';
import { executeTests } from '../services/testExecutor';
import { Endpoint, TestResult } from '../types';
import axios from 'axios';

const API_URL = 'https://oas-rest-api-evaluator-backend.onrender.com/api';

const ApiTester: React.FC = () => {
    const [specUrl, setSpecUrl] = useState<string>('https://petstore.swagger.io/v2/swagger.json');
    const [uploadedSpec, setUploadedSpec] = useState<any>(null);
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [results, setResults] = useState<TestResult[]>([]);
    const [pastResults, setPastResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
    const [headers, setHeaders] = useState<Record<string, string>>({});
    const [showHistory, setShowHistory] = useState<boolean>(false);

    // Fetch past results when history tab is shown
    useEffect(() => {
        if (showHistory) {
            fetchPastResults();
        }
    }, [showHistory]);

    const fetchPastResults = async () => {
        setLoadingHistory(true);
        try {
            const response = await axios.get(`${API_URL}/test-results`);
            setPastResults(response.data);
        } catch (err) {
            console.error('Failed to fetch test history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSpecChange = async (spec: any) => {
        setUploadedSpec(spec);
        try {
            const extractedEndpoints = await parseOpenApiSpec(spec);
            setEndpoints(extractedEndpoints);
            setError(null);
        } catch (err) {
            setError(`Error parsing OpenAPI specification: ${err instanceof Error ? err.message : String(err)}`);
            setEndpoints([]);
        }
    };

    const handleUrlChange = (url: string) => {
        setSpecUrl(url);
    };

    const handleHeadersChange = (newHeaders: Record<string, string>) => {
        setHeaders(newHeaders);
    };

    const handleFetchSpec = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(specUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const specData = await response.json();
            handleSpecChange(specData);
        } catch (err) {
            setError(`Error fetching specification: ${err instanceof Error ? err.message : String(err)}`);
            setEndpoints([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRunTests = async () => {
        if (endpoints.length === 0) {
            setError('No endpoints to test. Please load a valid OpenAPI specification first.');
            return;
        }

        setIsRunningTests(true);
        setResults([]);

        try {
            const testResults = await executeTests(endpoints, headers);
            setResults(testResults);
            setError(null);

            // After successful tests, refresh the history
            if (showHistory) {
                fetchPastResults();
            }
        } catch (err) {
            setError(`Error executing tests: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsRunningTests(false);
        }
    };

    const successRate = React.useMemo(() => {
        if (results.length === 0) return 0;
        const successful = results.filter(r => r.status >= 200 && r.status < 300).length;
        return (successful / results.length) * 100;
    }, [results]);

    const handleToggleHistory = () => {
        setShowHistory(!showHistory);
    };

    return (
        <div className="space-y-8">
            <SpecificationInput
                specUrl={specUrl}
                onUrlChange={handleUrlChange}
                onFetchSpec={handleFetchSpec}
                onSpecChange={handleSpecChange}
                onHeadersChange={handleHeadersChange}
                loading={loading}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                    {error}
                </div>
            )}

            {endpoints.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Endpoints</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleToggleHistory}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Database className="h-4 w-4 mr-2" />
                                    {showHistory ? 'Hide History' : 'Show History'}
                                </button>
                                <button
                                    onClick={handleRunTests}
                                    disabled={isRunningTests}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRunningTests ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Testing...
                                        </div>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Run Tests
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {!showHistory ? (
                            <EndpointsList endpoints={endpoints} />
                        ) : (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Test History</h3>
                                {loadingHistory ? (
                                    <div className="flex justify-center py-8">
                                        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : pastResults.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No test history available
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead>
                                                <tr>
                                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Endpoint</th>
                                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Method</th>
                                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {pastResults.map((result, idx) => (
                                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                            {result.endpoint.path.split('/').slice(-2).join('/')}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 uppercase">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium
                                ${result.endpoint.method === 'get' ? 'bg-blue-100 text-blue-800' :
                                                                    result.endpoint.method === 'post' ? 'bg-green-100 text-green-800' :
                                                                        result.endpoint.method === 'put' ? 'bg-yellow-100 text-yellow-800' :
                                                                            result.endpoint.method === 'delete' ? 'bg-red-100 text-red-800' :
                                                                                'bg-gray-100 text-gray-800'}`}>
                                                                {result.endpoint.method}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium
                                ${result.status >= 200 && result.status < 300 ? 'bg-green-100 text-green-800' :
                                                                    result.status >= 400 ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                                {result.status} {result.statusText}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {new Date(result.timestamp).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {results.length > 0 && !showHistory && (
                <TestResults results={results} successRate={successRate} />
            )}
        </div>
    );
};

export default ApiTester;


// import React, { useState } from 'react';
// import { UploadCloud, ExternalLink, Play } from 'lucide-react';
// import SpecificationInput from './SpecificationInput';
// import EndpointsList from './EndpointsList';
// import TestResults from './TestResults';
// import { parseOpenApiSpec } from '../services/openApiParser';
// import { executeTests } from '../services/testExecutor';
// import { Endpoint, TestResult } from '../types';

// const ApiTester: React.FC = () => {
//   const [specUrl, setSpecUrl] = useState<string>('https://petstore.swagger.io/v2/swagger.json');
//   const [uploadedSpec, setUploadedSpec] = useState<any>(null);
//   const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
//   const [results, setResults] = useState<TestResult[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
//   const [headers, setHeaders] = useState<Record<string, string>>({});

//   const handleSpecChange = async (spec: any) => {
//     setUploadedSpec(spec);
//     try {
//       const extractedEndpoints = await parseOpenApiSpec(spec);
//       setEndpoints(extractedEndpoints);
//       setError(null);
//     } catch (err) {
//       setError(`Error parsing OpenAPI specification: ${err instanceof Error ? err.message : String(err)}`);
//       setEndpoints([]);
//     }
//   };

//   const handleUrlChange = (url: string) => {
//     setSpecUrl(url);
//   };

//   const handleHeadersChange = (newHeaders: Record<string, string>) => {
//     setHeaders(newHeaders);
//   };

//   const handleFetchSpec = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(specUrl);
//       if (!response.ok) {
//         throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
//       }
      
//       const specData = await response.json();
//       handleSpecChange(specData);
//     } catch (err) {
//       setError(`Error fetching specification: ${err instanceof Error ? err.message : String(err)}`);
//       setEndpoints([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRunTests = async () => {
//     if (endpoints.length === 0) {
//       setError('No endpoints to test. Please load a valid OpenAPI specification first.');
//       return;
//     }

//     setIsRunningTests(true);
//     setResults([]);
    
//     try {
//       const testResults = await executeTests(endpoints, headers);
//       setResults(testResults);
//       setError(null);
//     } catch (err) {
//       setError(`Error executing tests: ${err instanceof Error ? err.message : String(err)}`);
//     } finally {
//       setIsRunningTests(false);
//     }
//   };

//   const successRate = React.useMemo(() => {
//     if (results.length === 0) return 0;
//     const successful = results.filter(r => r.status >= 200 && r.status < 300).length;
//     return (successful / results.length) * 100;
//   }, [results]);

//   return (
//     <div className="space-y-8">
//       <SpecificationInput 
//         specUrl={specUrl}
//         onUrlChange={handleUrlChange}
//         onFetchSpec={handleFetchSpec}
//         onSpecChange={handleSpecChange}
//         onHeadersChange={handleHeadersChange}
//         loading={loading}
//       />

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
//           {error}
//         </div>
//       )}

//       {endpoints.length > 0 && (
//         <div className="bg-white shadow rounded-lg overflow-hidden">
//           <div className="px-4 py-5 sm:p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold text-gray-900">Endpoints</h2>
//               <button
//                 onClick={handleRunTests}
//                 disabled={isRunningTests}
//                 className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isRunningTests ? (
//                   <div className="flex items-center">
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Testing...
//                   </div>
//                 ) : (
//                   <>
//                     <Play className="h-4 w-4 mr-2" />
//                     Run Tests
//                   </>
//                 )}
//               </button>
//             </div>
            
//             <EndpointsList endpoints={endpoints} />
//           </div>
//         </div>
//       )}

//       {results.length > 0 && (
//         <TestResults results={results} successRate={successRate} />
//       )}
//     </div>
//   );
// };

// export default ApiTester;