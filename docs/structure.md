# 📁 Project Structure – KBN

This document outlines the folder and file structure of the KBN platform to help developers understand where logic is located and how to organize new code.

---

## 🗂️ Folder Overview

```
/kbn
├── build/                       # Production build output
├── docs/                        # Documentation files
├── exampleCode/                 # Example code templates
├── functions/                   # Firebase Cloud Functions
├── patches/                     # Patches for npm packages
├── public/                      # Static assets (favicon, manifest, etc.)
├── scripts/                     # Custom scripts (e.g. SW updater)
├── src/
│   ├── assets/                  # Project assets (icons, images, animations)
│   │   ├── animation/           # Animation files
│   │   ├── icons/               # Icon resources
│   │   ├── images/              # Image resources
│   │   ├── logo/                # Logo assets
│   │   ├── map-data/            # Map-related data
│   ├── constants/               # Application constants and enumerations
│   ├── controllers/             # Controller logic
│   ├── data/                    # Static data files
│   ├── hocs/                    # Higher-order components
│   ├── hooks/                   # Custom React hooks
│   ├── modules/                 # Feature modules (Auth, Dashboard, etc.)
│   ├── navigation/              # Routing and navigation components
│   ├── services/                # Services (Firebase, API interactions)
│   │   ├── API/                 # API service layer
│   │   ├── firebase/            # Firebase configuration and utilities
│   ├── store/                   # Redux store configuration
│   │   ├── middlewares/         # Redux middlewares
│   │   ├── slices/              # Redux slices (reducers and actions)
│   ├── styles/                  # Styling resources
│   │   ├── css/                 # CSS files
│   │   ├── themes/              # Theme definitions
│   ├── translations/            # i18n language files and configuration
│   ├── ui/                      # UI components
│   │   ├── components/          # Reusable UI components
│   │   ├── elements/            # Basic UI elements
│   │   ├── layout/              # Layout components
│   │   ├── screens/             # Page-level components
│   ├── utils/                   # Utility functions
│   │   ├── functions/           # Helper functions
│   ├── App.js                   # Root component
│   ├── index.js                 # React entry point
├── .env                         # Local environment variables (excluded from git)
├── .gitignore                   # Git ignore configuration
├── eslint.config.mjs            # ESLint configuration
├── firebase.json                # Firebase configuration
├── jsconfig.json                # JavaScript configuration
├── package.json                 # Project dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
└── README.md                    # Project documentation
```

---

## 📌 Key Modules

| Directory/File                  | Purpose                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| `src/ui/components/`            | Reusable UI components (buttons, tables, modals, icons)     |
| `src/store/slices/`             | Redux slices with actions, reducers and selectors           |
| `src/ui/screens/`               | Page-level components loaded via routing                    |
| `src/services/`                 | Contains Firebase configs, APIs, and data fetch logic       |
| `src/translations/`             | i18next resources (supports multi-language UI)              |
| `src/utils/`                    | Utilities like formatters, date/time helpers, and constants |
| `scripts/update-firebase-sw.js` | Regenerates Firebase service worker after build             |
| `functions/`                    | Backend logic using Firebase Cloud Functions                |
| `src/hooks/`                    | Custom React hooks for shared functionality                 |
| `src/modules/`                  | Feature modules (Auth, Dashboard, Milk, etc.)               |
| `src/navigation/`               | Routing configuration and navigation components             |

---

## ⚙️ Config Files

- `package.json`: Declares dependencies, scripts, browser config
- `eslint.config.mjs`: Lint rules for consistent code formatting
- `tailwind.config.js`: Tailwind CSS configuration
- `firebase.json`: Firebase project configuration
- `jsconfig.json`: JavaScript language service configuration
- `.env`: Environment variables (e.g. Firebase API keys)
