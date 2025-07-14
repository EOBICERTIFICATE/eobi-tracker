import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CertificateCard from '../components/ui/CertificateCard';
import api from '../services/api';

const CertificateList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        let url = '/certificates';
        if (user.role === 'Beat Officer') {
          url = `/certificates/beat/${user.assignedBeatCode}/${user.region}`;
        }
        
        const response = await api.get(url);
        setCertificates(response.data);
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Certificate Management</h1>
      
      {loading ? (
        <p>Loading certificates...</p>
      ) : certificates.length === 0 ? (
        <p>No certificates found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(certificate => (
            <CertificateCard 
              key={certificate._id} 
              certificate={certificate} 
              role={user.role}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateList;
