// client/src/pages/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setMessage("Passwords do not match.");
    }
    if (!token) {
      return setMessage("Invalid or missing reset token.");
    }
    try {
      const response = await authService.resetPassword(token, password);
      setMessage(response.message + " Redirecting to login...");
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <h2 className="text-center text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
      <div className="mt-8 max-w-md w-full mx-auto bg-white py-8 px-10 shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
          <button type="submit" className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Reset Password
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
};