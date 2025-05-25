export interface ThaiTambol {
  p: string; // province
  a: string; // amphoe
  d: string; // district
  z: number; // zipcode
}

export interface ThaiTambolData {
  provinces: ThaiTambol[];
  amphoes: ThaiTambol[];
  tambols: ThaiTambol[];
  postcodes: ThaiTambol[];
}
