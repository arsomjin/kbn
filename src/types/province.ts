/**
 * Province interface for multi-province support
 * Represents a province (administrative region) in the system
 */
export interface Province {
  id: string;                // Unique identifier (using hyphens, e.g. 'nakhon-ratchasima') 
  code: string;              // Short province code (e.g., 'NMA')
  name: string;              // Province name in Thai (e.g., 'นครราชสีมา')
  nameEn: string;           // Province name in English (e.g., 'Nakhon Ratchasima')
  status: 'active' | 'inactive'; // Province active status
  region?: string;           // Geographical region (e.g., 'northeast')
  description?: string;      // Optional description 
  settings?: ProvinceConfig; // Province-specific configuration
  latitude?: number;        // Geographical latitude
  longitude?: number;       // Geographical longitude
  isActive?: boolean;       // Active status flag
  isDefault?: boolean;      // Whether this is the default province
  createdAt: number;         // Creation timestamp
  updatedAt: number;         // Last update timestamp
  inputBy?: string;         // User who created/last modified the province
}

/**
 * User's province access definition
 * Maps which provinces a user has access to and their roles
 */
export interface ProvinceAccess {
  provinceId: string;       // ID of the province
  role: string;            // User's role in this province
  permissions: string[];   // Specific permissions for this province
  isActive: boolean;       // Whether access is currently active
  assignedAt: number;      // When access was granted
  assignedBy?: string;     // Who granted this access
  expiresAt?: number;      // Optional expiration timestamp
}

/**
 * Province configuration for the application
 */
export interface ProvinceConfig {
  timezone: string;             // Province timezone
  language: string;             // Default language
  currency: string;             // Default currency
  dateFormat: string;           // Date format preference
  fiscalYearStart: number;      // Month when fiscal year starts (1-12)
  workingDays: number[];        // Array of working days (0-6, 0=Sunday)
  workingHours: {              // Working hours configuration
    start: string;             // Format: "HH:mm"
    end: string;               // Format: "HH:mm"
  };
  holidays?: {                  // Holiday configuration
    fixed: Array<{             // Fixed holidays (same date every year)
      month: number;           // 1-12
      day: number;            // 1-31
      name: string;           // Holiday name
    }>;
    variable: Array<{         // Variable holidays (need to be set each year)
      date: string;          // ISO date string
      name: string;          // Holiday name
    }>;
  };
  contactInfo?: {              // Province contact information
    address: string;          // Physical address
    phone: string;           // Contact phone number
    email: string;           // Contact email
  };
}
