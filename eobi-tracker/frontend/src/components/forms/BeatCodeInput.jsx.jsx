import React, { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

const BeatCodeInput = ({ initialCodes = [], onChange, required = false }) => {
  const [codes, setCodes] = useState(initialCodes);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    onChange(codes);
  }, [codes, onChange]);

  const handleAddCode = () => {
    if (!inputValue.trim()) {
      setError('Beat code cannot be empty');
      return;
    }

    if (codes.includes(inputValue.toUpperCase())) {
      setError('This beat code already exists');
      return;
    }

    if (inputValue.length > 6) {
      setError('Beat code cannot exceed 6 characters');
      return;
    }

    setCodes([...codes, inputValue.toUpperCase()]);
    setInputValue('');
    setError('');
  };

  const handleRemoveCode = (codeToRemove) => {
    setCodes(codes.filter(code => code !== codeToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCode();
    }
  };

  return (
    <div>
      <div className="flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter beat code (e.g. ABC123)"
          maxLength={6}
        />
        <button
          type="button"
          onClick={handleAddCode}
          className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {required && codes.length === 0 && (
        <p className="mt-1 text-sm text-red-600">At least one beat code is required</p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {codes.map(code => (
          <span
            key={code}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {code}
            <button
              type="button"
              onClick={() => handleRemoveCode(code)}
              className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
            >
              <FiX className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default BeatCodeInput;