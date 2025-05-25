const systemOverviewEn = {
  overview: (
    <>
      <h2 style={{ color: '#2d4739', marginBottom: 8 }}>🚀 KBN Platform – System Overview</h2>
      <p>
        <b>KBN</b> is a role-based, permission-driven platform for managing users, branches, provinces, and business
        operations. This document provides a quick understanding of how access, roles, and permissions work in the
        system.
      </p>
    </>
  ),
  instruction: (
    <>
      <h2 style={{ color: '#2d4739', marginBottom: 8 }}>🔑 Key Concepts</h2>
      <ul>
        <li>
          <b>Role-Based Access Control (RBAC):</b> Every user is assigned a <b>role</b> (e.g., User, Manager, Admin,
          Super Admin, Developer) that determines their default permissions.
        </li>
        <li>
          <b>Permissions:</b> Permissions (e.g., VIEW_SALES, MANAGE_EXPENSE) control access to features and data. Roles
          come with a default set of permissions.
        </li>
        <li>
          <b>Custom Permissions:</b> Admins can grant extra permissions to specific users, allowing for exceptions
          (e.g., an accountant with access to sales data).
        </li>
        <li>
          <b>Province/Branch/Department Access:</b> Data and actions can be limited by province, branch, or department.
          Users only see and manage data for their assigned areas, unless their role grants broader access.
        </li>
        <li>
          <b>Super Admin & Developer:</b> These roles have full access to all features and data. Nothing is hidden from
          them.
        </li>
        <li>
          <b>Audit & Security:</b> All changes (e.g., edits, deletions) are logged with user and timestamp for
          accountability.
        </li>
      </ul>
    </>
  ),
  flow: (
    <>
      <h2 style={{ color: '#2d4739', marginBottom: 8 }}>🧭 How Access is Checked</h2>
      <ol>
        <li>
          When you try to access a page or feature, the system checks your <b>role</b> and <b>permissions</b>.
        </li>
        <li>If you have the required permission (either from your role or custom permissions), you can proceed.</li>
        <li>
          If the feature is province/branch/department-limited, the system checks if you have access to that area.
        </li>
        <li>
          If you lack access, you'll see an <b>Access Denied</b> message.
        </li>
      </ol>
    </>
  ),
  logic: (
    <>
      <h2 style={{ color: '#2d4739', marginBottom: 8 }}>💡 Practical Examples</h2>
      <ul>
        <li>
          <b>Custom Access:</b> An accountant can be given sales permissions by an admin, even if their main role
          doesn't include it.
        </li>
        <li>
          <b>Province-Limited:</b> A branch manager only sees and manages data for their branch/province.
        </li>
        <li>
          <b>Super Admin/Developer:</b> Always have full access, no restrictions.
        </li>
        <li>
          <b>Audit Trail:</b> All important actions are logged for security and traceability.
        </li>
      </ul>
      <div style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
        <b>Need help?</b> Contact your system administrator or support team.
      </div>
    </>
  )
};

export default systemOverviewEn;
