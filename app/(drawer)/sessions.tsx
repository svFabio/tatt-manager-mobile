import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import SessionHistoryScreen from '@/src/features/sessions/screens/SessionHistoryScreen';
import SessionDetailScreen from '@/src/features/sessions/screens/SessionDetailScreen';

export default function SessionsPage() {
  const { detail } = useLocalSearchParams<{ detail?: string }>();

  if (detail) {
    return <SessionDetailScreen sessionId={Number(detail)} />;
  }

  return <SessionHistoryScreen />;
}
