export interface BookingLicenceItem {
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface BookingLicenceData {
  bookingNo: string;
  bookingDate: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: BookingLicenceItem[];
  total: number;
  vat: number;
  grandTotal: number;
}

export interface BookingLicenceProps {
  data: BookingLicenceData;
  className?: string;
  onBeforePrint?: () => Promise<boolean> | boolean;
}

export interface BookingLicenceConstants {
  VAT_RATE: number;
  CURRENCY: string;
  COMPANY_NAME: string;
  COMPANY_ADDRESS: string;
  COMPANY_PHONE: string;
  COMPANY_EMAIL: string;
}
