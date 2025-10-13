import React from 'react';
import { Text, TextProps } from 'react-native';
import { AppTheme } from '@/styles/theme';

interface ThemedTextProps extends TextProps {
  theme: AppTheme;
  variant?: 'default' | 'muted' | 'title';
}

export const ThemedText: React.FC<ThemedTextProps> = ({ theme, variant = 'default', style, children, ...rest }) => {
  const color = variant === 'muted' ? theme.mutedText : theme.text;
  const fontSize = variant === 'title' ? 24 : undefined;
  const fontWeight = variant === 'title' ? '700' : undefined;
  return (
    <Text
      accessibilityRole="text"
      {...rest}
      style={[{ color, fontSize, fontWeight }, style]}
    >
      {children}
    </Text>
  );
};
