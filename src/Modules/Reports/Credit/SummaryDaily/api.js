import { VehicleGroup } from 'data/Constant';
import { getCollection } from 'firebase/api';
import { distinctArr } from 'functions';
import { Numb } from 'functions';
import { arrayForEach } from 'functions';
import moment from 'moment-timezone';

export const getColumns = date => {
  let prevMonth = date ? moment(date, 'YYYY-MM-DD').subtract(1, 'month').locale('th').format('MMM') : '';
  let nextMonth = date ? moment(date, 'YYYY-MM-DD').add(1, 'month').locale('th').format('MMM') : '';
  let curMonth = date ? moment(date, 'YYYY-MM-DD').locale('th').format('MMM') : '';
  return [
    {
      title: 'สาขา',
      dataIndex: 'branchName',
      width: 120,
      className: 'text-primary',
      fixed: 'left'
    },
    {
      title: 'ออกยกมา',
      dataIndex: 'prevSold',
      align: 'center',
      width: 70
    },
    {
      title: 'ออกวันนี้',
      children: [
        {
          title: 'ซื้อสด',
          dataIndex: 'cash',
          align: 'center',
          width: 70
        },
        {
          title: 'SKL',
          dataIndex: 'sklLeasing',
          align: 'center',
          width: 70
        },
        {
          title: 'สกต/ธกส',
          dataIndex: 'baac',
          align: 'center',
          width: 70
        }
      ]
    },
    {
      title: 'รวมออกทั้งหมด',
      dataIndex: 'totalSold',
      align: 'center',
      width: 70
    },
    {
      title: `ยอดจอง ${prevMonth} (ยกมา)`,
      children: [
        {
          title: 'จองยกมา',
          dataIndex: 'prevBook',
          align: 'center',
          width: 70
        },
        {
          title: 'ออกแล้ว',
          dataIndex: 'prevBookSold',
          align: 'center',
          width: 70
        },
        {
          title: 'ยกเลิก',
          dataIndex: 'prevBookCancel',
          align: 'center',
          width: 70
        },
        {
          title: `คงเหลือจอง ${prevMonth}`,
          dataIndex: 'prevBookTotal',
          align: 'center',
          width: 70
        }
      ]
    },
    {
      title: `จอง ธกส ${prevMonth} ออกแล้ว`,
      dataIndex: 'prevBaacBookSold',
      align: 'center',
      width: 70
    },
    {
      title: `รวมจอง ${prevMonth} ออกแล้ว`,
      dataIndex: 'bookSalePrevMonth',
      align: 'center',
      width: 70
    },
    {
      title: 'ยอดจองวันนี้',
      children: [
        {
          title: 'ปกติ',
          dataIndex: 'bookToday',
          align: 'center',
          width: 70
        },
        {
          title: 'ตีเทิร์น',
          dataIndex: 'bookTodayTurnOver',
          align: 'center',
          width: 70
        }
      ]
    },
    {
      title: `ยอดจองและออก ${curMonth}`,
      children: [
        {
          title: `รวมจอง ${curMonth}`,
          dataIndex: 'curBook',
          align: 'center',
          width: 70
        },
        {
          title: `จอง ${curMonth} ออกแล้ว`,
          dataIndex: 'curBookSold',
          align: 'center',
          width: 70
        },
        {
          title: 'โครงการรัฐออกแล้ว',
          dataIndex: 'curGovProjBookSold',
          align: 'center',
          width: 70
        },
        {
          title: 'จอง ธกส ออกแล้ว',
          dataIndex: 'curBaacBookSold',
          align: 'center',
          width: 70
        },
        {
          title: `จอง ${curMonth} ยกเลิก`,
          dataIndex: 'curBookCancel',
          align: 'center',
          width: 70
        },
        {
          title: `จอง ${curMonth} คงเหลือ`,
          dataIndex: 'curBookTotal',
          align: 'center',
          width: 70
        }
      ]
    },
    {
      title: `รวมยอด ${curMonth}`,
      dataIndex: 'bookSoldThisMonth',
      align: 'center',
      width: 70
    },
    {
      title: 'รวมจองคงเหลือ',
      dataIndex: 'totalBookRemain',
      align: 'center',
      width: 70
    },
    {
      title: 'รวมออกจอง',
      dataIndex: 'totalBookSold',
      align: 'center',
      width: 70
    },
    {
      title: 'รวมออกทั้งหมด',
      dataIndex: 'totalSale',
      align: 'center',
      width: 70
    },
    {
      title: 'ยอดตัดขาย',
      dataIndex: 'totalSaleCutoff',
      align: 'center',
      width: 70
    },
    {
      title: 'ยังไม่ตัดขาย',
      dataIndex: 'totalSaleUnCutoff',
      align: 'center',
      width: 70
    },
    {
      title: `ออก ${curMonth} ยกไป ${nextMonth} (ตัดสต๊อก)`,
      dataIndex: 'toNextMonth',
      align: 'center',
      width: 70
    },
    {
      title: 'จอง ธกส วันนี้',
      dataIndex: 'baacBookToday',
      align: 'center',
      width: 70
    },
    {
      title: 'ธกส จองเก่า',
      dataIndex: 'baacOldBook',
      align: 'center',
      width: 70
    },
    {
      title: 'ธกส จองใหม่',
      dataIndex: 'baacNewBook',
      align: 'center',
      width: 70
    },
    {
      title: 'ยกเลิกจองวันนี้',
      dataIndex: 'bookCancelToday',
      align: 'center',
      width: 70
    },
    {
      title: 'รวมยกเลิกจองเก่า',
      dataIndex: 'oldBookCancel',
      align: 'center',
      width: 70
    },
    {
      title: 'รวมยกเลิกจองใหม่',
      dataIndex: 'newBookCancel',
      align: 'center',
      width: 70
    },
    {
      title: 'รวมยกเลิก',
      dataIndex: 'totalBookCancel',
      align: 'center',
      width: 70
    },
    {
      title: 'ยอดออกวันถัดไป',
      dataIndex: 'totalSaleNextDay',
      align: 'center',
      width: 70
    },
    {
      title: 'เงินวางดาวน์',
      dataIndex: 'downAmount',
      align: 'center',
      width: 70
    },
    {
      title: `รวมเทรดอิน ${curMonth}`,
      dataIndex: 'totalTradeIn',
      align: 'center',
      width: 70
    }
  ];
};

