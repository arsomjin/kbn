# 🌐 Translation System

This document outlines the internationalization (i18n) system in the KBN platform, which uses i18next with react-i18next for multi-language support.

## Overview

The KBN platform supports multiple languages with Thai (th) as the default/fallback language and English (en) as an additional language. The translation system was partially implemented in the JavaScript version and needs to be fully integrated during the TypeScript migration.

## Directory Structure

```
/src/translations/
├── en/
│   └── translation.json     # English translations
├── th/
│   └── translation.json     # Thai translations
├── i18n.ts                  # i18next configuration
└── i18next.d.ts             # TypeScript type declarations
```

## Configuration

The i18n setup is configured in `src/translations/i18n.ts`:

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./en/translation.json";
import thTranslation from "./th/translation.json";

// Resources object containing translations
const resources = {
  en: {
    translation: enTranslation
  },
  th: {
    translation: thTranslation
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: "th", // Thai as default/fallback language
    interpolation: {
      escapeValue: false // not needed for React as it escapes by default
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"]
    }
  });

export default i18n;
```

## Usage Patterns

### Basic Component Translation

Use the `useTranslation` hook in functional components:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";

export const WelcomeMessage: React.FC = () => {
  const { t } = useTranslation();
  
  return <h1>{t("welcome.title")}</h1>;
};
```

### Translations with Variables

Pass variables to translation strings:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface UserGreetingProps {
  username: string;
}

export const UserGreeting: React.FC<UserGreetingProps> = ({ username }) => {
  const { t } = useTranslation();
  
  return <p>{t("greeting.welcome", { name: username })}</p>;
};
```

### Translations with Pluralization

Handle pluralization with the count parameter:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface ItemCountProps {
  count: number;
}

export const ItemCount: React.FC<ItemCountProps> = ({ count }) => {
  const { t } = useTranslation();
  
  return <p>{t("items.count", { count })}</p>;
};

// In translation.json:
// "items.count": "{{count}} item",
// "items.count_plural": "{{count}} items"
// For Thai:
// "items.count": "{{count}} รายการ"
```

### Formatting with Luxon

Format dates properly with Luxon:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";

interface DateDisplayProps {
  timestamp: number;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ timestamp }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  const dateTime = DateTime.fromMillis(timestamp)
    .setLocale(currentLanguage) // Set locale based on selected language
    .toFormat("dd MMMM yyyy"); // Format date
  
  return <p>{t("date.display", { date: dateTime })}</p>;
};
```

### Translation Keys Naming Convention

Use hierarchical dot notation for all keys to keep them organized:

```json
{
  "common": {
    "button": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete"
    },
    "label": {
      "name": "Name",
      "email": "Email"
    }
  },
  "auth": {
    "login": {
      "title": "Login",
      "email": "Email",
      "password": "Password",
      "submit": "Sign In",
      "forgotPassword": "Forgot your password?"
    },
    "register": {
      "title": "Create an Account",
      "submit": "Sign Up"
    },
    "validation": {
      "emailRequired": "Email is required",
      "invalidEmail": "Invalid email format",
      "passwordRequired": "Password is required",
      "passwordLength": "Password must be at least 8 characters"
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back, {{name}}!",
    "stats": {
      "sales": "Sales",
      "customers": "Customers",
      "orders": "Orders"
    }
  }
}
```

### Language Switcher Component

Create a language switcher component:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Select } from "antd";

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("i18nextLng", language);
  };
  
  return (
    <Select
      defaultValue={i18n.language}
      onChange={changeLanguage}
      dropdownMatchSelectWidth={false}
      style={{ width: 120 }}
    >
      <Select.Option value="th">ไทย</Select.Option>
      <Select.Option value="en">English</Select.Option>
    </Select>
  );
};
```

### Provider Setup

