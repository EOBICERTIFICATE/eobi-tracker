import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { FiAlertTriangle, FiChevronRight } from 'react-icons/fi';

const EscalationPanel = () => {
  const { authState } = useAuth();
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEscalations = async () => {
      try {
        const response = await api.get('/certificates/escalated');
        setEscalations(response.data);
      } catch (error) {
        console.error('Failed to fetch escalations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEscalations();
    const interval = setInterval(fetchEscalations, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [authState.token]);

  const handleResolveClick = async (certificateId) => {
    try {
      await api.put(`/certificates/${certificateId}/resolve-escalation`);
      setEscalations(escalations.filter(esc => esc.id !== certificateId));
    } catch (error) {
      console.error('Failed to resolve escalation:', error);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : escalations.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No escalated certificates
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {escalations.map((cert) => (
            <li key={cert.id} className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiAlertTriangle className="text-yellow-500 text-xl" />
                  <div>
                    <p className="font-medium">{cert.trackingId}</p>
                    <p className="text-sm text-gray-500">
                      {cert.claimantName} • {cert.beatCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-500">
                    {Math.floor((new Date() - new Date(cert.createdAt)) / (1000 * 60 * 60 * 24))} days
                  </span>
                  {authState.user.role === 'rh' && (
                    <button
                      onClick={() => handleResolveClick(cert.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Resolve
                    </button>
                  )}
                  <FiChevronRight className="text-gray-400" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EscalationPanel;
