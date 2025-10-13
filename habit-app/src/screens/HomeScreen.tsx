import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { useHabitStore } from '@/store/useHabitStore';
import { HabitCard } from '@/components/habits/HabitCard';
import { AppTheme, getTheme } from '@/styles/theme';
import { ThemedView } from '@/components/layout/ThemedView';
import { ThemedText } from '@/components/layout/ThemedText';
import { translate } from '@/i18n';
import { RootStackParamList } from '@/navigation/types';

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const renderHeader = (theme: AppTheme, analytics: { completionRate: string; total: number; streaks: number }) => (
  <View
    style={[styles.analyticsCard, { backgroundColor: theme.card, borderColor: theme.border }]}
    accessibilityRole="summary"
  >
    <ThemedText theme={theme} variant="title" style={styles.analyticsTitle} accessibilityLabel={translate('home.analytics')}>
      {translate('home.analytics')}
    </ThemedText>
    <ThemedText theme={theme} style={styles.analyticsValue} accessibilityLabel={`${translate('home.completionRate')} ${analytics.completionRate}`}>
      {translate('home.completionRate')}: {analytics.completionRate}
    </ThemedText>
    <ThemedText theme={theme} style={styles.analyticsMeta} accessibilityLabel={`Total habits ${analytics.total}`}>
      Total Habits: {analytics.total}
    </ThemedText>
    <ThemedText theme={theme} style={styles.analyticsMeta} accessibilityLabel={`Active streaks ${analytics.streaks}`}>
      Active Streaks: {analytics.streaks}
    </ThemedText>
  </View>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { habits, logs, analytics, init, refresh, toggleCompletion, loading } = useHabitStore();

  useEffect(() => {
    init();
  }, [init]);

  const analyticsRate = `${Math.round(analytics.completionRate * 100)}%`;
  const headerAnalytics = {
    completionRate: analyticsRate,
    total: analytics.totalHabits,
    streaks: analytics.activeStreaks
  };

  return (
    <ThemedView theme={theme} style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.primary} accessibilityLabel="Loading habits" />
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader(theme, headerAnalytics)}
          ListEmptyComponent={() => (
            <ThemedText theme={theme} style={styles.emptyState} accessibilityLabel={translate('home.empty')}>
              {translate('home.empty')}
            </ThemedText>
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              logs={logs[item.id] ?? []}
              theme={theme}
              onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
              onToggle={() => toggleCompletion(item.id)}
            />
          )}
          accessibilityLabel="Habit list"
        />
      )}
      <Pressable
        onPress={() => navigation.navigate('HabitForm')}
        style={[styles.fab, { backgroundColor: theme.primary }]}
        accessibilityRole="button"
        accessibilityLabel={translate('home.addHabit')}
      >
        <ThemedText theme={theme} style={styles.fabText}>
          +
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24
  },
  listContent: {
    paddingBottom: 120
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  analyticsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1
  },
  analyticsTitle: {
    marginBottom: 8
  },
  analyticsValue: {
    fontSize: 16,
    fontWeight: '600'
  },
  analyticsMeta: {
    marginTop: 4,
    fontSize: 14
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 32
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600'
  }
});
