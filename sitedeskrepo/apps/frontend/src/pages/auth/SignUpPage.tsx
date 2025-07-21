import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignUp } from '../../api/auth.js';
import {userSignup, UserSignupInput} from '@repo/common/types'

export default function SignUpPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<UserSignupInput>({
    resolver: zodResolver(userSignup),
  });
  const mutation = useSignUp();

  const onSubmit = (data: UserSignupInput) => {
    mutation.mutate(data, {
      onSuccess: () => navigate('/signin', { replace: true }),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            {...register('name')}
            className="mt-1 block w-full border rounded p-2"
          />
          {formState.errors.name && (
            <p className="text-red-500 text-sm">{formState.errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            {...register('email')}
            className="mt-1 block w-full border rounded p-2"
          />
          {formState.errors.email && (
            <p className="text-red-500 text-sm">{formState.errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            {...register('password')}
            className="mt-1 block w-full border rounded p-2"
          />
          {formState.errors.password && (
            <p className="text-red-500 text-sm">{formState.errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Signing up...' : 'Sign Up'}
        </button>

        <p className="mt-4 text-center">
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}