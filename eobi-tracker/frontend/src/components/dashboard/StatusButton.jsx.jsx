import React from 'react';
import api from '../../services/api';

const StatusButton = ({ certificate, onUpdate }) => {
  const handleStatusChange = async (status, rejectionReason = null) => {
    try {
      const payload = { status };
      if (status === 'rejected') {
        payload.rejectionReason = rejectionReason || 'No reason provided';
      }
      
      await api.patch(`/certificates/${certificate._id}`, payload);
      onUpdate();
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (certificate.status === 'verified') {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        Verified
      </span>
    );
  }

  return (
    <div className="relative">
      {showRejectForm ? (
        <div className="absolute z-10 mt-2 w-64 bg-white p-4 rounded shadow-lg border border-gray-200">
          <textarea
            className="w-full p-2 border rounded mb-2 text-sm"
            placeholder="Enter rejection reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => {
                handleStatusChange('rejected', rejectionReason);
                setShowRejectForm(false);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-xs"
            >
              Confirm Reject
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      
      <div className="flex space-x-2">
        <button
          onClick={() => handleStatusChange('verified')}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200"
        >
          Verify
        </button>
        <button
          onClick={() => setShowRejectForm(true)}
          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default StatusButton;