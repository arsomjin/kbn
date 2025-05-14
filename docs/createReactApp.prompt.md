# React Application Prompt

- **Project Structure:**

  - React application with organized directory structure
  - `/src/components`: components
  - `/src/services`: API and service connections (Firebase, Notification, etc.)
  - `/src/store`: Redux state management
  - `/src/translations`: Internationalization files
  - `/src/constants`: App-wide constants including roles
  - `/src/hooks`: Custom React hooks
  - `/src/utils`: Utility functions
  - `/src/modules`: Business modules
  - `/src/ui/components/notifications`: UI components for notification display

- **Tech Stack:**

  - React (Create React App base)
  - Redux for state management
  - Firestore/Firebase for database, authentication
  - Firebase Cloud Messaging (FCM) for push notifications
  - Ant Design for UI components
  - Tailwind CSS for styling
  - i18next for internationalization (Thai/English)
  - React Router for navigation
  - TypeScript
  - ESLint and Prettier seamless integration

- **Functionalities:**

  - User authentication and role-based permissions
  - Multi-language support (Thai/English)
  - Notification system with real-time updates
    - In-app notifications with mark-as-read functionality
    - Push notifications via Firebase Cloud Messaging
    - Role, branch, and department-specific notifications
    - Notification filtering based on user attributes
    - HTML content support in notification descriptions
    - Timestamp display with locale formatting (Thai/English)
  - Role-based access control to different app sections
  - Data import/export functionality
  - Responsive UI adaptable to different screen sizes
  - Theme switching (light/dark mode)

- **Logic:**

  - Firebase authentication with custom claims for roles
  - Redux for global state with slices for different domains
  - React context for theme and permissions
  - Service layer to abstract Firebase interactions
  - Role-based routing protection
  - Notification system with read/unread status tracking
    - Real-time Firestore listeners for new notifications
    - Optimistic UI updates on mark-as-read actions
    - FCM token management for push notifications
    - Notification filtering by user role, branch and department
    - Duration-based notification expiration
  - Data fetching with error handling and loading states

- **Styles & Theme:**

  - Ant Design and Tailwind CSS seamless integration
  - Ant Design as the primary UI library
  - Tailwind CSS for custom styling and layouts
  - Light/Dark theme with theme context
    - Theme-aware notification styling
  - Responsive design using flexbox and grid
  - Thai-language optimized typography
  - Custom color palette stored in theme variables
  - Notification type-based styling (success, info, warning, error)

- **Best Practices:**
  - Component separation of concerns
  - Custom hooks for reusable logic
  - Consistent error handling
    - Safe HTML parsing for notification content
    - Date validation with fallback displays
    - Error handling for notification operations
  - Translation key management for multilingual support
  - Role-based permission checks
  - Firestore security rules for data protection
  - Optimistic UI updates for better UX
    - Immediate UI updates before async operations complete
  - Code splitting for performance
  - Enhance/Improve Ant Design Styles and Tailwind CSS to be robust and professional without any conflicts
  - Integrate ESLint and Pretier consistently and seamlessly without any conflicts with the built-in React eslintConfig
  - Notification organization:
    - Most recent notifications first
    - Visual distinction between read/unread
    - HTML sanitization for security
    - Pagination to prevent UI clutter
