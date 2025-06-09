const {format, parse, addDays} = require("date-fns");
const _ = require("lodash");

const VehicleHeaders = [
  "แทรกเตอร์",
  "เหล็กถ่วงล้อหลัง",
  "รถเกี่ยวนวดข้าว",
  "เครื่องโรยกล้ามือเข็น",
  "รถขุด",
  "รถดำนาเดินตาม 4 แถว",
  "รถดำนาเดินตาม 6 แถว",
  "รถดำนาเดินตาม",
  "รถดำนานั่งขับ 6 แถว ",
  "รถดำนานั่งขับ 8 แถว ",
  "รถตักล้อยาง",
  "รถหยอดข้าวพร้อมชุดฉีดพ่นยา",
  "รถหยอดข้าวพร้อมชุดฉีดพ่น",
  "รถหยอดข้าว",
  "รถปลูกผัก",
  "ชุดหัวบิดฝักข้าวโพด",
  "เหล็กถ่วงหน้า",
  "เหล็กถ่วงตัวแม่",
  "Breaker",
  "จอบหมุน",
  "ชุดเก็บเกี่ยวถั่วเหลือง",
  "ชุดเก็บเกี่ยวข้าวโพด",
  "ตะแกรงสำหรับชุดเก็บเกี่ยวถั่ว",
  "เครื่องโรยกล้ากึ่งอัตโนมัติ",
  "ผานบุกเบิก",
  "ผานพรวน",
  "ชุดใบมีดดันดินหน้าพิเศษ",
  "ชุดใบมีดดันดินหน้า",
  "ชุดงา",
  "ใบมีดสำหรับบุ้งกี๋",
  "ปากบุ้งกี๋มาตรฐาน",
  "ปากบุ้งกี๋เกษตรการ์ด",
  "ชุดบุ้งกี๋",
  "ชุดโครงกันอ้อย",
  "เครื่องปลูกอ้อยแบบท่อน",
  "เครื่องปลูกอ้อย",
  "เครื่องฝังปุ๋ย",
  "เครื่องหว่านปุ๋ย",
  "เครื่องปลูกมันสำปะหลังถังปุ๋ย",
  "เครื่องปลูกมันสำปะหลัง",
  "เครื่องตัดหญ้า",
  "เครื่องเจาะหลุม",
  "เครื่องไถระเบิดดินดานแบบสั่นสะเทือน",
  "เครื่องไถระเบิดดินดาน",
  "เครื่องหยอดเมล็ดเอนกประสงค์",
  "เครื่องหยอดข้าวพร้อมชุดฉีดพ่น",
  "เครื่องหยอดข้าว",
  "เครื่องขุดมันสำปะหลัง (ไม่มีกระบะ)",
  "เครื่องตัดต้นมันสำปะหลัง",
  "เครื่องขุดมันสำปะหลัง",
  "ชุดคีบอ้อย",
  "เครื่องตัดอ้อย",
  "เครื่องสางใบอ้อยพร้อมการ์ด",
  "เครื่องสางใบอ้อย",
  "ผานสับใบ",
  "เครื่องอัดฟาง",
  "ถาดเพาะกล้า",
  "เครื่องโรยกล้ามือเข็น",
  "ล้อเหล็ก",
  "จอบหมุนแนวตั้ง",
  "เครื่องพ่นเอนกประสงค์",
  "โดรนการเกษตร",
  "โดรน",
  "ขลุบหมุน",
  "เครื่องยนต์",
  "Front Guard",
  "Breaker",
  "Ford",
  "Iseki",
  "John Deere",
  "New Holland",
  "Yanmar",
  "Quick Coupler",
  "Compactor",
  "K-D1 package A",
  "K-D1 package B",
  "Auger AT3500",
  "T20",
  "KIT SET",
  "Aux Control Valve",
];
const VehicleFilters = [
  "โดรนการเกษตร",
  "โดรน",
  "หลังคา",
  "มือเข็น",
  "เหล็กถ่วง",
  "มันสำปะหลัง",
  "เดินตาม 4 แถว",
  "เดินตาม 6 แถว",
  "ตัวแม่",
  "2.1 เมตร",
  "2.4 เมตร",
  "ดำนา",
  "จอบหมุน",
  "ถั่วเหลือง",
  "ข้าวโพด",
  "อัตโนมัติ",
  "ดันดินหน้า",
  "เกี่ยวนวดข้าว",
  "นั่งขับ",
  "ตัดหญ้า",
  "ระเบิดดินดาน",
  "แบบท่อน",
  "พ่นยา",
  "หัวบิดฝัก",
  "ขลุบหมุน",
  "ดินแห้ง",
  "รถ",
  "แทรกเตอร์",
  "ใบมีด",
  "บุ้งกี๋",
  "ตักยาง",
  "ติด",
  "ขุด",
  "ชุด",
  "เครื่อง",
  "เกี่ยว",
  "เก็บ",
  "นวด",
  "ข้าว",
  "โรย",
  "กล้า",
  "พร้อม",
  "หน้า",
  "ล้อ",
  "หลัง",
  "คีบ",
  "โครง",
  "กัน",
  "ตัด",
  "เกษตร",
  "การ์ด",
  "ถั่ว",
  "อ้อย",
  "ตะแกรง",
  "สำหรับ",
  "กึ่ง",
  "ผาน",
  "บุกเบิก",
  "พิเศษ",
  "งา",
  "พรวน",
  "ปาก",
  "มาตรฐาน",
  "ปลูก",
  "ฝัง",
  "ปุ๋ย",
  "หว่าน",
  "เอนกประสงค์",
  "ถัง",
  "เจาะ",
  "หลุม",
  "ไถ",
  "หยอด",
  "เมล็ด",
  "สับ",
  "สาง",
  "ใบ",
  "อัด",
  "ฟาง",
  "ผัก",
  "ยนต์",
  "ดันดิน",
  "หญ้า",
  "โพด",
  "เดินตาม",
  "4 แถว",
  "6 แถว",
  "8 แถว",
  "ฉีด",
  "พ่น",
  "เหล็ก",
  "ต้น",
];

