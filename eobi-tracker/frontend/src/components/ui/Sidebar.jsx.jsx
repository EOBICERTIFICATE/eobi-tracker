import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  FiHome, FiFileText, FiUsers, FiSettings, 
  FiMap, FiAlertCircle, FiUpload, FiCheckCircle 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { authState } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: FiHome,
      roles: ['super_admin', 'admin', 'chairman', 'ddg', 'rh', 'drh', 'bts', 'bts_fo', 'beat_officer']
    },
    {
      name: 'Certificates',
      path: '/certificates',
      icon: FiFileText,
      roles: ['super_admin', 'admin', 'bts', 'bts_fo', 'beat_officer']
    },
    {
      name: 'Beat Officers',
      path: '/beat-officers',
      icon: FiUsers,
      roles: ['super_admin', 'admin', 'bts', 'rh', 'drh']
    },
    {
      name: 'Upload Certificates',
      path: '/upload',
      icon: FiUpload,
      roles: ['super_admin', 'admin', 'bts', 'bts_fo']
    },
    {
      name: 'Verifications',
      path: '/verifications',
      icon: FiCheckCircle,
      roles: ['super_admin', 'admin', 'rh', 'drh']
    },
    {
      name: 'Escalations',
      path: '/escalations',
      icon: FiAlertCircle,
      roles: ['super_admin', 'admin', 'chairman', 'ddg', 'rh', 'drh']
    },
    {
      name: 'Regions',
      path: '/regions',
      icon: FiMap,
      roles: ['super_admin', 'admin', 'ddg']
    },
    {
      name: 'Admin',
      path: '/admin',
      icon: FiSettings,
      roles: ['super_admin', 'admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(authState.user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transform fixed md:static inset-y-0 left-0 z-30 
        w-64 bg-white shadow-md overflow-y-auto transition duration-200 ease-in-out`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src={logo}
              alt="EOBI Tracker"
            />
            <span className="ml-2 text-lg font-semibold text-gray-800">
              EOBI Tracker
            </span>
          </div>
        </div>

        <nav className="mt-4">
          <ul className="space-y-1 px-2">
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${location.pathname === item.path 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <item.icon className="flex-shrink-0 h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>Logged in as: {authState.user?.name}</p>
            <p>Region: {authState.user?.region?.code || 'N/A'}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;