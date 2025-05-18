🎯 Goal: Rebuild or adjust this screen to **match exactly** the layout and structure of the provided reference screenshot.

🖼️ Reference Image:
Use the provided screenshot as the definitive visual guide.

📐 Layout Objectives:

1. 🧭 Stepper/Header:
   - Recreate multi-step progress bar (e.g. “บันทึกรายการ – ตรวจสอบ – อนุมัติ”)
   - Match positioning, spacing, and **color styles** (e.g., primary active step, gray inactive)

2. 🧾 Form Section:
   - Follow a **2-column grid layout** (or 1-column for smaller screens)
   - Align all labels and inputs precisely as shown in the screenshot
   - Preserve grouping and order (e.g., “ประเภทสินค้า” beside “เลขที่ใบรับสินค้า”)

3. 📊 Data Table Section:
   - Include headers
   - Support scroll on small devices
   - Show "No data" empty state with centered subtle text/icon

4. 🧮 Summary Section:
   - Place summary breakdown bottom-right (on desktop)
   - Stack vertically and center-aligned on mobile
   - Show line items
   - Style with:
     - Right-aligned values
     - Emphasized total (bold + color)
     - Consistent padding

5. 🖱 Action Button:
   - Right-aligned on desktop, full-width on mobile
   - Use app’s primary theme color for “บันทึกข้อมูล”

📱 Responsiveness:

- Desktop (≥ 1024px): 
  - 2-column form layout
  - Summary on the right
  - Action button aligned bottom-right

- Tablet (768px–1023px):
  - Form stacks with flexible grid
  - Table scrollable horizontally
  - Summary below table

- Mobile (≤ 767px):
  - 1-column full-width form
  - Table scrolls horizontally
  - Summary + button stacked bottom

🌒 Dark Mode Support:
- Match app-wide dark theme using theme tokens
- Invert backgrounds, text, and form field colors using design system palette
- Keep contrast and accessibility in mind

🎨 Theming and Style Guidelines:
- Use typography, spacing, border radius, and button styles from the app’s existing theme
- Reference theme tokens such as:
  - `theme.colors.primary`
  - `theme.spacing.sm`, `md`, `lg`
  - `theme.fontSizes.body`, `label`, etc.
- Support dynamic themes (light/dark) using design system or context provider

📌 General Rules:
- Use full language translation labels as-is (Thai default)
- Maintain all required field markers (`*`)
- Avoid hardcoded values — use design tokens where possible
- Match pixel spacing and grouping to screenshot

📂 Usage Instructions:
Use this prompt on any screen that needs to match legacy layout from screenshots while maintaining responsiveness, accessibility, and design consistency. Attach the screenshot and run this prompt directly inside Cursor.