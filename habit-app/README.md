# Habit Management App

A production-ready habit tracking application built with Expo (React Native + TypeScript). Features include offline-first persistence using SQLite, streak tracking, customizable schedules, calendar view, local notifications, dark mode, analytics, i18n readiness, and accessibility labels.

## Features

- Add, edit, and delete habits with color coding and descriptions
- Scheduling options: daily, weekly, and custom day selection
- Automatic streak calculation and best streak tracking
- Calendar visualization of completions
- Local notifications for reminders (Expo Notifications)
- Offline-first storage via SQLite with seed data
- Zustand state management and date-fns utilities
- Dark mode aware UI and accessibility friendly components
- Basic analytics showing completion rate and active streaks
- i18n ready via `i18n-js`

## Project Structure

```
habit-app/
├── App.tsx
├── app.json
├── assets/
├── src/
│   ├── components/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── store/
│   ├── styles/
│   ├── utils/
│   └── i18n/
└── tests/
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI (`npm install -g expo`)

### Installation

```bash
npm install
```

### Running the App

Start the Expo development server:

```bash
npm start
```

Run on Android/iOS simulators or Expo Go app as prompted.

### Testing

Unit tests cover streak calculations and scheduling logic:

```bash
npm test
```

## Notifications

The first launch requests notification permissions. Reminders are scheduled locally per habit and synchronized with SQLite so they can be cancelled when updating or deleting habits.

## Offline-First Storage

All data is stored locally using Expo SQLite. Initial seed data is loaded on first launch. The `syncPendingChanges` function is ready for extension to integrate with a remote API when connectivity is available.

## Internationalization

Strings are defined in `src/i18n/locales`. Add additional locale files and register them in `src/i18n/index.ts` as needed.

## Accessibility

Interactive components include accessibility labels, roles, and states to support assistive technologies.

## License

This project is provided for educational purposes within the gallery repository.
