// app/(drawer)/chat/index.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ConversationList from '../../../src/features/whatsapp/components/ConversationList';

export default function ChatIndexScreen() {
  return (
    <View style={styles.container}>
      <ConversationList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' }
});