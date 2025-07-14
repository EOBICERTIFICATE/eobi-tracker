import React from 'react';
import { FiFileText, FiClock, FiUser, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import moment from 'moment';

const CertificateTable = ({ 
  certificates, 
  showActions = false, 
  showBeatOfficerActions = false,
  onAssignClick,
  onVerifyClick,
  onRejectClick
}) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Verified': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Escalated': 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getDaysPending = (createdAt) => {
    const days = moment().diff(moment(createdAt), 'days');
    if (days > 30) {
      return (
        <div className="flex items-center text-red-600">
          <FiAlertTriangle className="mr-1" />
          {days}
        </div>
      );
    } else if (days > 15) {
      return (
        <div className="flex items-center text-yellow-600">
          <FiClock className="mr-1" />
          {days}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tracking ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Claimant
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Beat Code
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Days Pending
            </th>
            {showActions && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {certificates.map((certificate) => (
            <tr key={certificate.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FiFileText className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {certificate.trackingId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {certificate.firNumber}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{certificate.claimantName}</div>
                <div className="text-sm text-gray-500">{certificate.cnic}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {certificate.beatCode}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(certificate.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getDaysPending(certificate.createdAt)}
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {certificate.assignedTo ? (
                    <div className="flex items-center">
                      <FiUser className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {certificate.assignedTo.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {certificate.assignedTo.personalNumber}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Unassigned</span>
                  )}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {showActions && onAssignClick && (
                  <button
                    onClick={() => onAssignClick(certificate)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Assign
                  </button>
                )}
                {showBeatOfficerActions && (
                  <>
                    <button
                      onClick={() => onVerifyClick(certificate)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      <FiCheck className="inline mr-1" /> Verify
                    </button>
                    <button
                      onClick={() => onRejectClick(certificate)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiX className="inline mr-1" /> Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CertificateTable;