export type RootStackParamList = {
  Home: undefined;
  HabitDetail: { habitId: string };
  HabitForm: { habitId?: string } | undefined;
};
