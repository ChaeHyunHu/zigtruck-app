import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { SignUpScreen } from '@/src/features/auth/signup/SignUpScreen';
import { parseSignUpMemberType } from '@/src/features/auth/signup/types';

export default function SignUpRoute() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const memberType = parseSignUpMemberType(type);

  return <SignUpScreen memberType={memberType} />;
}
