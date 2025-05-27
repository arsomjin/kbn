import moment from 'moment-timezone';
import { createArrOfLength, showWarning, showLog } from 'utils/functions';

const IMPORT_VEHICLES_FIELD_NAME = [
  'เลขที่เอกสาร',
  'วันที่คีย์',
  // 'เวลาคีย์',
  // 'ชื่อผู้ใช้',
  'รายการที่',
  'รหัสประเภท',
  'ประเภทรายการเคลื่อนไหว',
  'รหัสสินค้า',
  'ชื่อสินค้า',
  'รหัสสาขา',
  'สาขา',
  'รหัสสถานที่จัดเก็บ',
  'ชื่อสถานที่จัดเก็บ',
  'ยอดตั้งต้น',
  'รับเข้า',
  'จ่ายออก',
  'ยอดคงเหลือ',
  'หน่วย',
  // 'ใบสั่ง',
  // 'รายการ',
  // 'ข้อความส่วนหัวเอกสาร',
  'เลขใบจ่ายสินค้า SKC',
  'เอกสารซื้อ',
  'หมายเลขรถ',
  'เลขอุปกรณ์ต่อพ่วง',
  // 'รหัสสาขารับโอน',
  // 'ชื่อสาขาที่รับโอน',
  // 'รหัสสถานที่จัดเก็บที่รับโอน',
  // 'เลขเอกสารที่รับโอน',
  // 'วันที่เอกสาร',
  // 'วันที่ทำรายการ',
  // 'หมายเหตุ',
];

const IMPORT_PARTS_FIELD_NAME = [
  'เลขที่เอกสาร',
  'วันที่คีย์',
  // 'เวลาคีย์',
  // 'ชื่อผู้ใช้',
  'รายการที่',
  'รหัสประเภท',
  'ประเภทรายการเคลื่อนไหว',
  'รหัสสินค้า',
  'ชื่อสินค้า',
  'รหัสสาขา',
  'สาขา',
  'รหัสสถานที่จัดเก็บ',
  'ชื่อสถานที่จัดเก็บ',
  'จุดเก็บ',
  'ยอดตั้งต้น',
  'รับเข้า',
  'จ่ายออก',
  'ยอดคงเหลือ',
  'หน่วย',
  // 'ใบสั่ง',
  // 'รายการ',
  // 'ข้อความส่วนหัวเอกสาร',
  'เลขใบจ่ายสินค้า SKC',
  'เอกสารซื้อ',
  'เลขอุปกรณ์ต่อพ่วง',
  // 'รหัสสาขารับโอน',
  // 'ชื่อสาขาที่รับโอน',
  // 'รหัสสถานที่จัดเก็บที่รับโอน',
  // 'เลขเอกสารที่รับโอน',
  // 'วันที่เอกสาร',
  // 'วันที่ทำรายการ',
  // 'หมายเหตุ',
];

const IMPORT_PARTS_INCOME_FIELD_NAME = [
  'ลำดับ',
  'รหัสสาขา',
  'สาขาที่ขาย',
  'รหัสร้านค้า',
  'ร้านค้า',
  'ชื่อพนักงาน',
  'เลขที่ใบขาย',
  'เลขรถ',
  'เลขเครื่อง',
  'วันที่ขาย',
  'เลขใบแจ้งหนี้',
  'รายการ',
  'หมายเลขใบขาย POS',
  'เลขที่ใบกำกับภาษี',
  'สถานะยกเลิก',
  'ประเภทการขาย',
  'สถานที่เก็บ',
  'ชื่อสถานที่เก็บ',
  'รหัสสินค้า',
  'ชื่อสินค้า',
  'แหล่งที่มาลูกค้า',
  'การยินยอมให้ทำการตลาด',
  'คำนำหน้าชื่อ',
  'รหัสลูกค้า',
  'ชื่อ',
  'นามสกุล',
  'บ้านเลขที่ (บัตร)',
  'บ้าน/อาคาร (บัตร)',
  'ชั้น (บัตร)',
  'ห้อง (บัตร)',
  'หมู่บ้าน (บัตร)',
  'หมู่ที่ (บัตร)',
  'ซอย (บัตร)',
  'ถนน (บัตร)',
  'ตำบล (บัตร)',
  'อำเภอ (บัตร)',
  'จังหวัด (บัตร)',
  'รหัสไปรษณีย์ (บัตร)',
  'เบอร์โทรศัพท์บ้าน (บัตร)',
  'เบอร์โทรศัพท์มือถือ (บัตร)',
  'เงื่อนไขการชำระเงิน',
  'ประเภทสินค้า',
  'คำอธิบายประเภทสินค้า',
  'กลุ่มส่วนลด',
  'จำนวน',
  'หน่วย',
  'ราคาต่อหน่วย',
  'มูลค่าสุทธิรวม',
  // 'ส่วนลดคูปอง(%)',
  // 'ส่วนลดคูปอง(%) / บาท',
  'SKC 20% parts discount',
  'SKC - 20% parts discount Amount',
  'คะแนนที่ได้รับ',
  'คะแนนที่ใช้แลก',
  'SKC - Customer Loyalty Disc (%)',
  'SKC - Customer Loyalty Disc (Baht)',
  'SKC - Customer Loyalty Disc (Amt)',
  'ส่วนลดจากการใช้คะแนน',
  'ส่วนลด AD(%)',
  'ส่วนลด AD(%) / บาท',
  'ส่วนลด AD(จำนวน)',
  'ส่วนลด SKC(%)',
  'ส่วนลด SKC(%) / บาท',
  'ส่วนลด SKC(จำนวน)',
  'ส่วนลด SKC Manual (%)',
  'ส่วนลด SKC - Manual (%) / Baht',
  'ส่วนลด SKC Manual (จำนวน)',
  'ส่วนลดท้ายบิล (%)',
  'ส่วนลดท้ายบิล (%) / บาท',
  'ส่วนลดท้ายบิล (จำนวน)',
  'เงินจอง',
  'สุทธิหักเงินจอง',
  'หมายเหตุ',
];

