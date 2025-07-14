import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { useForm } from 'react-hook-form';
import { FiUpload, FiX } from 'react-icons/fi';

const CertificateForm = ({ onSuccess, initialData }) => {
  const { authState } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {}
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('firNumber', data.firNumber);
      formData.append('claimantName', data.claimantName);
      formData.append('fatherName', data.fatherName);
      formData.append('eobiNumber', data.eobiNumber);
      formData.append('cnic', data.cnic);
      formData.append('employerName', data.employerName);
      formData.append('employerMainCode', data.employerMainCode);
      formData.append('employerSubCode', data.employerSubCode);
      formData.append('beatCode', data.beatCode);
      formData.append('regionId', data.regionId);
      if (file) formData.append('file', file);

      if (initialData) {
        await api.put(`/certificates/${initialData.id}`, formData);
      } else {
        await api.post('/certificates', formData);
      }

      reset();
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
          <label className="block text-sm font-medium text-gray-700">FIR Number*</label>
          <input
            {...register('firNumber', { required: 'FIR Number is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.firNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.firNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Claimant Name*</label>
          <input
            {...register('claimantName', { required: 'Claimant name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.claimantName && (
            <p className="mt-1 text-sm text-red-600">{errors.claimantName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Father's Name</label>
          <input
            {...register('fatherName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">EOBI Number</label>
          <input
            {...register('eobiNumber')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CNIC*</label>
          <input
            {...register('cnic', { 
              required: 'CNIC is required',
              pattern: {
                value: /^[0-9]{5}-[0-9]{7}-[0-9]$/,
                message: 'Invalid CNIC format (XXXXX-XXXXXXX-X)'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="XXXXX-XXXXXXX-X"
          />
          {errors.cnic && (
            <p className="mt-1 text-sm text-red-600">{errors.cnic.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Employer Name</label>
          <input
            {...register('employerName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Main Code</label>
            <input
              {...register('employerMainCode')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub Code</label>
            <input
              {...register('employerSubCode')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Beat Code*</label>
          <select
            {...register('beatCode', { required: 'Beat code is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Beat Code</option>
            {authState.user?.beatCodes?.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          {errors.beatCode && (
            <p className="mt-1 text-sm text-red-600">{errors.beatCode.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Region*</label>
          <select
            {...register('regionId', { required: 'Region is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={!!initialData}
          >
            <option value="">Select Region</option>
            {authState.regions?.map(region => (
              <option key={region.id} value={region.id}>
                {region.code} - {region.name}
              </option>
            ))}
          </select>
          {errors.regionId && (
            <p className="mt-1 text-sm text-red-600">{errors.regionId.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Supporting Document
        </label>
        <div className="mt-1 flex items-center">
          <label className="inline-flex items-center px-4 py-2 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
            <FiUpload className="mr-2" />
            {file ? file.name : 'Choose File'}
            <input
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
          </label>
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          PDF, DOC, or DOCX (Max 5MB)
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            reset();
            setFile(null);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Certificate'}
        </button>
      </div>
    </form>
  );
};

export default CertificateForm;