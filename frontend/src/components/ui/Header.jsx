import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FiLogOut, FiUser, FiBell, FiMenu } from 'react-icons/fi';
import logo from '../../../public/logo.png';

const Header = ({ onToggleSidebar }) => {
  const { authState, logout } = useAuth();

  const roleNames = {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'chairman': 'Chairman',
    'ddg': 'DDG B&C',
    'rh': 'Regional Head',
    'drh': 'DRH',
    'bts': 'BTS Officer',
    'bts_fo': 'BTS Field Office',
    'beat_officer': 'Beat Officer'
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden text-gray-500 hover:text-gray-600 focus:outline-none"
              onClick={onToggleSidebar}
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src={logo}
                alt="EOBI Tracker"
              />
              <span className="ml-2 text-lg font-semibold text-gray-800 hidden sm:block">
                EOBI Certificate Tracker
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">View notifications</span>
              <FiBell className="h-6 w-6" />
            </button>

            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-2 max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-blue-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {authState.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {roleNames[authState.user?.role]}
                  </p>
                </div>
              </button>

              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block z-10">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">
                    {authState.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {authState.user?.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FiLogOut className="mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
