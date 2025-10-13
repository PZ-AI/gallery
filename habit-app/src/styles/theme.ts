import { ColorSchemeName } from 'react-native';

export interface AppTheme {
  background: string;
  card: string;
  text: string;
  mutedText: string;
  primary: string;
  border: string;
  success: string;
  danger: string;
}

export const lightTheme: AppTheme = {
  background: '#FFFFFF',
  card: '#F4F4F5',
  text: '#1C1C1E',
  mutedText: '#6B7280',
  primary: '#5567FF',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444'
};

export const darkTheme: AppTheme = {
  background: '#121212',
  card: '#1F1F1F',
  text: '#F9FAFB',
  mutedText: '#9CA3AF',
  primary: '#7C83FF',
  border: '#27272A',
  success: '#34D399',
  danger: '#F87171'
};

export const getTheme = (scheme: ColorSchemeName): AppTheme =>
  scheme === 'dark' ? darkTheme : lightTheme;
