import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusButton from './StatusButton';
import EscalationPanel from './EscalationPanel';
import RegionalHeatmap from './RegionalHeatmap';

const ChairmanDashboard = () => {
  const { authState } = useAuth();
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    escalated: 0,
    regions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/certificates/stats');
        setStats({
          pending: response.data.pending,
          verified: response.data.verified,
          escalated: response.data.escalated,
          regions: response.data.regions
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [authState.token]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusButton 
          count={stats.pending} 
          label="Pending Certificates" 
          color="red" 
        />
        <StatusButton 
          count={stats.verified} 
          label="Verified Today" 
          color="green" 
        />
        <StatusButton 
          count={stats.escalated} 
          label="Escalated Cases" 
          color="yellow" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Regional Performance</h3>
          <RegionalHeatmap regions={stats.regions} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Escalations</h3>
          <EscalationPanel />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default ChairmanDashboard;
