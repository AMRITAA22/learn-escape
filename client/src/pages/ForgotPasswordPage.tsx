import React, { useState } from 'react';
import authService from '../services/authService';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <h2 className="text-center text-3xl font-extrabold text-gray-900">Forgot Your Password?</h2>
      <div className="mt-8 max-w-md w-full mx-auto bg-white py-8 px-10 shadow rounded-lg">
        <p className="text-center text-sm text-gray-600 mb-4">
          Enter your email address and we will send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
          <button type="submit" className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Send Reset Link
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
};