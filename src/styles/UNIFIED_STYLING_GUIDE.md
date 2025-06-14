# KBN Unified Styling System

## Overview

This document outlines the unified styling approach for the KBN application, designed to prevent conflicts between multiple CSS libraries and ensure consistent theming across all components.

## CSS Load Order (Critical)

The CSS files are loaded in a specific order to prevent conflicts:

```javascript
// 1. BASE LIBRARIES (Foundation)
import "antd/dist/antd.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css";

// 2. UNIFIED THEME SYSTEM (Master Controller)
import "styles/unified-theme.css";

// 3. LEGACY OVERRIDES (Being gradually replaced)
import "styles/nature-theme.scss";
import "styles/nature-components.css";
import "styles/nature-antd-overrides.css";
import "styles/font-config.css";
```

## CSS Architecture

### 1. CSS Variables (Highest Priority)

- **File**: `unified-theme.css`
- **Purpose**: Central theme variables that control all styling
- **Scope**: Global, affects all components

```css
:root {
  --nature-primary: #2d5016;
  --nature-font-family: "Sarabun", "Myriad Pro", sans-serif;
  /* ... */
}
```

### 2. Component-Specific Styles

- **Approach**: Target specific Ant Design classes
- **Use**: `!important` selectively for overriding library defaults
- **Example**:

```css
.ant-steps-item-title {
  font-family: var(--nature-font-family) !important;
  color: var(--nature-text-primary) !important;
}
```

### 3. Utility Classes

- **Purpose**: Reusable styling classes
- **Examples**:
  - `.nature-steps-compact`
  - `.nature-steps-spaced`
  - `.nature-steps-no-margin`

## Preventing CSS Conflicts

### Strategy 1: CSS Specificity

Use high specificity to override library defaults:

```css
/* Good: High specificity */
.ant-card .ant-steps .ant-steps-item-title {
  font-family: var(--nature-font-family);
}

/* Better: Use CSS variables for consistency */
.ant-steps-item-title {
  font-family: var(--nature-font-family) !important;
}
```

### Strategy 2: Selective `!important`

Use `!important` only when necessary to override library styles:

```css
/* Use !important for library overrides */
.ant-steps {
  font-family: var(--nature-font-family) !important;
}

/* Don't use !important for custom styles */
.nature-steps-custom {
  margin: 16px 0; /* No !important needed */
}
```

### Strategy 3: Namespace Prevention

Prevent conflicts with legacy libraries:

```css
/* Override Bootstrap conflicts */
.container-fluid,
.container,
.row,
.col,
[class*="col-"] {
  font-family: var(--nature-font-family) !important;
}

/* Override Shards UI conflicts */
.btn,
.form-control,
.card {
  font-family: var(--nature-font-family) !important;
}
```

## Font System Integration

### Multi-Language Support

```css
/* Automatic font selection based on content */
.ant-steps-item-title {
  font-family: "Sarabun", "Myriad Pro", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Roboto", sans-serif !important;
}

/* Language-specific overrides if needed */
[lang="th"] .ant-steps-item-title {
  font-family: "Sarabun", sans-serif !important;
}

[lang="en"] .ant-steps-item-title {
  font-family: "Myriad Pro", sans-serif !important;
}
```

## Component Integration Patterns

### Steps Component Example

**❌ Before (Conflicting styles):**

```jsx
<Steps current={1} items={[...]}>  // Wrong API for v4.x
  // Inconsistent fonts, colors
</Steps>
```

**✅ After (Unified approach):**

```jsx
<Steps current={1}>
  {" "}
  // Correct API for v4.x
  <Steps.Step
    title="บันทึกรายการ" // Thai text uses Sarabun
    description="Complete the data entry process" // English uses Myriad Pro
  />
  <Steps.Step title="ตรวจสอบ" description="Review and validate information" />
  <Steps.Step title="อนุมัติ" description="Final approval and confirmation" />
</Steps>
```

## Best Practices

### 1. Use CSS Variables

Always use CSS variables for consistency:

```css
/* Good */
.my-component {
  color: var(--nature-primary);
  font-family: var(--nature-font-family);
  margin: var(--nature-spacing-lg);
}

/* Avoid */
.my-component {
  color: #2d5016;
  font-family: "Sarabun";
  margin: 24px;
}
```