const VehicleNameKeywords = ["แทรกเตอร์", "รถเกี่ยว", "รถขุด", "รถตัก", "โดรน"];

const hasToParse = (fieldName) =>
  [
    "phoneNumber",
    "mobileNumber",
    "mobilePhoneNumber",
    "accNo",
    "bankAccNo",
    "discountCoupon",
    "discountPointRedeem",
    "SKCDiscount",
    "SKCManualDiscount",
    "AD_Discount",
    "netTotal",
    "amtOilType",
    "amtPartType",
  ].includes(fieldName);

exports.parser = (value) => _parser(value);

const _parser = (value) => {
  if (!value || typeof value !== "string") return value;
  return value.replace(/[\r\n\s\-,฿,]+/g, "");
};

exports.cleanValuesBeforeSave = (values, skipDate) => {
  // Check undefined and replace to null,
  // Format date.
  if (typeof values !== "object" || !values) {
    return values;
  }
  let mValues = { ...values };
  Object.keys(values).forEach((k) => {
    if (typeof values[k] === "undefined") {
      mValues[k] = null;
    }
    if (!mValues[k]) {
      // No further processing if falsy.
      return;
    }
    if (
      !skipDate &&
      k.length >= 4 &&
      (k.substr(-4) === "Date" || k === "date") &&
      !!values[k]
    ) {
      mValues[k] = format(new Date(values[k]), "yyyy-MM-dd");
    }
    if (Array.isArray(values[k])) {
      mValues[k] = cleanArrayOfObject(values[k], skipDate);
    } else if (typeof mValues[k] === "object") {
      mValues[k] = cleanObject(mValues[k]);
    }
    if (hasToParse(k) && ["number", "string"].includes(typeof mValues[k])) {
      mValues[k] = _parser(values[k]);
    }
    if (typeof mValues[k] === "string" && mValues[k].startsWith(",")) {
      mValues[k] = mValues[k].substr(1);
    }
  });
  return mValues;
};

const cleanArrayOfObject = (arr, skipDate) => {
  let result = [];
  let fArr = arr.filter((l) => !!l);
  for (let i = 0; i < fArr.length; i++) {
    if (fArr[i]) {
      result[i] =
        typeof fArr[i] === "object" ? cleanObject(fArr[i], skipDate) : fArr[i];
    }
  }
  return result;
};

