import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/ui/Header';
import Sidebar from '../components/ui/Sidebar';
import ChairmanDashboard from '../components/dashboard/ChairmanDashboard';
import BTSDashboard from '../components/dashboard/BTSDashboard';
import BeatOfficerDashboard from '../components/dashboard/BeatOfficerDashboard';
import EscalationPanel from '../components/dashboard/EscalationPanel';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'Chairman':
        return <ChairmanDashboard />;
      case 'DDG':
      case 'RH':
        return <EscalationPanel />;
      case 'BTS':
        return <BTSDashboard />;
      case 'Beat Officer':
        return <BeatOfficerDashboard />;
      default:
        return <div>No dashboard available for your role</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;