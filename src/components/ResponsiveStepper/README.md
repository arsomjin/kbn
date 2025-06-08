# ResponsiveStepper Component

## Overview

A modern, responsive stepper component that replaces shards-react stepper with Ant Design integration. Supports all device screens, multiple themes, and full RBAC integration.

## Recent Fixes Applied

### ✅ **Mobile Black Box Issue Fixed**

**Problem**: Dark box appearing on mobile screens
**Root Cause**: CSS dark mode queries being applied inappropriately on mobile devices
**Solution**:

- Removed `@media (prefers-color-scheme: dark)` auto-detection
- Changed to explicit `.dark-theme` class-based dark mode
- Added background color overrides to ensure white background
- Improved mobile details card conditional rendering

### ✅ **Legacy Stepper Removal**

**Removed from**:

- `IncomeDaily` component: Removed shards-react imports and old Stepper component
- Replaced with LayoutWithRBAC integration using ResponsiveStepper
- Cleaned up PageTitle and Container dependencies

### ✅ **CSS Improvements**

- Enhanced mobile details card styling with proper white background
- Added box shadows for better visual separation
- Improved progress bar text styling with border radius
- Made stepper background transparent to avoid conflicts

## Component Structure

```
src/components/
├── ResponsiveStepper.js       # Main component
├── ResponsiveStepper.css      # Styling with responsive design
└── ResponsiveStepper/
    └── README.md             # This documentation
```

## Features

### 📱 **Responsive Design**

- **Desktop**: Horizontal layout with full descriptions
- **Tablet**: Adaptive sizing and spacing
- **Mobile**:
  - Auto-switches to vertical layout
  - Progress bar with Thai text
  - Compact step details when needed
  - Horizontal scrolling on very small screens

### 🎨 **Multiple Themes**

- **Default**: Clean, professional appearance
- **Minimal**: Simple, focused design
- **Modern**: Gradient backgrounds with shadows

### 🔗 **Audit Trail Integration**

- Shows user information on completed steps
- Displays timestamps and branch context
- Integrates with RBAC permission system
- Step changes automatically create audit entries

### ⚙️ **Configuration Options**

```javascript
<ResponsiveStepper
  steps={steps} // Array of step objects
  currentStep={0} // Active step index
  direction="horizontal" // horizontal | vertical
  size="default" // default | small
  theme="default" // default | minimal | modern
  responsive={true} // Auto-responsive behavior
  showDescription={true} // Show step descriptions
  showProgress={true} // Show mobile progress bar
  onStepClick={handleStepClick} // Click handler
  auditInfo={auditTrail} // Audit trail data
/>
```

## Integration Examples

### Basic Usage

```javascript
import { ResponsiveStepper } from "components";

const steps = [
  { title: "บันทึกรายการ", description: "กรอกข้อมูลเอกสาร" },
  { title: "ตรวจสอบ", description: "ตรวจสอบความถูกต้อง" },
  { title: "อนุมัติ", description: "อนุมัติเอกสาร" },
  { title: "เสร็จสิ้น", description: "ดำเนินการเสร็จสิ้น" },
];

<ResponsiveStepper steps={steps} currentStep={1} responsive={true} />;
```

### With LayoutWithRBAC

```javascript
<LayoutWithRBAC
  showStepper={true}
  steps={DOCUMENT_STEPS}
  currentStep={activeStep}
  onStepClick={handleStepChange}
  documentId={documentId}
  documentType="income_daily"
  showAuditTrail={true}
>
  <YourComponent />
</LayoutWithRBAC>
```

### With Audit Trail Integration

```javascript
<ResponsiveStepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={handleStepClick}
  auditInfo={auditTrail?.filter((entry) => entry.action.includes("step"))}
  theme="modern"
  showDescription={true}
/>
```

## Step Object Format

```javascript
const step = {
  title: "ชื่อขั้นตอน", // Required: Step title
  description: "คำอธิบาย", // Optional: Step description
  status: "completed", // Optional: Step status for styling
  style: {}, // Optional: Custom styling
};
```

## Audit Info Format

```javascript
const auditEntry = {
  step: 0, // Step index
  userDisplayName: "ชื่อผู้ใช้", // User name
  timestamp: "2024-01-15 09:30", // Timestamp
  branchName: "สาขานครราชสีมา", // Branch name
};
```

## CSS Classes

### Main Classes

- `.responsive-stepper` - Base stepper container
- `.responsive-stepper-responsive` - Responsive behavior enabled
- `.responsive-stepper-{theme}` - Theme variations

### Mobile Classes

- `.stepper-progress-bar` - Mobile progress bar
- `.stepper-mobile-details` - Mobile step details card

### State Classes

- `.stepper-step-clickable` - Clickable step
- `.stepper-step-current` - Current active step

## Browser Support

- ✅ Chrome 70+
- ✅ Firefox 70+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android 7+)

## Performance Features

- **Lazy Loading**: Components load only when needed
- **Memoization**: Prevents unnecessary re-renders
- **Optimized CSS**: Minimal DOM manipulation
- **Responsive Caching**: Device detection cached

## Migration from shards-react

### Before (Legacy)

```javascript
import { Stepper } from "elements";
import { CommonSteps } from "data/Constant";

<Stepper
  steps={CommonSteps}
  activeStep={activeStep}
  alternativeLabel={false}
/>;
```

### After (Modern)

```javascript
import { ResponsiveStepper } from "components";

<ResponsiveStepper
  steps={CUSTOM_STEPS}
  currentStep={activeStep}
  responsive={true}
  theme="default"
/>;
```

## Testing

Access the interactive demo at:
**Developer → Test → Audit Trail & Stepper Demo**

### Demo Features

- Live configuration controls
- Multiple theme examples
- Mobile preview simulation
- Audit trail integration examples
- Code usage examples

## Troubleshooting

### Black Box on Mobile

- **Fixed**: Dark mode CSS no longer auto-applies
- Ensure theme is explicitly set if dark mode needed
- Use `.dark-theme` class for dark styling

### Layout Issues

- Check parent container has proper width
- Ensure no conflicting CSS from global styles
- Use `responsive={true}` for automatic adjustments

### Step Click Not Working

- Verify `onStepClick` prop is provided
- Check step permissions in RBAC integration
- Ensure step index is within allowed range

## Performance Tips

1. **Memoize Steps Data**: Use `useMemo` for step arrays
2. **Optimize Handlers**: Use `useCallback` for event handlers
3. **Conditional Rendering**: Only render when needed
4. **Theme Consistency**: Stick to one theme per application

## Future Enhancements

- [ ] Custom icon support
- [ ] Animation transitions
- [ ] Accessibility improvements
- [ ] RTL language support
- [ ] Voice navigation support
