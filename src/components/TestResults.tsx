import React, { useState } from 'react';
import { Download, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { TestResult } from '../types';

interface TestResultsProps {
  results: TestResult[];
  successRate: number;
}

const TestResults: React.FC<TestResultsProps> = ({ results, successRate }) => {
  const [expandedResult, setExpandedResult] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedResult(expandedResult === index ? null : index);
  };

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-results-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group results by path
  const resultsByPath = results.reduce((acc, result) => {
    const key = result.endpoint.path;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  // Calculate success rate for each path
  const pathSuccessRates = Object.entries(resultsByPath).reduce((acc, [path, pathResults]) => {
    const successful = pathResults.filter(r => r.status >= 200 && r.status < 300).length;
    acc[path] = (successful / pathResults.length) * 100;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Success Rate:</span>
              <span className={`text-sm font-semibold ${
                successRate >= 80 ? 'text-green-600' : 
                successRate >= 50 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {successRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  successRate >= 80 ? 'bg-green-500' : 
                  successRate >= 50 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`} 
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
            
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Success Rate by Endpoint:</h4>
              {Object.entries(pathSuccessRates).map(([path, rate]) => (
                <div key={path}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600 truncate max-w-md" title={path}>
                      {path}
                    </span>
                    <span className={`text-xs font-semibold ${
                      rate >= 80 ? 'text-green-600' : 
                      rate >= 50 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        rate >= 80 ? 'bg-green-500' : 
                        rate >= 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-3">Detailed Results</h3>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
            >
              <div 
                className={`px-4 py-3 flex justify-between items-center cursor-pointer ${
                  result.status >= 200 && result.status < 300 
                    ? 'bg-green-50 hover:bg-green-100' 
                    : 'bg-red-50 hover:bg-red-100'
                }`}
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center">
                  {result.status >= 200 && result.status < 300 ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                        result.endpoint.method === 'get' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.endpoint.method.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900">{result.endpoint.path}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      Status: {result.status} {result.statusText}
                    </div>
                  </div>
                </div>
                <div>
                  {expandedResult === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedResult === index && (
                <div className="p-4 bg-white border-t border-gray-200">
                  {result.requestBody && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Request Body:</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.requestBody, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Response Headers:</h4>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.headers, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Response Body:</h4>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestResults;