import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';

export interface NativeMarkdownProps {
  content?: string | null;
  fallbackText?: string;
  style?: ViewStyle;
}

export const NativeMarkdown: React.FC<NativeMarkdownProps> = ({
  content,
  fallbackText = 'No content available',
  style,
}) => {
  if (!content || !content.trim()) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.fallback}>{fallbackText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Markdown>{content}</Markdown>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  fallback: {
    fontStyle: 'italic',
    color: '#6c757d',
    fontSize: 14,
    marginVertical: 4,
  },
});