const cleanObject = (obj, skipDate) => {
  let mObj = { ...obj };
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === "undefined") {
      mObj[k] = null;
    }
    if (!mObj[k]) {
      return;
    }
    if (
      !skipDate &&
      k.length >= 4 &&
      (k.substr(-4) === "Date" || k === "date")
    ) {
      mObj[k] = format(new Date(obj[k]), "yyyy-MM-dd");
    }
    if (hasToParse(k) && ["number", "string"].includes(typeof mObj[k])) {
      mObj[k] = _parser(obj[k]);
    }
    if (Array.isArray(obj[k])) {
      mObj[k] = obj[k];
    }
    if (typeof mObj[k] === "string" && mObj[k].startsWith(",")) {
      mObj[k] = obj[k].substr(1);
    }
  });
  return mObj;
};

const isObject = (object) => {
  return object != null && typeof object === "object";
};

exports.deepEqual = (object1, object2) => _deepEqual(object1, object2);

const _deepEqual = (object1, object2) => {
  if (typeof object1 !== "object" || object1 === null || typeof object2 !== "object" || object2 === null) {
    return object1 === object2;
  }
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => {
    const val1 = object1[key], val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    return areObjects ? _deepEqual(val1, val2) : val1 === val2;
  });
};

const getDetailFromAnomalyAssessment = (assessment) => {
  if (!assessment || typeof assessment !== "object") {
    return null;
  }
  let result = null;
  Object.keys(assessment).map((k) => {
    if (!["result", "date", "reason", "editedBy"].includes(k)) {
      result = assessment[k];
    }
  });
  return result;
};

exports.formatAssessmentData = (snap) => {
  let assessment = snap?.assessment || {
    date: null,
    details: null,
    result: null,
  };
  const {
    bookId,
    bookNo,
    bookNo_lower,
    bookNo_partial,
    bookingPerson,
    branchCode,
    customerId,
    prefix,
    firstName,
    firstName_lower,
    firstName_partial,
    lastName,
    phoneNumber,
    items,
    saleType,
    salesPerson,
    sourceOfData,
  } = snap;

  let assessmentDetails = assessment?.details || null;
  if (!!assessment?.date && !assessment.details) {
    // Anomaly.
    assessmentDetails = getDetailFromAnomalyAssessment(assessment);
  }

  let doc = {
    bookId,
    bookNo,
    bookNo_lower,
    bookNo_partial,
    assessment,
    bookingPerson,
    branchCode,
    customerId,
    prefix,
    firstName,
    firstName_lower,
    firstName_partial,
    lastName,
    phoneNumber,
    items,
    saleType,
    salesPerson,
    sourceOfData,
    assessmentDate: assessment?.date || null,
    assessmentMonth: assessment?.date
      ? format(parse(assessment.date, "yyyy-MM-dd", new Date()), "yyyy-MM")
      : null,
    assessmentYear: assessment?.date
      ? format(parse(assessment.date, "yyyy-MM-dd", new Date()), "yyyy")
      : null,
    assessmentResult:
      typeof assessment?.result !== "undefined" ? assessment.result : null,
    assessmentDetails,
  };
  return doc;
};

exports.arrayForEach = async (array, callback) => {
  /* eslint-disable no-await-in-loop */
  /* eslint-disable callback-return */
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
  /* eslint-enable no-await-in-loop */
  /* eslint-enable callback-return */
};

exports.addSearchFields = (values, fields) => {
  if (!values || !(fields && Array.isArray(fields))) {
    return values;
  }
  let mValues = { ...values };
  fields.map((field) => {
    if (values[field]) {
      mValues[`${field}_lower`] = values[field].toLowerCase();
      mValues[`${field}_partial`] = _partialText(values[field]);
    }
    return field;
  });
  return mValues;
};

exports.createKeywords = (name) => _createKeywords(name);

const _createKeywords = (name) => {
  return name.split("").reduce((acc, letter) => {
    return acc.concat(acc.length ? acc[acc.length - 1] + letter : letter);
  }, []);
};

exports.cleanKeywordsArr = (arr) => _cleanKeywordsArr(arr);

