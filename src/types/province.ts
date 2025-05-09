/**
 * Province interface for multi-province support
 * Represents a province (administrative region) in the system
 */
export interface Province {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  country?: string;
  isActive: boolean;
  timezone?: string;
  metadata?: Record<string, any>;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * User's province access definition
 * Maps which provinces a user has access to
 */
export interface ProvinceAccess {
  [provinceId: string]: boolean;
}

/**
 * Branch location interface with province reference
 */
export interface Branch {
  id: string;
  code: string;
  name: string;
  provinceId: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  isActive: boolean;
  metadata?: Record<string, any>;
}

/**
 * Province configuration for the application
 */
export interface ProvinceConfig {
  /**
   * Default currency code for the province
   */
  currencyCode?: string;

  /**
   * Default language for the province
   */
  language?: string;

  /**
   * Default timezone for the province
   */
  timezone?: string;

  /**
   * Province-specific settings
   */
  settings?: Record<string, any>;
}
