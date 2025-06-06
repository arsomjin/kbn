import { checkDoc } from 'firebase/api';

export const formatItemData = (arr, dataIndex, rowIndex) =>
  new Promise(async (r, j) => {
    try {
      //  showLog({ arr, dataIndex });
      let newData = [...arr];
      let mItem = { ...arr[rowIndex] };
      if (dataIndex === 'productCode' && arr[rowIndex][dataIndex]) {
        const sDoc = await checkDoc('data', `products/vehicleList/${mItem.productCode}`);
        if (sDoc) {
          mItem.productName = sDoc.data().name;
        }
      } else if (dataIndex === 'vehicleType' && arr[rowIndex][dataIndex]) {
        mItem.isEquipment = arr[rowIndex][dataIndex].match('อุปกรณ์') ? true : false;
      }
      newData.splice(rowIndex, 1, mItem);
      r(newData);
    } catch (e) {
      j(e);
    }
  });
