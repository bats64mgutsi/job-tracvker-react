import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Text } from '@/components/ui/text';

export interface NativeMarkdownProps {
  content?: string | null;
  fallbackText?: string;
  style?: ViewStyle;
  className?: string;
}

export const NativeMarkdown: React.FC<NativeMarkdownProps> = ({
  content,
  fallbackText = 'No content available',
  style,
  className,
}) => {
  if (!content?.trim()) {
    return (
      <View className={className} style={style}>
        <Text variant="muted" className="italic">
          {fallbackText}
        </Text>
      </View>
    );
  }

  return (
    <View className={className} style={style}>
      <Markdown>{content}</Markdown>
    </View>
  );
};

export default NativeMarkdown;