### 2. Responsive Design

Include responsive breakpoints:

```css
@media (max-width: 768px) {
  .ant-steps-item-title {
    font-size: var(--nature-font-size-sm) !important;
  }
}
```

### 3. Print Styles

Consider print styles for business applications:

```css
@media print {
  .ant-steps {
    color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
}
```

## Debugging CSS Conflicts

### Tools and Techniques

1. **Browser DevTools**

   - Check computed styles
   - Identify style source
   - Test specificity

2. **CSS Debugging Classes**

   ```css
   /* Temporary debugging */
   .debug-border {
     border: 2px solid red !important;
   }
   ```

3. **Style Precedence Check**
   ```css
   /* Use this to test if styles are loading */
   .ant-steps {
     border: 1px solid blue !important; /* Remove after testing */
   }
   ```

## Migration Strategy

### Phase 1: Foundation ✅

- [x] Import Ant Design CSS globally
- [x] Create unified theme system
- [x] Fix Steps component compatibility

### Phase 2: Component Migration 🚧

- [ ] Update all Stepper components to use v4.x syntax
- [ ] Migrate data constants from arrays to objects
- [ ] Apply unified styling to all forms

### Phase 3: Legacy Cleanup 📋

- [ ] Remove Bootstrap dependencies
- [ ] Remove Shards UI dependencies
- [ ] Consolidate CSS files

## Troubleshooting

### Common Issues

1. **Steps not visible**

   - Check Ant Design CSS import
   - Verify component syntax (v4.x vs v5.x)
   - Ensure unified-theme.css is loaded

2. **Font not applying**

   - Check font loading in Network tab
   - Verify CSS variable definitions
   - Check specificity conflicts

3. **Styling conflicts**
   - Check CSS load order
   - Use browser DevTools to identify conflicts
   - Add more specific selectors

### Quick Fixes

```css
/* Force font application */
* {
  font-family: var(--nature-font-family) !important;
}

/* Debug visibility */
.ant-steps {
  border: 2px solid red !important;
  background: yellow !important;
}

/* Reset conflicts */
.ant-steps * {
  box-sizing: border-box !important;
}
```

## Future Enhancements

1. **CSS-in-JS Migration**

   - Consider styled-components for better encapsulation
   - Ant Design 5.x theme system integration

2. **Design Tokens**

   - Implement design token system
   - Better integration with Figma designs

3. **Performance Optimization**
   - CSS tree-shaking
   - Critical CSS extraction
   - Runtime theme switching

## Migration Script

For automated migration of existing components, use the provided migration script:

```bash
# Run the comprehensive migration script
node src/scripts/migrate-to-unified-theme.js

# Show help and options
node src/scripts/migrate-to-unified-theme.js --help

# Rollback changes if needed (uses git)
node src/scripts/migrate-to-unified-theme.js --rollback
```

**What the migration script does:**

- ✅ **Stepper Components**: Updates from `className="bg-light"` to `className="nature-stepper nature-steps-compact"`
- ✅ **Page Headers**: Converts `bg-light` to `nature-bg-light` in page headers
- ✅ **Card Components**: Migrates Bootstrap card classes to Ant Design equivalents
- ✅ **Component-Specific**: Handles special cases like BranchDateHeader
- ✅ **Reporting**: Provides detailed migration reports showing what was changed
- ✅ **Safety**: Preserves existing functionality while improving styling consistency

**Example Migration Output:**

```
🚀 Starting KBN Unified Theme Migration...

Found 247 JavaScript files to check

✅ Updated: src/components/branch-date-header.js
   - Stepper bg-light to nature-stepper
✅ Updated: src/Modules/Reports/Account/IncomeExpenseSummary/index.js
   - Page header bg-light to nature-bg-light
   - Stepper bg-light to nature-stepper

📊 Migration Summary:
   Files checked: 247
   Files updated: 45
   Files unchanged: 202

✅ Migration completed successfully!
```

## Contact & Support

For questions about the unified styling system:

- Check this documentation first
- Use browser DevTools for debugging
- Test changes in isolation
- Follow the CSS load order strictly
- Run the migration script for bulk updates

---

**Remember**: The unified styling system is designed to grow with the application. Always test changes across different components and screen sizes.