Configure the i18next provider in the application root:

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./translations/i18n";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
```

### Declaring Translation Types

Create TypeScript types for translations to get type checking and autocompletion:

```typescript
// src/translations/i18next.d.ts
import "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: typeof import("./en/translation.json");
    };
  }
}
```

## Dynamic Loading Pattern

For large applications, implement dynamic loading of translation namespaces:

```typescript
// In a feature module
const MyComponent: React.FC = () => {
  const { t, i18n } = useTranslation("myFeature");
  
  useEffect(() => {
    // Dynamically load the feature-specific translations
    const loadTranslations = async () => {
      await i18n.loadNamespaces("myFeature");
    };
    
    loadTranslations();
  }, [i18n]);
  
  return <div>{t("myFeature:someKey")}</div>;
};
```

## Handling Rich Text and HTML

Handle HTML content in translations safely:

```tsx
import React from "react";
import { useTranslation, Trans } from "react-i18next";

export const RichTextContent: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      {/* For simple HTML */}
      <div dangerouslySetInnerHTML={{ __html: t("richText.html") }} />
      
      {/* For translations with components */}
      <Trans i18nKey="richText.withComponents">
        This is <strong>bold</strong> and <a href="/link">this is a link</a>.
      </Trans>
    </div>
  );
};
```

## Translation Maintenance Best Practices

1. **Synchronize Keys**: Keep translation keys synchronized between language files to avoid missing translations.

2. **Extract Hardcoded Strings**: Always extract UI text to translation files.

3. **Document Keys**: Maintain a documentation of all translation keys for reference.

4. **Use Constants**: For frequently used translation keys, define constants.

5. **Default Values**: Provide default values for keys that might be missing:
   ```tsx
   t("some.key", "Default text if key is missing")
   ```

6. **Translation Context**: Use context when the same word may have different meanings:
   ```tsx
   t("date", { context: "calendar" })
   t("date", { context: "fruit" })
   ```

7. **Avoid String Concatenation**: Never concatenate strings in code; use variables instead:
   ```tsx
   // Wrong
   t("greeting") + " " + name
   
   // Right
   t("greeting.with.name", { name })
   ```

8. **Test Multi-language UI**: Test UI with all supported languages to ensure layouts accommodate varying text lengths.

## Migration Tips

When migrating from JavaScript to TypeScript, follow these steps for translations:

1. Ensure all components use the `useTranslation` hook
2. Replace hardcoded strings with translation keys
3. Add proper TypeScript type definitions
4. Test UI with both Thai and English languages

## Example Component with Complete Translation Implementation

```tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Button, Alert } from "antd";
import { DateTime } from "luxon";

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const currentDate = DateTime.now()
    .setLocale(i18n.language)
    .toFormat("dd MMMM yyyy");
  
  const handleSubmit = async (values: ContactFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(values);
      setSuccess(true);
      form.resetFields();
    } catch (err) {
      setError(t("contact.error.submission"));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="contact-form">
      <h2>{t("contact.title")}</h2>
      <p>{t("contact.date", { date: currentDate })}</p>
      
      {success && (
        <Alert
          message={t("contact.success.title")}
          description={t("contact.success.message")}
          type="success"
          showIcon
          closable
          onClose={() => setSuccess(false)}
        />
      )}
      
      {error && (
        <Alert
          message={t("contact.error.title")}
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label={t("contact.form.name.label")}
          rules={[
            {
              required: true,
              message: t("contact.form.name.required")
            }
          ]}
        >
          <Input placeholder={t("contact.form.name.placeholder")} />
        </Form.Item>
        
        <Form.Item
          name="email"
          label={t("contact.form.email.label")}
          rules={[
            {
              required: true,
              message: t("contact.form.email.required")
            },
            {
              type: "email",
              message: t("contact.form.email.invalid")
            }
          ]}
        >
          <Input placeholder={t("contact.form.email.placeholder")} />
        </Form.Item>
        
        <Form.Item
          name="message"
          label={t("contact.form.message.label")}
          rules={[
            {
              required: true,
              message: t("contact.form.message.required")
            }
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t("contact.form.message.placeholder")}
          />
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            {t("contact.form.submit")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
```