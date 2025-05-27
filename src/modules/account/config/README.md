# Account Menu Configuration

This module provides menu configuration for the account section with full i18n translation support.

## Usage

### Using the Translation-Enabled Hook (Recommended)

```jsx
import React from 'react';
import { useAccountMenuConfig } from './menuConfig';

const AccountMenu = () => {
  const menuConfig = useAccountMenuConfig();

  // Use menuConfig.executive, menuConfig.province, or menuConfig.branch
  // based on user role

  return (
    <Menu>
      {menuConfig.executive.children.map((item) => (
        <Menu.Item key={item.key}>
          {item.label} {/* This will be translated */}
        </Menu.Item>
      ))}
    </Menu>
  );
};
```

### Legacy Usage (Deprecated)

```jsx
import { accountMenuConfig } from './menuConfig';

// This uses hardcoded English labels and is deprecated
const menu = accountMenuConfig.executive;
```

## Translation Keys

The menu translations are stored in `src/translations/en/menu.json` and `src/translations/th/menu.json`.

### Translation Structure

```json
{
  "account": {
    "executive": {
      "title": "Account (Executive)"
    },
    "province": {
      "title": "Account (Province)"
    },
    "branch": {
      "title": "Account (Branch)"
    },
    "overview": "Overview",
    "income": "Income",
    "expense": "Expense",
    "inputPrice": "Input Price"
  }
}
```

## Menu Structure

The menu configuration supports three user role categories:

1. **Executive**: Full access to all account features
2. **Province Manager**: Province-level account access
3. **Branch Manager/Staff**: Branch-level account access

Each menu item includes:

- `key`: Unique identifier
- `label`: Translated display text
- `path`: Route path (with parameters for province/branch)
- `permission`: Required permission constant
- `roles`: Array of allowed role categories

## Adding New Menu Items

1. Add the new menu item to the appropriate section in `menuConfig.tsx`
2. Add the translation key to both `en/menu.json` and `th/menu.json`
3. Ensure proper permissions are set

## Migration Guide

To migrate from the legacy static configuration to the translation-enabled version:

1. Replace `import { accountMenuConfig }` with `import { useAccountMenuConfig }`
2. Change `const config = accountMenuConfig` to `const config = useAccountMenuConfig()`
3. Ensure your component is wrapped in a React component (hooks can only be used in components)
