import React from 'react';
import { FiFileText, FiClock, FiUser, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import moment from 'moment';

const CertificateCard = ({ certificate, showActions = false, onAssign, onVerify, onReject }) => {
  const daysPending = moment().diff(moment(certificate.createdAt), 'days');
  const isOverdue = daysPending > 30;

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Verified': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Escalated': 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {certificate.trackingId}
          </h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[certificate.status]}`}>
            {certificate.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {certificate.claimantName} • {certificate.cnic}
        </p>
      </div>

      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">FIR Number</p>
            <p className="mt-1 text-sm text-gray-900">{certificate.firNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Employer</p>
            <p className="mt-1 text-sm text-gray-900">
              {certificate.employerName || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Beat Code</p>
            <p className="mt-1 text-sm text-gray-900">{certificate.beatCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Region</p>
            <p className="mt-1 text-sm text-gray-900">
              {certificate.region?.code} - {certificate.region?.name}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            {daysPending} days pending
          </div>
          {isOverdue && (
            <div className="flex items-center text-sm text-red-500">
              <FiAlertTriangle className="flex-shrink-0 mr-1.5 h-5 w-5" />
              Overdue
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between">
          <Link
            to={`/certificates/${certificate.id}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiFileText className="mr-2 h-4 w-4" />
            View Details
          </Link>

          {showActions && (
            <div className="space-x-2">
              {onAssign && (
                <button
                  onClick={() => onAssign(certificate)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Assign
                </button>
              )}
              {onVerify && (
                <button
                  onClick={() => onVerify(certificate)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Verify
                </button>
              )}
              {onReject && (
                <button
                  onClick={() => onReject(certificate)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reject
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;