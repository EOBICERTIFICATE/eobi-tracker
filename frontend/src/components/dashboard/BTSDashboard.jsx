import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import CertificateTable from '../ui/CertificateTable';
import StatusButton from './StatusButton';
import AssignCertificateModal from '../forms/AssignCertificateModal';

const BTSDashboard = () => {
  const { authState } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    overdue: 0
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [certsResponse, statsResponse] = await Promise.all([
          api.get('/certificates?status=Pending&limit=10'),
          api.get('/certificates/stats/bts')
        ]);

        setCertificates(certsResponse.data);
        setStats({
          pending: statsResponse.data.pending,
          assigned: statsResponse.data.assigned,
          overdue: statsResponse.data.overdue
        });
      } catch (error) {
        console.error('Failed to fetch BTS dashboard data:', error);
      }
    };

    fetchData();
  }, [authState.token]);

  const handleAssignClick = (certificate) => {
    setSelectedCert(certificate);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (beatOfficerId) => {
    try {
      await api.put(`/certificates/${selectedCert.id}/assign`, { beatOfficerId });
      setCertificates(certificates.filter(cert => cert.id !== selectedCert.id));
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        assigned: prev.assigned + 1
      }));
      setShowAssignModal(false);
    } catch (error) {
      console.error('Assignment failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusButton 
          count={stats.pending} 
          label="Unassigned Certificates" 
          color="red" 
        />
        <StatusButton 
          count={stats.assigned} 
          label="Assigned Today" 
          color="blue" 
        />
        <StatusButton 
          count={stats.overdue} 
          label="Overdue Cases" 
          color="yellow" 
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Pending Assignment</h3>
        </div>
        <CertificateTable 
          certificates={certificates} 
          onAssignClick={handleAssignClick}
          showActions
        />
      </div>

      <AssignCertificateModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleAssignSubmit}
        certificate={selectedCert}
      />
    </div>
  );
};

export default BTSDashboard;
