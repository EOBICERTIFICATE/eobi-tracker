import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { useForm } from 'react-hook-form';
import BeatCodeInput from './BeatCodeInput';

const UserForm = ({ onSuccess, initialData, isAdminView }) => {
  const { authState } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    defaultValues: initialData || {
      role: 'beat_officer',
      isActive: true
    }
  });
  const [regions, setRegions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const role = watch('role');

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await api.get('/regions');
        setRegions(response.data);
      } catch (err) {
        console.error('Failed to fetch regions:', err);
      }
    };

    fetchRegions();
  }, [authState.token]);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        password: '', // Don't pre-fill password
        beatCodes: initialData.beatCodes || []
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...data,
        beatCodes: data.beatCodes || []
      };

      if (initialData) {
        await api.put(`/users/${initialData.id}`, payload);
      } else {
        await api.post('/users', payload);
      }

      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBeatCodesChange = (codes) => {
    setValue('beatCodes', codes);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name*</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Personal Number*</label>
          <input
            {...register('personalNumber', { required: 'Personal number is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.personalNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.personalNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email*</label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {initialData ? 'New Password' : 'Password*'}
          </label>
          <input
            type="password"
            {...register('password', { 
              required: !initialData && 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Role*</label>
          <select
            {...register('role', { required: 'Role is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={isAdminView && !['super_admin', 'admin'].includes(authState.user?.role)}
          >
            <option value="beat_officer">Beat Officer</option>
            <option value="bts">BTS Officer</option>
            <option value="bts_fo">BTS Field Office</option>
            <option value="drh">DRH</option>
            <option value="rh">RH</option>
            {['super_admin', 'admin'].includes(authState.user?.role) && (
              <>
                <option value="ddg">DDG B&C</option>
                <option value="admin">Admin</option>
              </>
            )}
            {authState.user?.role === 'super_admin' && (
              <option value="super_admin">Super Admin</option>
            )}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Region</label>
          <select
            {...register('regionId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={!['bts', 'bts_fo', 'rh', 'drh', 'beat_officer'].includes(role)}
          >
            <option value="">Select Region</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.code} - {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {['beat_officer', 'bts', 'bts_fo'].includes(role) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Beat Codes {role === 'beat_officer' && '*'}
          </label>
          <BeatCodeInput
            initialCodes={initialData?.beatCodes || []}
            onChange={handleBeatCodesChange}
            required={role === 'beat_officer'}
          />
          {errors.beatCodes && (
            <p className="mt-1 text-sm text-red-600">{errors.beatCodes.message}</p>
          )}
        </div>
      )}

      {isAdminView && (
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Account Active
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
