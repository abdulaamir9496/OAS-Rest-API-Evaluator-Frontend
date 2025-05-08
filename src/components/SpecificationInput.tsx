import React, { useState } from 'react';
import { UploadCloud, ExternalLink, Plus, X } from 'lucide-react';

interface HeaderInput {
  key: string;
  value: string;
}

interface SpecificationInputProps {
  specUrl: string;
  onUrlChange: (url: string) => void;
  onFetchSpec: () => void;
  onSpecChange: (spec: any) => void;
  onHeadersChange: (headers: Record<string, string>) => void;
  loading: boolean;
}

const SpecificationInput: React.FC<SpecificationInputProps> = ({
  specUrl,
  onUrlChange,
  onFetchSpec,
  onSpecChange,
  onHeadersChange,
  loading
}) => {
  const [showHeadersPanel, setShowHeadersPanel] = useState<boolean>(false);
  const [headerInputs, setHeaderInputs] = useState<HeaderInput[]>([{ key: '', value: '' }]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedSpec = JSON.parse(content);
        onSpecChange(parsedSpec);
      } catch (error) {
        console.error('Error parsing uploaded file:', error);
        alert('Invalid JSON file. Please upload a valid OpenAPI specification.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddHeader = () => {
    setHeaderInputs([...headerInputs, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = [...headerInputs];
    newHeaders.splice(index, 1);
    setHeaderInputs(newHeaders);
    
    // Update parent component with new headers
    const headersObject = newHeaders.reduce((obj, header) => {
      if (header.key.trim() !== '') {
        obj[header.key] = header.value;
      }
      return obj;
    }, {} as Record<string, string>);
    
    onHeadersChange(headersObject);
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headerInputs];
    newHeaders[index][field] = value;
    setHeaderInputs(newHeaders);
    
    // Update parent component with new headers
    const headersObject = newHeaders.reduce((obj, header) => {
      if (header.key.trim() !== '') {
        obj[header.key] = header.value;
      }
      return obj;
    }, {} as Record<string, string>);
    
    onHeadersChange(headersObject);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden transition-all duration-300">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">OpenAPI Specification</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="spec-url" className="block text-sm font-medium text-gray-700 mb-1">
              Specification URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="spec-url"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://petstore.swagger.io/v2/swagger.json"
                value={specUrl}
                onChange={(e) => onUrlChange(e.target.value)}
              />
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onFetchSpec}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Fetch
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Specification
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".json" onChange={handleFileUpload} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  JSON up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowHeadersPanel(!showHeadersPanel)}
          >
            {showHeadersPanel ? 'Hide' : 'Show'} Authentication Headers
          </button>
          
          {showHeadersPanel && (
            <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Authentication Headers</h3>
              
              <div className="space-y-3">
                {headerInputs.map((header, index) => (
                  <div key={index} className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Header Key (e.g. Authorization)"
                        value={header.key}
                        onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Header Value"
                        value={header.value}
                        onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => handleRemoveHeader(index)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleAddHeader}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Header
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecificationInput;