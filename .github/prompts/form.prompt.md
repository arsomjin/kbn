# React Form Component Generator

## Overview
Your goal is to generate a production-ready React form component following project standards.

## Input Requirements
Please provide the following information:
- Form name (e.g., UserRegistrationForm, ProductDetailsForm)
- Form fields with their types and validation rules (if not provided, ask for them)
- Purpose of the form (e.g., user registration, data collection, settings)

## Technical Requirements

### Component Structure
- Create a functional component with proper TypeScript types
- Implement a clean separation of concerns (validation, form state, UI)
- Include proper error handling and loading states
- Export the component as both named and default export

### Design System Integration
- Use form design system components from `components/design-system/Form`
- Follow project design patterns for consistent UI/UX
- Ensure responsive design for mobile and desktop views
- Include proper accessibility attributes (aria-labels, etc.)

### State Management
- Use `antd` Form components for form state management
- Implement controlled components pattern
- Use `defaultValues` to prevent unnecessary rerenders
- Include proper form reset functionality

### Data Model
- Define TypeScript interfaces for all form data
- Reference data schema from [data-schema.md](../../docs/data-schema.md)
- Match field names with existing data models in [collection-samples.json](../../docs/collection-samples.json)
- Document any deviations from the standard schema

### Validation
- Implement validation using `yup` schema validation
- Create reusable validation schemas in separate files (e.g., `validationSchemas/[formName]Schema.ts`)
- Define UX-friendly validation error messages
- Include both client-side validation and prepare for server-side validation handling

### Performance Considerations
- Implement form field memoization where appropriate
- Use debouncing for expensive validation operations
- Optimize re-renders using React's useMemo/useCallback

## Example Implementation

```tsx
// Basic structure example
import React from 'react';
import { Form, Input, Button } from 'antd';
import { FormField, FormSection } from 'components/design-system';
import { useYupValidator } from 'hooks/useYupValidator';
import { userFormSchema } from './validationSchemas/userFormSchema';
import type { UserFormData } from './types';

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: Partial<UserFormData>;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({ 
  onSubmit, 
  initialData = {}, 
  isLoading = false 
}) => {
  const [form] = Form.useForm<UserFormData>();
  const { validate } = useYupValidator(userFormSchema);
  
  // Form implementation logic...
  
  return (
    <FormSection title="User Information">
      <Form 
        form={form} 
        onFinish={handleSubmit}
        initialValues={initialData}
      >
        {/* Form fields */}
      </Form>
    </FormSection>
  );
};

export default UserForm;
```

## Output Deliverables
- Main form component file
- TypeScript types file
- Validation schema file
- Unit tests for the form (optional)

## Best Practices
- Follow project naming conventions
- Include JSDoc comments for public methods and props
- Use consistent error handling patterns
- Implement proper form accessibility
- Consider form state persistence for multi-step forms
