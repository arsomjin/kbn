/**
 * Branch interface with multi-province support
 */
export interface Branch {
  id: string;
  name: string;
  nameEn: string;
  branchCode: string;
  provinceId: string;
  branchName?: string; // Thai branch name, for compatibility with Firestore data
  address?: {
    address: string;
    moo?: string;
    village?: string;
    province: string;
    amphoe: string;
    tambol: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
  };
  contact?: {
    tel?: string;
    fax?: string;
    email?: string;
    website?: string;
  };
  status: 'active' | 'inactive' | 'pending' | 'closed';
  manager?: string; // User ID of branch manager
  created: number;
  updated?: number;
  inputBy?: string;
  deleted?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Form data for creating/updating a branch
 */
export interface BranchFormData {
  name: string;
  nameEn: string;
  branchCode: string;
  branchName?: string; // Thai branch name, for compatibility with Firestore data
  address?: {
    address: string;
    moo?: string;
    village?: string;
    province: string;
    amphoe: string;
    tambol: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
  };
  contact?: {
    tel?: string;
    fax?: string;
    email?: string;
    website?: string;
  };
  status: 'active' | 'inactive' | 'pending' | 'closed';
  manager?: string;
  metadata?: Record<string, any>;
}
