import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';

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

  // Parse inline text tokens: **bold**, `code`, *italic*
  const renderInline = (rawText: string, baseStyle?: TextStyle) => {
    // Split by markdown bold, inline code, and italics
    const regex = /(\*\*[\s\S]*?\*\*|`[\s\S]*?`|\*[\s\S]*?\*|__[\s\S]*?__)/g;
    const parts = rawText.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        const inner = part.slice(2, -2);
        return (
          <Text key={index} style={[baseStyle, styles.bold]}>
            {inner}
          </Text>
        );
      }

      if (part.startsWith('`') && part.endsWith('`')) {
        const inner = part.slice(1, -1);
        return (
          <Text key={index} style={[baseStyle, styles.inlineCode]}>
            {inner}
          </Text>
        );
      }

      if (part.startsWith('*') && part.endsWith('*')) {
        const inner = part.slice(1, -1);
        return (
          <Text key={index} style={[baseStyle, styles.italic]}>
            {inner}
          </Text>
        );
      }

      return (
        <Text key={index} style={baseStyle}>
          {part}
        </Text>
      );
    });
  };

  // Parse block-level elements line by line
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code block fences
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <View key={`code-${i}`} style={styles.codeBlock}>
            <Text style={styles.codeText}>{codeBuffer.join('\n')}</Text>
          </View>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Empty lines
    if (!trimmed) {
      elements.push(<View key={`spacer-${i}`} style={styles.paragraphSpacer} />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <Text key={`h3-${i}`} style={styles.h3}>
          {renderInline(trimmed.slice(4))}
        </Text>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <Text key={`h2-${i}`} style={styles.h2}>
          {renderInline(trimmed.slice(3))}
        </Text>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <Text key={`h1-${i}`} style={styles.h1}>
          {renderInline(trimmed.slice(2))}
        </Text>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <View key={`quote-${i}`} style={styles.blockquote}>
          <Text style={styles.quoteText}>{renderInline(trimmed.slice(2))}</Text>
        </View>
      );
      continue;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <View key={`bullet-${i}`} style={styles.bulletRow}>
          <Text style={styles.bulletSymbol}>•</Text>
          <Text style={styles.bulletText}>{renderInline(trimmed.slice(2))}</Text>
        </View>
      );
      continue;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <View key={`num-${i}`} style={styles.bulletRow}>
          <Text style={styles.numSymbol}>{numMatch[1]}.</Text>
          <Text style={styles.bulletText}>{renderInline(numMatch[2])}</Text>
        </View>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <Text key={`p-${i}`} style={styles.paragraph}>
        {renderInline(line)}
      </Text>
    );
  }

  // If code block was not closed
  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <View key="code-unclosed" style={styles.codeBlock}>
        <Text style={styles.codeText}>{codeBuffer.join('\n')}</Text>
      </View>
    );
  }

  return <View style={[styles.container, style]}>{elements}</View>;
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
  h1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 12,
    marginBottom: 6,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#343a40',
    marginTop: 10,
    marginBottom: 4,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#212529',
    marginBottom: 4,
  },
  paragraphSpacer: {
    height: 6,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  inlineCode: {
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    color: '#d63384',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 14,
  },
  codeBlock: {
    backgroundColor: '#212529',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#f8f9fa',
    lineHeight: 18,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#0d6efd',
    paddingLeft: 10,
    marginVertical: 6,
  },
  quoteText: {
    fontStyle: 'italic',
    color: '#495057',
    fontSize: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 4,
  },
  bulletSymbol: {
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
    color: '#0d6efd',
  },
  numSymbol: {
    fontSize: 14,
    lineHeight: 22,
    marginRight: 6,
    color: '#495057',
    fontWeight: '600',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#212529',
  },
});

export default NativeMarkdown;
