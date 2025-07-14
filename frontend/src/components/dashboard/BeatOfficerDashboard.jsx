import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import CertificateTable from '../ui/CertificateTable';
import StatusButton from './StatusButton';
import VerifyCertificateModal from '../forms/VerifyCertificateModal';

const BeatOfficerDashboard = () => {
  const { authState } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    overdue: 0
  });
  const [selectedCert, setSelectedCert] = useState(null);
  const [actionType, setActionType] = useState('verify');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/certificates/assigned');
        setCertificates(response.data.certificates);
        setStats({
          pending: response.data.pendingCount,
          verified: response.data.verifiedCount,
          overdue: response.data.overdueCount
        });
      } catch (error) {
        console.error('Failed to fetch assigned certificates:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [authState.token]);

  const handleVerifyClick = (certificate) => {
    setSelectedCert(certificate);
    setActionType('verify');
  };

  const handleRejectClick = (certificate) => {
    setSelectedCert(certificate);
    setActionType('reject');
  };

  const handleActionSubmit = async (data) => {
    try {
      if (actionType === 'verify') {
        const formData = new FormData();
        formData.append('pdf', data.file);
        await api.post(`/certificates/${selectedCert.id}/verify`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post(`/certificates/${selectedCert.id}/reject`, {
          reason: data.reason
        });
      }

      setCertificates(certificates.filter(cert => cert.id !== selectedCert.id));
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        verified: actionType === 'verify' ? prev.verified + 1 : prev.verified
      }));
      setSelectedCert(null);
    } catch (error) {
      console.error(`${actionType} action failed:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusButton 
          count={stats.pending} 
          label="Pending Verification" 
          color="red" 
        />
        <StatusButton 
          count={stats.verified} 
          label="Verified Today" 
          color="green" 
        />
        <StatusButton 
          count={stats.overdue} 
          label="Overdue Cases" 
          color="yellow" 
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">My Assigned Certificates</h3>
        </div>
        <CertificateTable 
          certificates={certificates} 
          onVerifyClick={handleVerifyClick}
          onRejectClick={handleRejectClick}
          showBeatOfficerActions
        />
      </div>

      <VerifyCertificateModal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        onSubmit={handleActionSubmit}
        certificate={selectedCert}
        actionType={actionType}
      />
    </div>
  );
};

export default BeatOfficerDashboard;