const IMPORT_SERVICE_INCOME_FIELD_NAME = [
  'รหัสสาขา',
  'ชื่อสาขา',
  'ประเภทใบสั่ง',
  'คำอธิบายประเภทใบสั่ง',
  'เลขที่ใบสั่ง',
  'รายการ',
  'รหัสเหตุผลการสั่ง',
  'คำอธิบายเหตุผลการสั่ง',
  'วันที่เอกสาร',
  'ที่ปรึกษาลูกค้า',
  'ชื่อที่ปรึกษาลูกค้า',
  'ลูกค้า',
  'ชื่อลูกค้า',
  'เลขรถ',
  'เลขเครื่อง',
  'โมเดลรถ',
  'ชื่อสินค้า',
  'รุ่นรถ',
  'วันที่ขาย',
  'ชั่วโมงใช้งาน',
  'หน่วย',
  'มูลค่าต่อหน่วย',
  'ชื่อช่างบริการ',
  'วันที่ปิดงาน',
  'สถานะใบสั่ง',
  'คำอธิบายสถานะ',
  'รหัสค่าแรง/ค่าอะไหล่/ค่าบริการอื่นๆ',
  'ประเภทอะไหล่',
  'หมวดรายการ',
  'คำอธิบายหมวดรายการ',
  'คำอธิบาย',
  'จำนวน',
  'หน่วย',
  'หมวดการรับประกัน',
  'ราคาก่อนหักส่วนลด',
  'ราคาส่วนลดของ Dealer',
  'ราคาส่วนลดของ SKC',
  'ราคาสุทธิ',
  'รหัสสาเหตุ',
  'คำอธิบายรหัสสาเหตุ',
  'ชนิดส่วนลด',
];

const IMPORT_VEHICLES_LIST_FIELD_NAME = [
  'ลำดับ',
  'รหัส',
  'รายการสินค้า',
  'เครดิตเทอม',
  'ราคาขายส่ง',
  'ราคาขายปลีก',
  'ประเภทสินค้า',
  'หมายเหตุ',
];

const IMPORT_PARTS_LIST_FIELD_NAME = [
  'No',
  'Material no.',
  'Material name',
  'Model',
  'Div',
  'Group',
  'WSP no VAT',
  'WSP +VAT',
  ' SLP no VAT ',
  ' SLP +VAT ',
  ' Effective Date ',
];

const IMPORT_FINGERPRINT_FIELD_NAME = [
  'รหัสพนักงาน',
  'ชื่อ-นามสกุล',
  'แผนก',
  'Date',
  'จำนวนช่องตามจำนวนครั้งที่สแกน',
];

export const isDataValid = (arr, title) => {
  showLog({ arr, title });
  switch (title) {
    case 'รับรถและอุปกรณ์':
      return hasFields(arr, IMPORT_VEHICLES_FIELD_NAME);
    case 'รับอะไหล่':
      return hasFields(arr, IMPORT_PARTS_FIELD_NAME);
    case 'รายได้งานบริการ':
      return hasFields(arr, IMPORT_SERVICE_INCOME_FIELD_NAME);
    case 'รายได้ขายอะไหล่':
      return hasFields(arr, IMPORT_PARTS_INCOME_FIELD_NAME);
    case 'รายการรถและอุปกรณ์':
      return hasFields(arr, IMPORT_VEHICLES_LIST_FIELD_NAME);
    case 'รายการอะไหล่':
      return hasFields(arr, IMPORT_PARTS_LIST_FIELD_NAME);
    case 'การสแกนลายนิ้วมือ':
      return hasFields(arr, IMPORT_FINGERPRINT_FIELD_NAME, true);
    case 'ข้อมูลอื่นๆ':
      return true;
    default:
      return false;
  }
};

