// client/src/pages/LoginPage.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full mx-auto">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      </div>
      <div className="mt-8 max-w-md w-full mx-auto bg-white py-8 px-4 sm:px-10 shadow rounded-lg">
        <LoginForm />
        <div className="text-sm text-center mt-4">
          <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};