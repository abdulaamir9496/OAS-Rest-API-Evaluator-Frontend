import React from 'react';
import { Endpoint } from '../types/index';

interface EndpointsListProps {
  endpoints: Endpoint[];
}

const EndpointsList: React.FC<EndpointsListProps> = ({ endpoints }) => {
  // Group endpoints by path
  const groupedEndpoints = endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.path]) {
      acc[endpoint.path] = [];
    }
    acc[endpoint.path].push(endpoint);
    return acc;
  }, {} as Record<string, Endpoint[]>);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Path
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operation ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Summary
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {endpoints.map((endpoint, index) => (
              <tr key={`${endpoint.path}-${endpoint.method}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {endpoint.path}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    endpoint.method === 'get' 
                      ? 'bg-blue-100 text-blue-800' 
                      : endpoint.method === 'post'
                      ? 'bg-green-100 text-green-800'
                      : endpoint.method === 'put'
                      ? 'bg-yellow-100 text-yellow-800'
                      : endpoint.method === 'delete'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.method.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {endpoint.operationId || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {endpoint.summary || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Total endpoints: <span className="font-medium">{endpoints.length}</span> (
        {endpoints.filter(e => e.method === 'get').length} GET, 
        {endpoints.filter(e => e.method === 'post').length} POST)
      </div>
    </div>
  );
};

export default EndpointsList;