export const hasFields = (arr, fields, hasException) => {
  let fieldsException = ['จำนวนช่องตามจำนวนครั้งที่สแกน', 'A'];
  let nameException = hasException ? createArrOfLength(32).map((l) => l.toString()) : [];
  let checkFields = fields.filter((l) => !fieldsException.includes(l));
  const fArr = arr.filter((elem) => {
    let included = true;
    if (['รหัส', 'รหัสพนักงาน'].includes(elem.name) && checkFields.includes('ชื่อ-นามสกุล')) {
      included = [...checkFields, 'รหัส'].includes(elem.name.toString().trim());
    } else {
      included = checkFields.includes(elem.name.toString().trim());
    }
    return included && !nameException.includes(elem.name);
  });
  showLog({ arr, checkFields, fArr, nameException });
  if (fArr.length < checkFields.length) {
    arr.map((f) => {
      if (
        !checkFields.includes(f.name.toString().trim()) &&
        !['A', 'จำนวนช่องตามจำนวนครั้งที่สแกน', ...(hasException ? nameException : [])].includes(
          f.name.toString().trim(),
        )
      ) {
        //  showLog('ERROR_FIELD_NAME', f.name.toString());
        showWarning(`ชื่อคอลัมน์ ​"${f.name.toString()}" ไม่ตรงตามที่กำหนด!`);
      }
      return f;
    });
  }
  return fArr.length >= checkFields.length;
};

export const hasFields_bak = (arr, fields) => {
  const fArr = arr.filter((elem) => fields.includes(elem.name));
  showLog('fArr', fArr);
  if (fArr.length < fields.length) {
    arr.map((f) => {
      if (!fields.includes(f.name) && f.name.trim() !== 'A') {
        //  showLog('ERROR_FIELD_NAME', f.name);
        showWarning(`ชื่อคอลัมน์ ​"${f.name}" ไม่ตรงตามที่กำหนด!`);
      }
      return f;
    });
  }
  return fArr.length >= fields.length;
};

export const formatExcelImportArr = (excelData) => {
  showLog({ excelData });
  let result = [];
  for (var i = 0; i < excelData.rows.length; i++) {
    let it = [];
    for (var n = 0; n < excelData.rows[i].length; n++) {
      let val = excelData.rows[i][n] || '';
      if (val && !!excelData.cols[n + 1]?.name) {
        let cName = excelData.cols[n + 1].name.toString();
        if (cName.startsWith('วันที่') || cName.startsWith('เวลา')) {
          // val = toDate(val, cName.startsWith('เวลา'));
          // val = getJsDateFromExcel(val);
          val = parseDateExcel(val);
          val = cName.startsWith('วันที่')
            ? moment.tz(val, 'Asia/Bangkok').format('DD/MM/YYYY')
            : moment.tz(val, 'Asia/Bangkok').format('HH:mm:ss');
        }
      }
      it[n] = val;
    }
    if (it.length > 0) {
      result.push(it);
    }
  }
  // showLog('offset', new Date(0).getTimezoneOffset());

  return result;
};

export const parseDateExcel = (excelTimestamp) => {
  const secondsInDay = 24 * 60 * 60;
  const excelEpoch = new Date(1899, 11, 31);
  const excelEpochAsUnixTimestamp = excelEpoch.getTime();
  const missingLeapYearDay = secondsInDay * 1000;
  const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
  const excelTimestampAsUnixTimestamp = excelTimestamp * secondsInDay * 1000;
  const parsed = excelTimestampAsUnixTimestamp + delta;
  return isNaN(parsed) ? null : parsed;
};

export const getColNameFromTitle = (title) => {
  switch (title) {
    case 'รับรถและอุปกรณ์':
      return IMPORT_VEHICLES_FIELD_NAME;
    case 'รับอะไหล่':
      return IMPORT_PARTS_FIELD_NAME;
    case 'รายได้ขายอะไหล่':
      return IMPORT_PARTS_INCOME_FIELD_NAME;
    case 'รายได้งานบริการ':
      return IMPORT_SERVICE_INCOME_FIELD_NAME;
    case 'รายการรถและอุปกรณ์':
      return IMPORT_VEHICLES_LIST_FIELD_NAME;
    case 'รายการอะไหล่':
      return IMPORT_SERVICE_INCOME_FIELD_NAME;
    case 'การสแกนลายนิ้วมือ':
      return IMPORT_FINGERPRINT_FIELD_NAME;

    default:
      return IMPORT_PARTS_LIST_FIELD_NAME;
  }
};
