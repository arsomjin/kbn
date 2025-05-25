import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { useModalTranslations } from 'hooks/useTranslationKeys';
import type { UserRoleEditorProps, TabItem, UserRoleFormData } from './UserRoleEditor.types';

/**
 * UserRoleEditor component for managing user roles, permissions, and province access
 */
export const UserRoleEditor: React.FC<UserRoleEditorProps> = ({ userId, visible, onClose, afterSave }) => {
  const { t } = useTranslation();
  const modalT = useModalTranslations();
  const [activeTab, setActiveTab] = useState<string>('role');
  const [formData, setFormData] = useState<UserRoleFormData>({
    role: '',
    permissions: [],
    provinces: []
  });

  const handleSave = async () => {
    try {
      // TODO: Implement save logic
      afterSave?.();
      onClose();
    } catch (error) {
      console.error('Failed to save user role:', error);
      // Handle error
    }
  };

  const tabs: TabItem[] = [
    {
      key: 'role',
      tab: modalT.modal.tabs.role,
      content: <div>Role Tab Content</div>
    },
    {
      key: 'permissions',
      tab: modalT.modal.tabs.permissions,
      content: <div>Permissions Tab Content</div>
    },
    {
      key: 'provinces',
      tab: modalT.modal.tabs.provinces,
      content: <div>Provinces Tab Content</div>
    },
    {
      key: 'summary',
      tab: modalT.modal.tabs.summary,
      content: <div>Summary Tab Content</div>
    }
  ];

  return (
    <Modal title={t('userRoleEditor.title')} open={visible} onCancel={onClose} onOk={handleSave} width={800}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabs.map(({ key, tab, content }) => ({
          key,
          label: tab,
          children: content
        }))}
      />
    </Modal>
  );
};

export default UserRoleEditor;
