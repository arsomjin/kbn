# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 🔔 Notification System

The KBN platform includes a comprehensive notification system for managing communications across different organizational levels.

### Accessing Notification Features

**Via Sidebar Menu:**
Look for the "Notifications" menu (📢 icon) in the sidebar, which includes:

1. **Send Notification** (Admin roles only)

   - Create and send notifications to specific recipients
   - Target by roles, users, branches, departments, or provinces
   - Choose delivery options (in-app, push notifications)

2. **View All Notifications**

   - Browse all notifications in a dedicated list view
   - Mark notifications as read/unread
   - Available to all authenticated users

3. **Notification Settings**
   - Configure personal notification preferences
   - Manage push notification settings
   - Set notification frequency and types

**Role-Based Access:**

- **Executive Level**: Full system access at `/admin/send-notification`
- **Province Level**: Province-specific access at `/{provinceId}/admin/send-notification`
- **Branch Level**: Branch-specific access at `/{provinceId}/{branchCode}/admin/send-notification`

**Quick Access:**

- Click the notification bell icon (🔔) in the header for recent notifications
- Use the notification drawer for quick viewing

For detailed guidance, see `docs/notification-access-guide.md`

---
