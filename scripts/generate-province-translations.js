// @ts-check
const fs = require('fs').promises;
const path = require('path');

const provinces = {
  "nakhon-ratchasima": "นครราชสีมา",
  "nakhon-sawan": "นครสวรรค์",
  "bangkok": "กรุงเทพมหานคร",
  "amnat-charoen": "อำนาจเจริญ",
  "ang-thong": "อ่างทอง",
  "bueng-kan": "บึงกาฬ",
  "buriram": "บุรีรัมย์",
  "chachoengsao": "ฉะเชิงเทรา",
  "chai-nat": "ชัยนาท",
  "chaiyaphum": "ชัยภูมิ",
  "chanthaburi": "จันทบุรี",
  "chiang-mai": "เชียงใหม่",
  "chiang-rai": "เชียงราย",
  "chonburi": "ชลบุรี",
  "chumphon": "ชุมพร",
  "kalasin": "กาฬสินธุ์",
  "kamphaeng-phet": "กำแพงเพชร",
  "kanchanaburi": "กาญจนบุรี",
  "khon-kaen": "ขอนแก่น",
  "krabi": "กระบี่",
  "lampang": "ลำปาง",
  "lamphun": "ลำพูน",
  "loei": "เลย",
  "lopburi": "ลพบุรี",
  "mae-hong-son": "แม่ฮ่องสอน",
  "maha-sarakham": "มหาสารคาม",
  "mukdahan": "มุกดาหาร",
  "nakhon-nayok": "นครนายก",
  "nakhon-pathom": "นครปฐม",
  "nakhon-phanom": "นครพนม",
  "nakhon-si-thammarat": "นครศรีธรรมราช",
  "nan": "น่าน",
  "narathiwat": "นราธิวาส",
  "nong-bua-lamphu": "หนองบัวลำภู",
  "nong-khai": "หนองคาย",
  "nonthaburi": "นนทบุรี",
  "pathum-thani": "ปทุมธานี",
  "pattani": "ปัตตานี",
  "phang-nga": "พังงา",
  "phatthalung": "พัทลุง",
  "phayao": "พะเยา",
  "phetchabun": "เพชรบูรณ์",
  "phetchaburi": "เพชรบุรี",
  "phichit": "พิจิตร",
  "phitsanulok": "พิษณุโลก",
  "phra-nakhon-si-ayutthaya": "พระนครศรีอยุธยา",
  "phrae": "แพร่",
  "phuket": "ภูเก็ต",
  "prachinburi": "ปราจีนบุรี",
  "prachuap-khiri-khan": "ประจวบคีรีขันธ์",
  "ranong": "ระนอง",
  "ratchaburi": "ราชบุรี",
  "rayong": "ระยอง",
  "roi-et": "ร้อยเอ็ด",
  "sa-kaeo": "สระแก้ว",
  "sakon-nakhon": "สกลนคร",
  "samut-prakan": "สมุทรปราการ",
  "samut-sakhon": "สมุทรสาคร",
  "samut-songkhram": "สมุทรสงคราม",
  "saraburi": "สระบุรี",
  "satun": "สตูล",
  "sing-buri": "สิงห์บุรี",
  "sisaket": "ศรีสะเกษ",
  "songkhla": "สงขลา",
  "sukhothai": "สุโขทัย",
  "suphan-buri": "สุพรรณบุรี",
  "surat-thani": "สุราษฎร์ธานี",
  "surin": "สุรินทร์",
  "tak": "ตาก",
  "trang": "ตรัง",
  "trat": "ตราด",
  "ubon-ratchathani": "อุบลราชธานี",
  "udon-thani": "อุดรธานี",
  "uthai-thani": "อุทัยธานี",
  "uttaradit": "อุตรดิตถ์",
  "yala": "ยะลา",
  "yasothon": "ยโสธร"
};

async function generateProvinceTranslations() {
  console.log('Starting province translations generation...');
  
  try {
    // Create Thai translations
    const thTranslations = {
      "selectProvince": "เลือกจังหวัด",
      ...provinces
    };

    // Create English translations (using the name property from the component)
    const enTranslations = {
      "selectProvince": "Select Province",
      ...Object.fromEntries(
        Object.entries(provinces).map(([key]) => [
          key,
          key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        ])
      )
    };

    // Write Thai translations
    await fs.writeFile(
      path.join(__dirname, '../src/translations/th/provinces.json'),
      JSON.stringify(thTranslations, null, 2),
      'utf8'
    );

    // Write English translations
    await fs.writeFile(
      path.join(__dirname, '../src/translations/en/provinces.json'),
      JSON.stringify(enTranslations, null, 2),
      'utf8'
    );

    console.log('Successfully generated province translations!');
  } catch (error) {
    console.error('Error generating province translations:', error);
    process.exit(1);
  }
}

generateProvinceTranslations();
