import 'i18next';
import { UseTranslationOptions, UseTranslationResponse } from 'react-i18next';

declare module 'i18next' {
  interface TFunction {
    (key: string, options?: object): string;
  }
}

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      app: typeof import('./en/app.json');
      auth: typeof import('./en/auth.json');
      notifications: typeof import('./en/notifications.json');
      profile: typeof import('./en/profile.json');
      userReview: typeof import('./en/userReview.json');
      roles: typeof import('./en/roles.json');
      theme: typeof import('./en/theme.json');
      language: typeof import('./en/language.json');
      common: typeof import('./en/common.json');
      validation: typeof import('./en/validation.json');
      firebase: typeof import('./en/firebase.json');
      provinces: typeof import('./en/provinces.json');
      permissions: typeof import('./en/permissions.json');
      userRoleManager: typeof import('./en/userRoleManager.json');
      branches: typeof import('./en/branches.json');
      employees: typeof import('./en/employees.json');
    };
  }

  function useTranslation(
    ns?: string | string[],
    options?: UseTranslationOptions
  ): UseTranslationResponse;
}
