import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useForm } from 'react-hook-form';
import { FiUser, FiSearch } from 'react-icons/fi';

const BeatAssignment = ({ beatCode, regionId, onSubmit }) => {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [beatOfficers, setBeatOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const searchQuery = watch('search', '');

  useEffect(() => {
    const fetchBeatOfficers = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/users', {
          params: {
            role: 'beat_officer',
            regionId,
            isActive: true,
            isVerified: true
          }
        });
        setBeatOfficers(response.data.filter(user => 
          user.beatCodes.includes(beatCode)
        ));
      } catch (err) {
        setError('Failed to load beat officers');
      } finally {
        setIsLoading(false);
      }
    };

    if (beatCode && regionId) {
      fetchBeatOfficers();
    }
  }, [beatCode, regionId]);

  const handleAssign = (officerId) => {
    setValue('officerId', officerId);
    handleSubmit(onSubmit)();
  };

  const filteredOfficers = beatOfficers.filter(officer =>
    officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.personalNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          {...register('search')}
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search beat officers..."
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOfficers.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No beat officers available for {beatCode}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredOfficers.map(officer => (
            <li key={officer.id} className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                    <FiUser className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{officer.name}</p>
                    <p className="text-sm text-gray-500">
                      {officer.personalNumber} • {officer.beatCodes.join(', ')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAssign(officer.id)}
                  className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Assign
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input type="hidden" {...register('officerId')} />
    </div>
  );
};

export default BeatAssignment;