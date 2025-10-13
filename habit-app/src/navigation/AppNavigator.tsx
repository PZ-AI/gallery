import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { HabitDetailScreen } from '@/screens/HabitDetailScreen';
import { HabitFormScreen } from '@/screens/HabitFormScreen';
import { RootStackParamList } from './types';
import { translate } from '@/i18n';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: translate('home.title') }} />
        <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: translate('habitDetail.title') }} />
        <Stack.Screen name="HabitForm" component={HabitFormScreen} options={{ title: translate('habitForm.titleNew') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
