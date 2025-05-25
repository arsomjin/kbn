import { SelectProps } from 'antd';

export interface Dealer {
  dealerId: string;
  dealerCode: string;
  dealerName: string;
  dealerPrefix?: string;
  dealerType?: string;
  dealerHeadOffice?: number;
  dealerTaxNumber?: string;
  dealerAddress?: string;
  dealerTambol?: string;
  dealerAmphoe?: string;
  dealerProvince?: string;
  dealerPostcode?: string;
  dealerBank?: string;
  dealerBankName?: string;
  dealerBankType?: string;
  dealerBankAccNo?: string;
  dealerLastName?: string;
  created?: number;
  inputBy?: string;
  updated?: number;
  updateBy?: string;
}

export interface DealerSelectorProps extends Omit<SelectProps, 'onChange'> {
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  noAddable?: boolean;
  allowNotInList?: boolean;
}

export interface DealerDetailsProps {
  onOk: (values: Dealer, type: 'add' | 'edit' | 'delete') => Promise<void>;
  onCancel: () => void;
  visible: boolean;
}
