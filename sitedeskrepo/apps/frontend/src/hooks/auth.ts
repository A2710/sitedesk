import { useMutation, useQuery, QueryClient, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient.js';
import { useNavigate } from 'react-router-dom';
import {
  UserSigninInput,
  UserSignupInput,
  JwtPayload,
  AuthResponse,
  GetMeResponse
} from '@repo/common/types';

async function doSignup(data: UserSignupInput): Promise<AuthResponse> {
  return apiClient
    .post<AuthResponse>('/auth/signup', data)
    .then(res => res.data);
}

async function doSignin(data: UserSigninInput): Promise<AuthResponse> {
  return apiClient
    .post<AuthResponse>('/auth/signin', data)
    .then(res => res.data);
}

export const useSignUp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation<AuthResponse, Error, UserSignupInput>({
    mutationFn: (data: UserSignupInput) => doSignup(data),
    onSuccess: (response) => {
      queryClient.setQueryData(['currentUser'], response.user);
      navigate('/');
    },
    onError: (error) => {
      console.error('Sign-up failed:', error.message);
    }
  });
};


export const useSignIn = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation<AuthResponse, Error, UserSigninInput>({
    mutationFn: (data: UserSigninInput) => doSignin(data),
    onSuccess: (response: AuthResponse) => {
      queryClient.setQueryData(['currentUser'], response.user);
      navigate('/');
    },
    onError: (error) => {
      console.error('Sign-in failed:', error.message);
    }
  });
};

export function useCurrentUser() {
  return useQuery<GetMeResponse, Error>({
    queryKey: ['currentUser'],
    queryFn: () =>
      apiClient
        .get<GetMeResponse>('/users/me')
        .then(res => res.data),
    retry: false,
    staleTime: 5 * 60_000,
  });
}