const _cleanKeywordsArr = (arr) => {
  let cArr = [];
  arr.map((l) => {
    if (!l) {
      return l;
    }
    if (!["-", "+"].includes(l)) {
      cArr.push(l.replace("(", "").replace(")", ""));
    }
    let words = [
      "บุ้งกี๋",
      "เหล็กถ่วง",
      "เก็บเกี่ยว",
      "ข้าวโพด",
      "ถั่วเหลือง",
      "มันสำปะหลัง",
      "อ้อย",
      "ใบมีด",
      "เครื่องปลูก",
      "เครื่องพ่น",
      "เครื่องฝัง",
      "ตัดหญ้า",
      "เจาะหลุม",
      "ระเบิดดิน",
      "หยอด",
      "หยอดเมล็ด",
      "หยอดข้าว",
      "เกี่ยวข้าว",
      "นวดข้าว",
      "ตู้แอร์",
      "ดินแห้ง",
      "ฟาง",
      "กล้า",
      "ดำนา",
      "ล้อเหล็ก",
      "ปลูกอ้อย",
    ];
    words.map((w) => {
      if (l.search(w) > -1) {
        cArr.push(w);
      }
      return w;
    });
    return l;
  });

  let kArr = [];
  cArr.map((l) => {
    let kwArr = _createKeywords(l);
    kArr = kArr.concat(kwArr);
    return l;
  });
  return _.uniq(kArr);
};

exports.createProductKeywords = (val) => {
  const { name, productCode } = val;
  let arrName = name.toLowerCase().split(" ");
  let arrProductCode = productCode.toLowerCase().split(" ");
  let allArray = arrName.concat(arrProductCode);
  allArray.forEach((sName, i) => {
    if (sName.search(" - ") > -1) {
      let arr2 = sName.split(" - ");
      allArray = allArray.concat(arr2);
    }
    if (sName.search(" + ") > -1) {
      let arr3 = sName.split(" + ");
      allArray = allArray.concat(arr3);
    }
    if (sName.search("/") > -1) {
      let arr4 = sName.split("/");
      allArray = allArray.concat(arr4);
    }
  });
  return _cleanKeywordsArr(allArray);
};

exports.partialText = (txt) => _partialText(txt);

const _partialText = (txt) => {
  let str = txt.toString();
  const parts = str.split(" ");
  if (parts.length > 1) {
    parts.shift();
    return parts.join(" ").toLowerCase();
  } else {
    return str.toLowerCase();
  }
};

exports.extractLastNumbers = (str, length) => _extractLastNumbers(str, length);

const _extractLastNumbers = (str, length) => {
  const onlyNumbers = str.replace(/\D/g, "");
  return onlyNumbers.substring(onlyNumbers.length - length);
};

exports.extractVehicleNo = (str) => {
  if (typeof str !== "string") {
    return str;
  }
  let result = _extractLastNumbers(str, 5);
  result = result.toLowerCase();
  return result;
};

exports.extractPeripheralNo = (str) => {
  if (typeof str !== "string") {
    return str;
  }
  let result = str;
  let kIndex = str.lastIndexOf("-");
  if (kIndex > -1) {
    result = str.substring(kIndex + 1);
  } else {
    result = _parser(_extractLastNumbers(str, 7));
  }
  return result.toLowerCase();
};

exports.extractPeripheralModel = (str) => {
  if (typeof str !== "string") {
    return str;
  }
  let result = str;
  let kIndex = str.lastIndexOf("-");
  if (kIndex > -1) {
    result = str.substring(0, kIndex);
  } else {
    result = _parser(str.substring(0, 6));
  }
  return result;
};

exports.createVehicleNoKeyWords = (str) => {
  if (typeof str !== "string") {
    return str;
  }
  let kArr = [];
  let words = _extractLastNumbers(str, 5);
  [str.toLowerCase(), words.toLowerCase()].map((l) => {
    let kwArr = _createKeywords(l);
    kArr = kArr.concat(kwArr);
    return l;
  });
  return _.uniq(kArr);
};

exports.createPeripheralNoKeyWords = (str) => {
  if (typeof str !== "string") {
    return str;
  }
  let words = str;
  let kIndex = str.lastIndexOf("-");
  if (kIndex > -1) {
    words = str.substring(kIndex + 1);
  } else {
    words = _parser(_extractLastNumbers(str, 7));
  }
  let kArr = [];
  [str.toLowerCase(), words.toLowerCase()].map((l) => {
    let kwArr = _createKeywords(l);
    kArr = kArr.concat(kwArr);
    return l;
  });
  return _.uniq(kArr);
};

exports.removeAllNonAlphaNumericCharacters = (str) => {
  if (!str || !["string", "number"].includes(typeof str)) {
    return str;
  }

  const replaced = str.toString().replace(/[^a-z0-9]/gi, "");
  return replaced.toLowerCase();
};

