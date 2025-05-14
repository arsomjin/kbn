export const BRANCHES = [
  { code: '0456', nameEn: 'Nakhon Ratchasima Branch', nameTh: 'สาขานครราชสีมา' },
  // Add more branches here as needed
];

export function getBranchName(code: string, lang: 'en' | 'th' = 'en'): string {
  const branch = BRANCHES.find(b => b.code === code);
  if (!branch) return code;
  return lang === 'th' ? branch.nameTh : branch.nameEn;
} 