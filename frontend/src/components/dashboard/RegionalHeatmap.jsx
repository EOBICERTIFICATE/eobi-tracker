import React from 'react';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const RegionalHeatmap = ({ regions }) => {
  // Calculate max pending count for color scaling
  const maxPending = Math.max(...regions.map(r => r.pendingCount), 1);

  const getColorIntensity = (count) => {
    const intensity = Math.min(1, count / maxPending);
    const red = Math.floor(239 + (69 - 239) * intensity);
    const green = Math.floor(68 + (10 - 68) * intensity);
    const blue = Math.floor(68 + (10 - 68) * intensity);
    return `rgb(${red}, ${green}, ${blue})`;
  };

  return (
    <div className="overflow-auto">
      <div className="min-w-max">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region) => (
            <div 
              key={region.id} 
              className="border rounded-lg overflow-hidden shadow-sm"
              style={{ 
                borderLeft: `4px solid ${getColorIntensity(region.pendingCount)}`,
                backgroundColor: region.pendingCount > 0 
                  ? `${getColorIntensity(region.pendingCount)}20` 
                  : 'transparent'
              }}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {region.code} - {region.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      DDG B&C {region.ddgBAndC}
                    </p>
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {region.beatCount} Beats
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <FiAlertTriangle className="text-yellow-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {region.pendingCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiCheckCircle className="text-green-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Verified</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {region.verifiedCount}
                      </p>
                    </div>
                  </div>
                </div>

                {region.pendingCount > 0 && (
                  <div className="mt-3">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-gray-600">
                            {Math.round((region.verifiedCount / (region.pendingCount + region.verifiedCount)) * 100)}% Complete
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ 
                            width: `${Math.round((region.verifiedCount / (region.pendingCount + region.verifiedCount)) * 100)}%`,
                            backgroundColor: getColorIntensity(region.pendingCount)
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionalHeatmap;
