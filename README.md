# KBN Platform

A modern React TypeScript platform with Firebase integration, real-time notifications, multi-language support, and advanced theming.

## Features

- **Firebase Integration**: Authentication, Firestore, Storage, and Cloud Messaging
- **TypeScript**: Type-safe development
- **Redux Toolkit**: State management
- **Ant Design**: UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **Internationalization (i18n)**: English and Thai language support
- **Dark/Light Theme**: Animated sun/moon toggle with persisted preference
- **Role-based Access Control**: User roles and permissions
- **Real-time Notifications**: Firebase-powered notification system
- **Reusable Print Component**: Print any document (invoice, reservation, etc.) with custom templates and print-specific styles
- **Custom Hooks**: For authentication, notifications, permissions, theming, and more
- **Extensible Project Structure**: Modular and scalable codebase

## Project Structure

```
src/
  ├── assets/           # Static assets (images, icons, etc.)
  ├── components/       # Reusable React components
  │   ├── auth/         # Authentication components
  │   ├── common/       # Common UI (ThemeSwitch, PrintProvider, etc.)
  │   └── layout/       # Layout components
  ├── constants/        # Application constants
  ├── contexts/         # React context providers
  ├── controllers/      # Business logic controllers
  ├── hooks/            # Custom React hooks
  ├── modules/          # Business modules (auth, dashboard, ...)
  ├── navigation/       # Routing and navigation
  ├── services/         # API and Firebase services
  ├── store/            # Redux store and slices
  ├── styles/           # Global and component styles
  ├── theme/            # Theme configuration and overrides
  ├── translations/     # i18n files (en, th)
  ├── types/            # TypeScript type definitions
  └── utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v16.x or later recommended)
- yarn (preferred) or npm

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/arsomjin/kbn.git
   cd kbn
   ```

2. Install dependencies

   ```bash
   yarn install
   # or
   npm install
   ```

3. Set up environment variables

   - Create a `.env` file in the root directory
   - Add Firebase configuration:

   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_VAPID_KEY=your-vapid-key
   ```

4. Start the development server
   ```bash
   yarn start
   # or
   npm start
   ```

## Available Scripts

- `yarn start`: Run the app in development mode
- `yarn build`: Build the app for production
- `yarn test`: Run tests
- `yarn lint`: Run ESLint

## Deployment

1. Build the app for production

   ```bash
   yarn build
   ```

2. Deploy to Firebase Hosting
   ```bash
   firebase deploy
   ```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up Storage
5. Configure Firebase Cloud Messaging
6. Add your web app to the Firebase project and get the configuration
7. Update the `.env` file with your Firebase configuration

## Print Feature

- Use the reusable print component to print any document type (invoice, reservation, tax, etc.) with custom templates and print-specific styles.
- No external print library required; works in all major browsers.

## Excel Import/Export Feature

- Reusable component for importing and exporting Excel files (XLSX, XLS, CSV)
- Supports custom data mapping and templates
- Built with the `xlsx` library for robust Excel file handling
- Easily integrate into any module for bulk data operations

## Theme Toggle

- Modern sun/moon toggle (powered by `react-toggle-dark-mode`)
- Customizable icon colors (including green earth tone for dark mode)

## License

[MIT](LICENSE)