exports.getExtraSaleSnap = (items) => {
  if (!Array.isArray(items)) {
    return {};
  }
  let allItems = (items || []).map((it) => {
    let vehicleArr = this.convertToArray(it.vehicleNo);
    let peripheralArr = this.convertToArray(it.peripheralNo);
    let engineArr = this.convertToArray(it.engineNo);
    let isVehicle = it?.productName
      ? this.checkIsVehicleFromName(it.productName)
      : vehicleArr.length > 0;
    let modelName =
      isVehicle || !!it.productName
        ? this.getModelFromName(it.productName)
        : peripheralArr[0]
          ? this.extractPeripheralModel(peripheralArr[0])
          : "";
    return {
      model: modelName,
      productCode: it.productCode || null,
      productName: it.productName || null,
      vehicleNo: vehicleArr,
      peripheralNo: peripheralArr,
      engineNo: engineArr,
      qty: it.qty || null,
      unitPrice: it.unitPrice || null,
      total: it.total || null,
      isVehicle,
    };
  });

  let vehicleNo = [];
  let peripheralNo = [];
  let engineNo = [];
  let model = [];

  allItems.map((l) => {
    if (l?.model) {
      model.push(l.model);
    }
    if (!!l?.vehicleNo && l.vehicleNo.length > 0) {
      vehicleNo = vehicleNo.concat(l.vehicleNo);
    }
    if (!!l?.peripheralNo && l.peripheralNo.length > 0) {
      peripheralNo = peripheralNo.concat(l.peripheralNo);
    }
    if (!!l?.engineNo && l.engineNo.length > 0) {
      engineNo = engineNo.concat(l.engineNo);
    }
    return l;
  });
  return {
    vehicles: allItems.filter((l) => l.isVehicle),
    peripherals: allItems.filter((l) => !l.isVehicle),
    model: model === [""] ? [] : model,
    vehicleNo: vehicleNo === [""] ? [] : vehicleNo,
    peripheralNo: peripheralNo === [""] ? [] : peripheralNo,
    engineNo: engineNo === [""] ? [] : engineNo,
  };
};

exports.getVehicleHeader = (pName) => {
  // Extract vehicle header from product name.
  if (typeof pName !== "string") {
    return null;
  }
  let arr = [];
  VehicleHeaders.map((l) => {
    if (pName.search(l) > -1) {
      arr.push(l);
    }
    return l;
  });
  return arr.length > 0 ? arr[0] : null;
};

const removeDoubleSpaces = (txt) => {
  if (!txt || !["number", "string"].includes(typeof txt)) {
    return txt;
  }
  let str = txt.toString();
  return str.replace(/  +/g, " ");
};

exports.getModelFromName = (pName) => {
  // Extract vehicle header from product name.
  if (typeof pName !== "string") {
    return null;
  }
  let fName = pName;
  VehicleFilters.map((l) => {
    if (pName.search(l) > -1) {
      fName = fName.replace(new RegExp(l, "g"), "").trim();
    }
    return l;
  });
  fName = removeDoubleSpaces(fName);
  if (fName.startsWith("+") || fName.startsWith("-")) {
    fName = fName.substring(1).trim();
  }
  return removeDoubleSpaces(fName);
};

exports.getCollection = async (firestore, checkCollection, wheres = [], orderBy = null, limit = null) => {
  try {
    let checkRef = checkCollection.split("/").reduce((ref, txt, index) =>
      index % 2 === 0 ? ref.collection(txt) : ref.doc(txt), firestore);

    wheres.forEach(([field, op, value]) => {
      checkRef = checkRef.where(field, op, value);
    });

    if (orderBy) {
      checkRef = checkRef.orderBy(orderBy);
    }

    if (limit) {
      checkRef = checkRef.limit(limit);
    }

    const cSnap = await checkRef.get();
    return !cSnap.empty ? cSnap : false;
  } catch (e) {
    console.error("Error fetching collection:", e);
    throw e;
  }
};

exports.getDoc = async (firestore, checkCollection, checkDoc) => {
  try {
    let checkRef = checkDoc.split("/").reduce(
      (ref, txt, index) =>
        index % 2 === 0 ? ref.doc(txt) : ref.collection(txt),
      firestore.collection(checkCollection)
    );

    const doc = await checkRef.get();
    console.log("doc", doc.exists ? doc.data() : "Document does not exist");
    return doc.exists ? doc : false;
  } catch (e) {
    console.error("Error fetching document:", e);
    throw e;
  }
};

