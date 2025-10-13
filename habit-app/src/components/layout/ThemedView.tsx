import React, { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppTheme } from '@/styles/theme';

interface ThemedViewProps extends PropsWithChildren {
  theme: AppTheme;
  style?: any;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ theme, children, style }) => {
  return <View style={[styles.container, { backgroundColor: theme.background }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
