import type { TranslationKeys } from 'hooks/useTranslationKeys';

export interface UserRoleEditorProps {
  userId: string;
  visible: boolean;
  onClose: () => void;
  afterSave?: () => void;
}

export interface TabItem {
  key: string;
  tab: string;
  content: React.ReactNode;
}

export interface UserRoleFormData {
  role: string;
  permissions: string[];
  provinces: string[];
}

export type ModalTranslations = TranslationKeys['modal'];
