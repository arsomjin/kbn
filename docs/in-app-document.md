# 🎯 Cursor AI Prompt: Contextual Documentation System for RBAC & Page-Specific Help

You are skilled of instructions, visualized-guideline, user-manual creator.

## ✅ Objective

> 💡 This documentation system helps reduce user confusion, especially during onboarding, training, or handover. It supports multilingual content and visualized walkthroughs tailored to each page.

Implement a simple, responsive, page-specific in-app documentation system (similar to a digital user manual), to help users understand RBAC (Role-Based Access Control), permissions, and province-limited data access.

---

## ✳️ Prompt for Cursor AI

````md
📌 Please implement an in-app contextual documentation/help system, similar to a user manual, that is specific to each page or module. This will help users understand new features, especially the RBAC, Permission model, and province-limited access.

## 🧾 REQUIREMENTS

### 🔁 System Behavior

- Display a **floating help button** on every page (bottom-right corner).
- When clicked, open a **responsive modal or drawer** showing documentation content specific to the **current route or page**.
- This acts like a "digital user manual" with page-specific context.

### 📚 Documentation Content

Each page’s document will be split into 4 sections:

1. **Overview** — What this page/module does.
2. **Instruction** — How to use this module or page.
3. **Flow** — Logical or UI flow of this page (can use visual components, screenshots, or diagrams).
4. **Business Logic** — Explanation of RBAC, permission checks, and province filters applied on this page.

Each section may include **visual diagrams**, **annotated screenshots**, or **step-by-step flowcharts** to help users understand UI and logic more effectively.

You can inject different content based on the current route. For example:

```ts
const docs = {
  '/dashboard': { overview: "...", instruction: "...", flow: "...", logic: "..." },
  '/users': { overview: "...", instruction: "...", flow: "...", logic: "..." },
  '/sales': { ... }
}
```
````

### 💡 RBAC & Province Access Example

In the **Business Logic** section, include:

- Example logic like `.where("province", "==", user.province)`
- Describe roles: `Admin`, `Manager`, `Staff`
- Example: Manager from Province A can only edit records from Province A

### 🖼 UI Design

- Use **Ant Design components** (`FloatButton`, `Drawer`, `Collapse`, `Tabs`, etc.)
- Include **icons, spacing, and visual hierarchy** for clarity.
  - Support inserting annotated images or SVGs (stored in `src/docs/visuals`) in any section of the documentation.
- Make the drawer **auto-width and height responsive**.
- Support **dark mode and theme styling**
- Support **multi-language** with `useTranslation()`
- Allow each content block to switch between English and Thai.

### 🛠 Tech Requirements

- Fully written in **TypeScript**
- Create a reusable component: `src/components/PageDoc/index.tsx`
- Automatically detect the current route (`useLocation()` or equivalent)
- Content can be fetched from a local object or JSON file (e.g., `pageDocs.ts`)
- Use **absolute import paths**

### ♻️ Reusability

- The component should be easily pluggable into `App.tsx` or `Layout.tsx`
- Allow lazy-loading the content for large apps
- Add a way to override or inject external markdown/docs if needed

````

---

## 💻 Sample `PageDoc` Component Code (TypeScript + Ant Design + i18n)

```tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { FloatButton, Drawer, Collapse } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pageDocs } from '@/docs/pageDocs';

const { Panel } = Collapse;

const PageDoc = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const path = location.pathname;
  const doc = pageDocs[path];

  return (
    <>
      <FloatButton
        icon={<FileTextOutlined />}
        onClick={() => setOpen(true)}
        tooltip={t('คู่มือการใช้งาน')}
        style={{ right: 24, bottom: 24 }}
      />

      <Drawer
        title={t('คู่มือสำหรับหน้านี้')}
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={400}
      >
        {doc ? (
          <Collapse defaultActiveKey={['overview']}>
            <Panel header={t('ภาพรวม')} key="overview">
              <p>{doc.overview}</p>
            </Panel>
            <Panel header={t('คำแนะนำการใช้งาน')} key="instruction">
              <p>{doc.instruction}</p>
            </Panel>
            <Panel header={t('ลำดับการทำงาน')} key="flow">
              <p>{doc.flow}</p>
            </Panel>
            <Panel header={t('ตรรกะธุรกิจ')} key="logic">
              <p>{doc.logic}</p>
            </Panel>
          </Collapse>
        ) : (
          <p>{t('ไม่มีคู่มือสำหรับหน้านี้')}</p>
        )}
      </Drawer>
    </>
  );
};

export default PageDoc;
````

---

## 🗂 Example `pageDocs.ts` (Thai Language)

```ts
// 💡 You may extend each section with visual references like:
// image: require('@/docs/visuals/users-flow.png')
export const pageDocs = {
  '/dashboard': {
    overview: 'แสดงภาพรวมของข้อมูลที่สำคัญและสถิติของระบบ',
    instruction: 'ใช้เมนูด้านซ้ายเพื่อเลือกดูข้อมูลรายวันหรือรายเดือน',
    flow: 'เข้าสู่ระบบ > โหลดข้อมูล > แสดงแผนภูมิ > คลิกเพื่อดูรายละเอียด',
    logic: 'ข้อมูลทั้งหมดจะถูกดึงตามจังหวัดของผู้ใช้ (user.province) และสิทธิ์การเข้าถึง (user.role)'
  },
  '/users': {
    overview: 'หน้าสำหรับจัดการผู้ใช้ในระบบ',
    instruction: 'ผู้ดูแลระบบสามารถเพิ่ม ลบ แก้ไขผู้ใช้ และกำหนดบทบาทและจังหวัดได้',
    flow: 'เข้าสู่ระบบ > ไปที่เมนูผู้ใช้ > กรองตามจังหวัด > แก้ไข/เพิ่มผู้ใช้',
    logic: 'Admin สามารถจัดการผู้ใช้ได้ทุกจังหวัด, Manager สามารถดู/จัดการเฉพาะผู้ใช้ในจังหวัดของตนเอง'
  },
  '/sales': {
    overview: 'ดูรายการขายและสร้างเอกสารขาย',
    instruction: 'สามารถสร้างใบเสนอราคา หรือออกใบกำกับภาษีจากรายการสินค้า',
    flow: 'เลือกสินค้าที่ต้องการ > กรอกข้อมูลลูกค้า > ออกเอกสาร > บันทึก',
    logic: 'ข้อมูลการขายจะถูกจำกัดการเข้าถึงตามจังหวัดของผู้ใช้'
  }
};
```

---

## ✅ Integration

- Import `<PageDoc />` inside your `App.tsx` or shared `Layout.tsx`
- Ensure `useTranslation()` is set up correctly with translations for all strings used
- Optional: support Markdown injection for advanced formatting

Place `<PageDoc />` in your layout or page component. The help button will float in the bottom-right corner.

## 🧩 Ready-to-Use Snippet (JSX/Markdown)

Below is a customizable JSX snippet you can use directly in your pages. It supports dark mode, theme styling, and auto-detects the current route:

```tsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FloatButton, Drawer, Collapse, ConfigProvider } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { pageDocs } from '@/docs/pageDocs';

const { Panel } = Collapse;

const PageDoc = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const path = location.pathname;
  const doc = pageDocs[path];

  return (
    <ConfigProvider
      theme={{
        algorithm: document.documentElement.classList.contains('dark')
          ? ConfigProvider.theme.darkAlgorithm
          : ConfigProvider.theme.defaultAlgorithm
      }}
    >
      <FloatButton
        icon={<FileTextOutlined />}
        onClick={() => setOpen(true)}
        tooltip={t('คู่มือการใช้งาน')}
        style={{ right: 24, bottom: 24 }}
      />
      <Drawer
        title={t('คู่มือสำหรับหน้านี้')}
        placement='right'
        onClose={() => setOpen(false)}
        open={open}
        width={400}
        bodyStyle={{ paddingBottom: 80 }}
      >
        {doc ? (
          <Collapse defaultActiveKey={['overview']}>
            <Panel header={t('ภาพรวม')} key='overview'>
              <p>{doc.overview}</p>
            </Panel>
            <Panel header={t('คำแนะนำการใช้งาน')} key='instruction'>
              <p>{doc.instruction}</p>
            </Panel>
            <Panel header={t('ลำดับการทำงาน')} key='flow'>
              <p>{doc.flow}</p>
            </Panel>
            <Panel header={t('ตรรกะธุรกิจ')} key='logic'>
              <p>{doc.logic}</p>
            </Panel>
          </Collapse>
        ) : (
          <p>{t('ไม่มีคู่มือสำหรับหน้านี้')}</p>
        )}
      </Drawer>
    </ConfigProvider>
  );
};

export default PageDoc;
```