const initData = {
  branchName: null,
  prevSold: null,
  cash: null,
  baac: null,
  sklLeasing: null,
  kbnLeasing: null,
  govProj: null,
  totalSold: null,
  prevBook: null,
  prevBookSold: null,
  prevBookCancel: null,
  prevBookTotal: null,
  prevBaacBookSold: null,
  bookSalePrevMonth: null,
  bookToday: null,
  bookTodayTurnOver: null,
  curBook: null,
  curBookSold: null,
  curGovProjBookSold: null,
  curBaacBookSold: null,
  curBookCancel: null,
  curBookTotal: null,
  bookSoldThisMonth: null,
  totalBookRemain: null,
  totalBookSold: null,
  totalSale: null,
  totalSaleCutoff: null,
  totalSaleUnCutoff: null,
  toNextMonth: null,
  baacBookToday: null,
  baacOldBook: null,
  baacNewBook: null,
  bookCancelToday: null,
  oldBookCancel: null,
  newBookCancel: null,
  totalBookCancel: null,
  totalSaleNextDay: null,
  downAmount: null,
  totalTradeIn: null
};

export const sumKeys = Object.keys(initData)
  .map(k => k)
  .filter(l => !['branchName', 'kbnLeasing', 'govProj'].includes(l));

export const getDailyCreditData = ({ date, branches, vehicle }) =>
  new Promise(async (r, j) => {
    try {
      let start = moment(date, 'YYYY-MM-DD').subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
      let dSnap = {};
      let branchArr = Object.keys(branches || {}).map(k => {
        dSnap[k] = {
          ...initData,
          branchCode: k,
          branchName: branches[k].branchName
        };
        return branches[k];
      });
      let sales = [];
      let books = [];
      let result = [];
      let wheres = [
        ['date', '>=', start],
        ['date', '<=', date]
      ];
      const saleData = await getCollection('sections/sales/vehicles', wheres);
      sales = Object.keys(saleData || {}).map(k => {
        let items = !!saleData[k]?.items
          ? saleData[k].items.filter(l => !['อุปกรณ์', 'เครื่องยนต์', 'ของแถม'].includes(l.vehicleType))
          : [];
        let qty = items.reduce((sum, elem) => sum + Numb(elem?.qty || 0), 0);
        // showLog({ items });
        let vGroup = 'n/a';
        if (items.length > 0) {
          if (!!items[0].vehicleType) {
            if (items[0].vehicleType.search(VehicleGroup.tracktor.keyword) > -1) {
              vGroup = 'tracktor';
            } else if (items[0].vehicleType.search(VehicleGroup.harvester.keyword) > -1) {
              vGroup = 'harvester';
            } else if (items[0].vehicleType.search(VehicleGroup.excavator.keyword) > -1) {
              vGroup = 'excavator';
            } else if (items[0].vehicleType.search(VehicleGroup.ricePlanter.keyword) > -1) {
              vGroup = 'ricePlanter';
            } else if (items[0].vehicleType.search(VehicleGroup.drone.keyword) > -1) {
              vGroup = 'drone';
            }
          } else if (items[0].productName.startsWith('โดรน')) {
            vGroup = 'drone';
          }
        }

        return {
          ...saleData[k],
          vGroup,
          qty
        };
      });
      if (vehicle !== 'all') {
        sales = sales.filter(l => l.vGroup === vehicle);
      }
      sales = distinctArr(
        sales.filter(l => l.qty > 0),
        ['saleNo'],
        ['qty']
      );
      const booksData = await getCollection('sections/sales/bookings', wheres);
      books = Object.keys(booksData || {}).map(k => {
        let items = !!booksData[k]?.items
          ? booksData[k].items.filter(l => !['อุปกรณ์', 'เครื่องยนต์', 'ของแถม'].includes(l.vehicleType))
          : [];
        let qty = items.reduce((sum, elem) => sum + Numb(elem?.qty || 0), 0);
        let vGroup = 'n/a';
        if (items.length > 0) {
          if (!!items[0].vehicleType) {
            if (items[0].vehicleType.search(VehicleGroup.tracktor.keyword) > -1) {
              vGroup = 'tracktor';
            } else if (items[0].vehicleType.search(VehicleGroup.harvester.keyword) > -1) {
              vGroup = 'harvester';
            } else if (items[0].vehicleType.search(VehicleGroup.excavator.keyword) > -1) {
              vGroup = 'excavator';
            } else if (items[0].vehicleType.search(VehicleGroup.ricePlanter.keyword) > -1) {
              vGroup = 'ricePlanter';
            } else if (items[0].vehicleType.search(VehicleGroup.drone.keyword) > -1) {
              vGroup = 'drone';
            }
          } else if (items[0].productName.startsWith('โดรน')) {
            vGroup = 'drone';
          }
        }

        return {
          ...booksData[k],
          vGroup,
          qty,
          soldDate: booksData[k]?.sold ? booksData[k].sold.soldDate : undefined
        };
      });
      if (vehicle !== 'all') {
        books = books.filter(l => l.vGroup === vehicle);
      }
      books = distinctArr(
        books.filter(l => l.qty > 0),
        ['bookNo'],
        ['qty']
      );
      let todaySale = sales.filter(l => l.date === date);
      const nextDaySaleData = await getCollection('sections/sales/vehicles', [
        ['date', '==', moment(date, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD')]
      ]);
      let nextDaySales = Object.keys(nextDaySaleData || {}).map(k => {
        let items = !!nextDaySaleData[k]?.items
          ? nextDaySaleData[k].items.filter(l => !['อุปกรณ์', 'เครื่องยนต์', 'ของแถม'].includes(l.vehicleType))
          : [];
        let qty = items.reduce((sum, elem) => sum + Numb(elem?.qty || 0), 0);
        return {
          ...nextDaySaleData[k],
          qty
        };
      });
      nextDaySales = distinctArr(
        nextDaySales.filter(l => l.qty > 0),
        ['saleNo'],
        ['qty']
      );
      let todayBook = books.filter(l => l.date === date);
      let todayBookCanceled = books.filter(l => !!l.canceled && l.canceled.date === date);
      let lastMonthBookArr = books.filter(
        l => l.date >= start && l.date <= moment(start, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD')
      );
      let thisMonthBook = books.filter(
        l => l.date >= moment(date, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD') && l.date <= date
      );
      let lastMonthSoldArr = sales.filter(
        l => l.date >= start && l.date <= moment(start, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD')
      );
      let thisMonthSoldArr = sales.filter(
        l => l.date >= moment(date, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD') && l.date <= date
      );
      let lastMonthBook = lastMonthBookArr.filter(
        l =>
          !l.soldDate ||
          (l.soldDate >= moment(date, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD') && l.soldDate <= date)
      );
      let lastMonthSold = lastMonthSoldArr.filter(
        l => l.bookDate >= start && l.bookDate <= moment(start, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD')
      );
      let thisMonthSold = thisMonthSoldArr.filter(
        l => l.bookDate >= moment(date, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD') && l.bookDate <= date
      );
      await arrayForEach(todaySale, async tdSale => {
        switch (tdSale.saleType) {
          case 'cash':
            dSnap[tdSale.branchCode].cash = Numb(dSnap[tdSale.branchCode].cash) + tdSale.qty;
            break;
          case 'baac':
            dSnap[tdSale.branchCode].baac = Numb(dSnap[tdSale.branchCode].baac) + tdSale.qty;
            break;
          case 'sklLeasing':
            dSnap[tdSale.branchCode].sklLeasing = Numb(dSnap[tdSale.branchCode].sklLeasing) + tdSale.qty;
            break;
          case 'kbnLeasing':
            dSnap[tdSale.branchCode].kbnLeasing = Numb(dSnap[tdSale.branchCode].kbnLeasing) + tdSale.qty;
            break;
          case 'govProj':
            dSnap[tdSale.branchCode].govProj = Numb(dSnap[tdSale.branchCode].govProj) + tdSale.qty;
            break;

          default:
            break;
        }
      });
      await arrayForEach(todayBook, async tdBook => {
        if (!!tdBook.hasTurnOver) {
          dSnap[tdBook.branchCode].bookTodayTurnOver = Numb(dSnap[tdBook.branchCode].bookTodayTurnOver) + tdBook.qty;
        } else {
          dSnap[tdBook.branchCode].bookToday = Numb(dSnap[tdBook.branchCode].bookToday) + tdBook.qty;
        }
        if (tdBook.saleType === 'baac') {
          dSnap[tdBook.branchCode].baacBookToday = Numb(dSnap[tdBook.branchCode].baacBookToday) + tdBook.qty;
        }
      });
      await arrayForEach(todayBookCanceled, async tdBookCanceled => {
        dSnap[tdBookCanceled.branchCode].bookCancelToday =
          Numb(dSnap[tdBookCanceled.branchCode].bookCancelToday) + tdBookCanceled.qty;
      });

      Object.keys(branches).map(k => {
        let lmBook = lastMonthBook.filter(l => l.branchCode === k);
        dSnap[k].prevBook = lmBook.reduce((sum, elem) => sum + Numb(elem?.qty || 0), 0);
        let lmSold = lastMonthSold.filter(l => l.branchCode === k);
        dSnap[k].prevSold = lmSold.reduce((sum, elem) => sum + Numb(elem?.qty || 0), 0);
        return k;
      });

      await arrayForEach(lastMonthBook, async lmBook => {
        if (lmBook?.sold) {
          if (lmBook.sold.saleType === 'baac') {
            dSnap[lmBook.branchCode].prevBaacBookSold = Numb(dSnap[lmBook.branchCode].prevBaacBookSold) + lmBook.qty;
            dSnap[lmBook.branchCode].baacOldBook = Numb(dSnap[lmBook.branchCode].baacOldBook) + lmBook.qty;
          } else {
            dSnap[lmBook.branchCode].prevBookSold = Numb(dSnap[lmBook.branchCode].prevBookSold) + lmBook.qty;
          }
        }
        if (lmBook?.canceled) {
          dSnap[lmBook.branchCode].prevBookCancel = Numb(dSnap[lmBook.branchCode].prevBookCancel) + lmBook.qty;
          dSnap[lmBook.branchCode].oldBookCancel = Numb(dSnap[lmBook.branchCode].oldBookCancel) + lmBook.qty;
        }
        dSnap[lmBook.branchCode].prevBookTotal =
          Numb(dSnap[lmBook.branchCode].prevBook) -
          Numb(dSnap[lmBook.branchCode].prevBookSold) -
          Numb(dSnap[lmBook.branchCode].prevBookCancel);
        dSnap[lmBook.branchCode].bookSalePrevMonth =
          Numb(dSnap[lmBook.branchCode].prevSold) +
          Numb(dSnap[lmBook.branchCode].prevBaacBookSold) +
          Numb(dSnap[lmBook.branchCode].prevBookSold);
      });
      await arrayForEach(thisMonthBook, async tmBook => {
        //         curBook: null,
        //   curBookSold: null,
        //   curGovProjBookSold: null,
        //   curBaacBookSold: null,
        //   curBookCancel: null,
        //   curBookTotal: null,
        dSnap[tmBook.branchCode].curBook = Numb(dSnap[tmBook.branchCode].curBook) + tmBook.qty;
        if (tmBook?.sold) {
          if (tmBook.sold.saleType === 'baac') {
            dSnap[tmBook.branchCode].curBaacBookSold = Numb(dSnap[tmBook.branchCode].curBaacBookSold) + tmBook.qty;
            dSnap[tmBook.branchCode].baacNewBook = Numb(dSnap[tmBook.branchCode].baacNewBook) + tmBook.qty;
          } else if (tmBook.sold.saleType === 'govProj') {
            dSnap[tmBook.branchCode].curGovProjBookSold =
              Numb(dSnap[tmBook.branchCode].curGovProjBookSold) + tmBook.qty;
          } else {
            dSnap[tmBook.branchCode].curBookSold = Numb(dSnap[tmBook.branchCode].curBookSold) + tmBook.qty;
          }
        }
        if (tmBook?.canceled) {
          dSnap[tmBook.branchCode].curBookCancel = Numb(dSnap[tmBook.branchCode].curBookCancel) + tmBook.qty;
          dSnap[tmBook.branchCode].newBookCancel = Numb(dSnap[tmBook.branchCode].newBookCancel) + tmBook.qty;
        }
        dSnap[tmBook.branchCode].curBookTotal =
          Numb(dSnap[tmBook.branchCode].curBook) -
          Numb(dSnap[tmBook.branchCode].curBookSold) -
          Numb(dSnap[tmBook.branchCode].curBaacBookSold) -
          //   Numb(dSnap[tmBook.branchCode].curGovProjBookSold) -
          Numb(dSnap[tmBook.branchCode].curBookCancel);
        dSnap[tmBook.branchCode].bookSoldThisMonth =
          Numb(dSnap[tmBook.branchCode].curBookSold) +
          Numb(dSnap[tmBook.branchCode].curBookTotal) -
          Numb(dSnap[tmBook.branchCode].curBaacBookSold);
        dSnap[tmBook.branchCode].totalBookRemain =
          Numb(dSnap[tmBook.branchCode].prevBookTotal) + Numb(dSnap[tmBook.branchCode].curBookTotal);
        dSnap[tmBook.branchCode].totalSold =
          Numb(dSnap[tmBook.branchCode].prevBookSold) +
          Numb(dSnap[tmBook.branchCode].prevBaacBookSold) +
          Numb(dSnap[tmBook.branchCode].prevSold) +
          Numb(dSnap[tmBook.branchCode].curBookSold) +
          Numb(dSnap[tmBook.branchCode].curBaacBookSold);
        dSnap[tmBook.branchCode].totalBookSold =
          Numb(dSnap[tmBook.branchCode].totalSold) + Numb(dSnap[tmBook.branchCode].totalBookRemain);
        dSnap[tmBook.branchCode].totalSale = Numb(dSnap[tmBook.branchCode].totalSold);
      });
      await arrayForEach(sales, sale => {
        if (sale.saleCutoffDate) {
          dSnap[sale.branchCode].totalSaleCutoff = Numb(dSnap[sale.branchCode].totalSaleCutoff) + sale.qty;
        }
        // } else {
        //   dSnap[sale.branchCode].totalSaleUnCutoff =
        //     Numb(dSnap[sale.branchCode].totalSaleUnCutoff) + sale.qty;
        // }
      });
      await arrayForEach(nextDaySales, nsale => {
        dSnap[nsale.branchCode].totalSaleNextDay = Numb(dSnap[nsale.branchCode].totalSaleNextDay) + nsale.qty;
      });
      Object.keys(branches).map(k => {
        dSnap[k].totalBookCancel = Numb(dSnap[k].oldBookCancel) + Numb(dSnap[k].newBookCancel);
        if (Number(dSnap[k].totalSaleCutoff) > Numb(dSnap[k].totalSold)) {
          dSnap[k].totalSaleCutoff = dSnap[k].totalSold;
        }
        dSnap[k].totalSaleUnCutoff = Numb(dSnap[k].totalSold) - Numb(dSnap[k].totalSaleCutoff);
        return k;
      });

      result = Object.keys(dSnap || {}).map((k, id) => ({
        ...dSnap[k],
        key: id,
        id
      }));
      r(result);
    } catch (e) {
      j(e);
    }
  });