exports.updateOtherCollection = async (updateRef, updateObj, where = null) => {
  try {
    const vSnap = where
      ? await updateRef.where(where[0], where[1], where[2]).get()
      : await updateRef.get();

    if (vSnap.empty) {
      return false;
    }

    const vItem = vSnap.docs[0]; // Get the first document
    if (!vItem.exists) {
      return false;
    }

    await updateRef.doc(vItem.id).update(updateObj);
    return true;
  } catch (e) {
    console.error("Error updating collection:", e);
    throw e;
  }
};

exports.createNewId = (suffix = "KBN-ACC-INC") => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000));
  const padLastNo = ("0".repeat(3) + lastNo).slice(-5);
  const orderId = `${suffix}${format(new Date(), "yyyyMMdd")}${padLastNo}`;
  return orderId;
};

exports.convertToArray = (elem) => {
  let result = elem ? (Array.isArray(elem) ? elem : elem.split(",")) : [];
  return result;
};

exports.checkIsVehicleFromName = (name) => {
  return VehicleNameKeywords.some(
    (kw) => name.indexOf(kw) > -1 && name.indexOf(kw) < 4
  );
};

const isAlphaNumeric = (inputtxt) => {
  if (!inputtxt || !["number", "string"].includes(typeof inputtxt)) {
    return false;
  }
  let letterNumber = /^[0-9a-zA-Z]+$/;
  return inputtxt.toString().match(letterNumber);
};

exports.cleanIdentityNumber = (str) => {
  // Remove non-alphanumeric from before and after.
  if (!str || !["number", "string"].includes(typeof str)) {
    return str;
  }
  let result = str.trim();
  let before = result.substring(0, 1);
  let middle = result.substring(1, result.length - 1);
  let after = result.substring(result.length - 1, result.length);
  while (!(isAlphaNumeric(before) && isAlphaNumeric(after))) {
    before = result.substring(0, 1);
    middle = result.substring(1, result.length - 1);
    after = result.substring(result.length - 1, result.length);
    console.log({ result, before, middle, after });
    result = `${before.replace(/[^a-z0-9]/gi, "")}${middle}${after.replace(
      /[^a-z0-9]/gi,
      ""
    )}`;
  }
  return result;
};

exports.cleanIdentityArray = (arr) => {
  // Remove non-alphanumeric from element in array.
  if (!arr || !Array.isArray(arr)) {
    return [];
  }
  const cleaned = arr.map((l) => exports.cleanIdentityNumber(l));
  return cleaned;
};

const findLastLetterIndex = (str) => {
  if (!str) {
    return -1;
  }
  let onlyChars = str.replace(/[^a-z]/gi, "");
  let lastLetter = onlyChars.substring(onlyChars.length - 1);
  return str.lastIndexOf(lastLetter);
};

exports.extractNumbersFromLastLetter = (str) => {
  if (!str) {
    return str;
  }
  const replaced = this.removeAllNonAlphaNumericCharacters(str);
  let lastLetterIndex = findLastLetterIndex(replaced);
  return replaced.substring(lastLetterIndex + 1);
};

exports.createBillNoSKCKeywords = (str) => {
  if (!str) {
    return str;
  }
  let word1 = this.removeAllNonAlphaNumericCharacters(str);
  let word2 = this.extractNumbersFromLastLetter(str);
  let keyword1 = _createKeywords(word1);
  let keyword2 = _createKeywords(word2);

  let keywords = [...keyword1, ...keyword2];
  return keywords;
};

exports.getDates = (startDate, stopDate, format) => {
  let dateArray = [];
  let currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(format(parse(currentDate, "yyyy-MM-dd", new Date()), format));
    currentDate = format(addDays(parse(currentDate, "yyyy-MM-dd", new Date()), 1), "yyyy-MM-dd");
  }
  return dateArray;
};

exports.hasVehicleNo = (item) => item?.vehicleNo && ((typeof item.vehicleNo === "string" && item.vehicleNo !== "") || (Array.isArray(item.vehicleNo) && item.vehicleNo.length > 0));
exports.hasPeripheralNo = (item) => item?.peripheralNo && ((typeof item.peripheralNo === "string" && item.peripheralNo !== "") || (Array.isArray(item.peripheralNo) && item.peripheralNo.length > 0));