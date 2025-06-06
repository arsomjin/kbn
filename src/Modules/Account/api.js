import React from 'react';
import numeral from 'numeral';
import moment from 'moment';
import { ButtonGroup, Button, Badge } from 'shards-react';
import { Chip, Avatar } from '@material-ui/core';
import { isMobile } from 'react-device-detect';
import { StatusMapBadgeType } from 'data/Constant';
import { StatusMapToThai } from 'data/Constant';
import DoneIcon from '@material-ui/icons/Done';
import { DateRange } from 'data/Constant';
import { IncomeServiceCategories } from 'data/Constant';
import { IncomeType } from 'data/Constant';
import { checkCollection } from 'firebase/api';

export const IncomeVehicleColumns = (grant, handleItemViewDetails, branches) =>
  isMobile
    ? [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 40,
          className: 'text-center'
        },
        {
          Header: 'ชื่อ',
          id: 'name',
          minWidth: 140,
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{`${row.original.prefix}${row.original.firstName} ${row.original.lastName}`}</span>
            </div>
          )
        },
        {
          id: 'total',
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          maxWidth: 200,
          minWidth: 100,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-success">{numeral(row.original.total).format('0,0.00')}</span>
            </div>
          ),
          className: 'text-right'
          // Footer: (
          //   <span
          //     className="text-primary text-center"
          //     style={{ textDecorationLine: 'underline', marginRight: 10 }}
          //   >
          //     {numeral(_.sum(_.map(formikSlice, (d) => d.total))).format(
          //       '0,0.00'
          //     )}
          //   </span>
          // ),
        },
        {
          Header: (
            <span>
              <i className="material-icons">&#xE870;</i>
            </span>
          ),
          id: 'actions',
          accessor: 'actions',
          maxWidth: 100,
          minWidth: 60,
          sortable: false,
          Cell: row => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button theme="white" onClick={() => handleItemViewDetails(row.original, 'vehicles')} disabled={!grant}>
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          )
        }
      ]
    : [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 50,
          className: 'text-center'
        },
        {
          Header: 'วันที่',
          id: 'date',
          maxWidth: 100,
          className: 'text-center',
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{moment(row.original.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}</span>
              {/* <span>{moment(row.original.created).format('DD/MM/YYYY')}</span> */}
            </div>
          )
        },
        // {
        //   Header: 'เวลา',
        //   id: 'time',
        //   maxWidth: 60,
        //   className: 'text-center',
        //   Cell: (row) => (
        //     <div style={{ flex: 1, textAlign: 'left' }}>
        //       <span>
        //         {moment(row.original.date, 'YYYY-MM-DD').format('HH:mm')}
        //       </span>
        //       {/* <span>{moment(row.original.created).format('HH:mm')}</span> */}
        //     </div>
        //   ),
        // },
        {
          Header: 'สาขา',
          accessor: 'branchCode',
          minWidth: 100,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-light">{branches[row.original.branchCode].branchName}</span>
            </div>
          )
        },
        // {
        //   Header: 'เลขที่บิล',
        //   accessor: 'incomeVehicleId',
        //   minWidth: 120,
        // },
        {
          Header: 'ชื่อ',
          id: 'name',
          minWidth: 180,
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{`${row.original.prefix}${row.original.firstName} ${row.original.lastName}`}</span>
            </div>
          )
        },
        {
          Header: 'ประเภทการรับเงิน',
          accessor: 'incomeType',
          minWidth: 120
        },
        {
          Header: 'รายการ',
          id: 'items',
          minWidth: 160,
          Cell: row =>
            row.original.incomeType === IncomeType.reservation ? (
              <div>
                <Chip
                  avatar={<Avatar>R</Avatar>}
                  label={'เงินจอง'}
                  clickable
                  color="primary"
                  // onDelete={handleDelete}
                  deleteIcon={<DoneIcon />}
                  variant="outlined"
                  size="small"
                  className="mx-1"
                />
              </div>
            ) : (
              row.original.items.map((item, index) => (
                <div>
                  <Chip
                    key={index}
                    avatar={<Avatar>{item.itemCategory && item.itemCategory.startsWith('รถ') ? 'V' : 'E'}</Avatar>}
                    // label={item.modelName}
                    label={item.modelName}
                    clickable
                    color="primary"
                    // onDelete={handleDelete}
                    deleteIcon={<DoneIcon />}
                    variant="outlined"
                    size="small"
                    className="mx-1"
                  />
                </div>
              ))
            )
        },
        {
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          id: 'total',
          maxWidth: 200,
          minWidth: 140,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-success">{numeral(row.original.total).format('0,0.00')}</span>
            </div>
          ),
          className: 'text-right'
          // Footer: (
          //   <span
          //     className="text-primary text-center"
          //     style={{ textDecorationLine: 'underline', marginRight: 10 }}
          //   >
          //     {numeral(_.sum(_.map(formikSlice, (d) => d.total))).format(
          //       '0,0.00'
          //     )}
          //   </span>
          // ),
        },
        {
          Header: 'สถานะ',
          accessor: 'status',
          id: 'status',
          maxWidth: 100,
          Cell: row => {
            const status = row.original.status || 'pending';
            return (
              <Badge outline pill theme={StatusMapBadgeType[status]}>
                {StatusMapToThai[status]}
              </Badge>
            );
            // return <span className={StatusMapToClass[status]}>{status}</span>;
          },
          className: 'text-center'
        },
        {
          Header: (
            <span>
              <i className="material-icons">&#xE870;</i>
            </span>
          ),
          accessor: 'actions',
          id: 'actions',
          maxWidth: 100,
          minWidth: 60,
          sortable: false,
          Cell: row => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button theme="white" onClick={() => handleItemViewDetails(row.original, 'vehicles')} disabled={!grant}>
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          )
        }
      ];

export const IncomeServiceColumns = (grant, handleItemViewDetails, branches) =>
  isMobile
    ? [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 40,
          className: 'text-center'
        },
        {
          Header: 'ชื่อ',
          id: 'name',
          minWidth: 140,
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{`${row.original.prefix}${row.original.firstName} ${row.original.lastName}`}</span>
            </div>
          )
        },
        {
          id: 'total',
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          maxWidth: 200,
          minWidth: 100,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-success">{numeral(row.original.total).format('0,0.00')}</span>
            </div>
          ),
          className: 'text-right'
          // Footer: (
          //   <span
          //     className="text-primary text-center"
          //     style={{ textDecorationLine: 'underline', marginRight: 10 }}
          //   >
          //     {numeral(_.sum(_.map(formikSlice, (d) => d.total))).format(
          //       '0,0.00'
          //     )}
          //   </span>
          // ),
        },
        {
          Header: (
            <span>
              <i className="material-icons">&#xE870;</i>
            </span>
          ),
          id: 'actions',
          accessor: 'actions',
          maxWidth: 100,
          minWidth: 60,
          sortable: false,
          Cell: row => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button theme="white" onClick={() => handleItemViewDetails(row.original, 'service')} disabled={!grant}>
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          )
        }
      ]
    : [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 50,
          className: 'text-center'
        },
        {
          Header: 'วันที่',
          id: 'date',
          maxWidth: 100,
          className: 'text-center',
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{moment(row.original.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}</span>
            </div>
          )
        },
        {
          Header: 'สาขา',
          accessor: 'branchCode',
          minWidth: 100,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-light">{branches[row.original.branchCode].branchName}</span>
            </div>
          )
        },
        // {
        //   Header: 'เวลา',
        //   id: 'time',
        //   maxWidth: 60,
        //   className: 'text-center',
        //   Cell: (row) => (
        //     <div style={{ flex: 1, textAlign: 'left' }}>
        //       <span>{moment(row.original.created).format('HH:mm')}</span>
        //     </div>
        //   ),
        // },
        {
          Header: 'เลขที่บิล',
          accessor: 'orderServiceId',
          minWidth: 120
        },
        {
          Header: 'ชื่อ',
          id: 'name',
          minWidth: 180,
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{`${row.original.prefix}${row.original.firstName} ${row.original.lastName}`}</span>
            </div>
          )
        },
        {
          Header: 'รายการ',
          id: 'items',
          minWidth: 160,
          Cell: row =>
            row.original.items.map((item, index) => (
              <div>
                <Chip
                  key={index}
                  label={row.original.incomeType === IncomeServiceCategories.repairDeposit ? 'มัดจำงานซ่อม' : item.item}
                  clickable
                  color="primary"
                  // onDelete={handleDelete}
                  deleteIcon={<DoneIcon />}
                  variant="outlined"
                  size="small"
                  className="mx-1"
                />
              </div>
            ))
        },
        {
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          id: 'total',
          maxWidth: 200,
          minWidth: 140,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-success">{numeral(row.original.total).format('0,0.00')}</span>
            </div>
          ),
          className: 'text-right'
          // Footer: (
          //   <span
          //     className="text-primary text-center"
          //     style={{ textDecorationLine: 'underline', marginRight: 10 }}
          //   >
          //     {numeral(_.sum(_.map(formikSlice, (d) => d.total))).format(
          //       '0,0.00'
          //     )}
          //   </span>
          // ),
        },
        {
          Header: 'สถานะ',
          accessor: 'status',
          id: 'status',
          maxWidth: 100,
          Cell: row => {
            const status = row.original.status || 'pending';
            return (
              <Badge outline pill theme={StatusMapBadgeType[status]}>
                {StatusMapToThai[status]}
              </Badge>
            );
            // return <span className={StatusMapToClass[status]}>{status}</span>;
          },
          className: 'text-center'
        },
        {
          Header: (
            <span>
              <i className="material-icons">&#xE870;</i>
            </span>
          ),
          accessor: 'actions',
          id: 'actions',
          maxWidth: 100,
          minWidth: 60,
          sortable: false,
          Cell: row => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button theme="white" onClick={() => handleItemViewDetails(row.original, 'service')} disabled={!grant}>
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          )
        }
      ];

export const IncomePartColumns = (grant, handleItemViewDetails, branches) =>
  isMobile
    ? [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 40,
          className: 'text-center'
        },
        {
          Header: 'ชื่อ',
          id: 'name',
          minWidth: 140,
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{`${row.original.prefix}${row.original.firstName} ${row.original.lastName}`}</span>
            </div>
          )
        },
        {
          id: 'total',
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          maxWidth: 200,
          minWidth: 100,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-success">{numeral(row.original.total).format('0,0.00')}</span>
            </div>
          ),
          className: 'text-right'
          // Footer: (
          //   <span
          //     className="text-primary text-center"
          //     style={{ textDecorationLine: 'underline', marginRight: 10 }}
          //   >
          //     {numeral(_.sum(_.map(formikSlice, (d) => d.total))).format(
          //       '0,0.00'
          //     )}
          //   </span>
          // ),
        },
        {
          Header: (
            <span>
              <i className="material-icons">&#xE870;</i>
            </span>
          ),
          id: 'actions',
          accessor: 'actions',
          maxWidth: 100,
          minWidth: 60,
          sortable: false,
          Cell: row => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button theme="white" onClick={() => handleItemViewDetails(row.original, 'parts')} disabled={!grant}>
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          )
        }
      ]
    : [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 50,
          className: 'text-center'
        },
        {
          Header: 'วันที่',
          id: 'date',
          maxWidth: 100,
          className: 'text-center',
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{moment(row.original.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}</span>
            </div>
          )
        },
        {
          Header: 'สาขา',
          accessor: 'branchCode',
          minWidth: 100,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-light">{branches[row.original.branchCode].branchName}</span>
            </div>
          )
        },
        {
          Header: 'เลขที่บิล',
          accessor: 'orderPartId',
          minWidth: 120
        },
        {
          Header: 'ประเภท',
          id: 'incomeType',
          minWidth: 180,
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{row.original.incomeType}</span>
            </div>
          )
        },
        {
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          id: 'total',
          maxWidth: 200,
          minWidth: 140,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-success">{numeral(row.original.total).format('0,0.00')}</span>
            </div>
          ),
          className: 'text-right'
          // Footer: (
          //   <span
          //     className="text-primary text-center"
          //     style={{ textDecorationLine: 'underline', marginRight: 10 }}
          //   >
          //     {numeral(_.sum(_.map(formikSlice, (d) => d.total))).format(
          //       '0,0.00'
          //     )}
          //   </span>
          // ),
        },
        {
          Header: 'สถานะ',
          accessor: 'status',
          id: 'status',
          maxWidth: 100,
          Cell: row => {
            const status = row.original.status || 'pending';
            return (
              <Badge outline pill theme={StatusMapBadgeType[status]}>
                {StatusMapToThai[status]}
              </Badge>
            );
            // return <span className={StatusMapToClass[status]}>{status}</span>;
          },
          className: 'text-center'
        },
        {
          Header: (
            <span>
              <i className="material-icons">&#xE870;</i>
            </span>
          ),
          accessor: 'actions',
          id: 'actions',
          maxWidth: 100,
          minWidth: 60,
          sortable: false,
          Cell: row => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button theme="white" onClick={() => handleItemViewDetails(row.original, 'parts')} disabled={!grant}>
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          )
        }
      ];

export const IncomeOtherColumns = (grant, handleItemViewDetails, branches) =>
  isMobile
    ? [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 40,
          className: 'text-center'
        },
        {
          Header: 'ชื่อ',
          id: 'name',
          minWidth: 140,
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{`${row.original.prefix}${row.original.firstName} ${row.original.lastName}`}</span>
            </div>
          )
        },
        {
          id: 'total',
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          maxWidth: 200,
          minWidth: 100,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-success">{numeral(row.original.total).format('0,0.00')}</span>
            </div>
          ),
          className: 'text-right'
          // Footer: (
          //   <span
          //     className="text-primary text-center"
          //     style={{ textDecorationLine: 'underline', marginRight: 10 }}
          //   >
          //     {numeral(_.sum(_.map(formikSlice, (d) => d.total))).format(
          //       '0,0.00'
          //     )}
          //   </span>
          // ),
        },
        {
          Header: (
            <span>
              <i className="material-icons">&#xE870;</i>
            </span>
          ),
          id: 'actions',
          accessor: 'actions',
          maxWidth: 100,
          minWidth: 60,
          sortable: false,
          Cell: row => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button theme="white" onClick={() => handleItemViewDetails(row.original, 'other')} disabled={!grant}>
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          )
        }
      ]
    : [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 50,
          className: 'text-center'
        },
        {
          Header: 'วันที่',
          id: 'date',
          maxWidth: 100,
          className: 'text-center',
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{moment(row.original.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}</span>
            </div>
          )
        },
        {
          Header: 'สาขา',
          accessor: 'branchCode',
          minWidth: 100,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-light">{branches[row.original.branchCode].branchName}</span>
            </div>
          )
        },
        // {
        //   Header: 'เวลา',
        //   id: 'time',
        //   maxWidth: 60,
        //   className: 'text-center',
        //   Cell: (row) => (
        //     <div style={{ flex: 1, textAlign: 'left' }}>
        //       <span>{moment(row.original.created).format('HH:mm')}</span>
        //     </div>
        //   ),
        // },
        {
          Header: 'เลขที่บิล',
          accessor: 'orderOtherId',
          minWidth: 120
        },
        {
          Header: 'ชื่อ',
          id: 'name',
          minWidth: 180,
          Cell: row => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>{`${row.original.prefix}${row.original.firstName} ${row.original.lastName}`}</span>
            </div>
          )
        },
        {
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          id: 'total',
          maxWidth: 200,
          minWidth: 140,
          Cell: row => (
            <div style={{ flex: 1 }}>
              <span className="text-success">{numeral(row.original.total).format('0,0.00')}</span>
            </div>
          ),
          className: 'text-right'
          // Footer: (
          //   <span
          //     className="text-primary text-center"
          //     style={{ textDecorationLine: 'underline', marginRight: 10 }}
          //   >
          //     {numeral(_.sum(_.map(formikSlice, (d) => d.total))).format(
          //       '0,0.00'
          //     )}
          //   </span>
          // ),
        },
        {
          Header: 'สถานะ',
          accessor: 'status',
          id: 'status',
          maxWidth: 100,
          Cell: row => {
            const status = row.original.status || 'pending';
            return (
              <Badge outline pill theme={StatusMapBadgeType[status]}>
                {StatusMapToThai[status]}
              </Badge>
            );
            // return <span className={StatusMapToClass[status]}>{status}</span>;
          },
          className: 'text-center'
        },
        {
          Header: (
            <span>
              <i className="material-icons">&#xE870;</i>
            </span>
          ),
          accessor: 'actions',
          id: 'actions',
          maxWidth: 100,
          minWidth: 60,
          sortable: false,
          Cell: row => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button theme="white" onClick={() => handleItemViewDetails(row.original, 'other')} disabled={!grant}>
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          )
        }
      ];

export const getFilterData = ({ data, branchCode, range, startDate, endDate }) => {
  let branchFiltered = [];
  if (branchCode === 'all') {
    branchFiltered = data;
  } else {
    branchFiltered = data.filter(l => l.branchCode === branchCode);
  }
  let rangeFiltered = [];
  switch (range) {
    case DateRange.today:
      rangeFiltered = branchFiltered.filter(l => l.date === moment().format('YYYY-MM-DD'));
      break;
    case DateRange.thisWeek:
      rangeFiltered = branchFiltered.filter(l => l.date >= moment().startOf('week').format('YYYY-MM-DD'));
      break;
    case DateRange.thisMonth:
      rangeFiltered = branchFiltered.filter(l => l.date >= moment().startOf('month').format('YYYY-MM-DD'));
      break;
    case DateRange.sevenDays:
      rangeFiltered = branchFiltered.filter(l => l.date >= moment().subtract(7, 'days').format('YYYY-MM-DD'));
      break;
    case DateRange.thirtyDays:
      rangeFiltered = branchFiltered.filter(l => l.date >= moment().subtract(30, 'days').format('YYYY-MM-DD'));
      break;
    case DateRange.custom:
      rangeFiltered = branchFiltered.filter(
        l => l.date >= moment(startDate).format('YYYY-MM-DD') && l.date <= moment(endDate).format('YYYY-MM-DD')
      );
      break;

    default:
      break;
  }
  return rangeFiltered;
};
export const getFilterDataByDate = ({ data, branchCode, date }) => {
  let branchFiltered = [];
  if (branchCode === 'all') {
    branchFiltered = data;
  } else {
    branchFiltered = data.filter(l => l.branchCode === branchCode);
  }
  let rangeFiltered = [];
  rangeFiltered = branchFiltered.filter(l => l.date === moment(date).format('YYYY-MM-DD'));
  return rangeFiltered;
};

export const createNewOrderId = (suffix = 'KBN-ACC-INC') => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000));
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  const orderId = `${suffix}${moment().format('YYYYMMDD')}${padLastNo}`;
  return orderId;
};

export const getItemId = (suffix = 'KBN-ACC-INC') => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000));
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  return `${suffix}-ITEM${moment().format('YYYYMMDD')}${padLastNo}`;
};

export const checkAccountIncomeDataExists = sale =>
  new Promise(async (r, j) => {
    try {
      if (!sale?.saleId) {
        return r(false);
      }
      const cExists = await checkCollection('sections/account/incomes', [['saleId', '==', sale.saleId]]);
      let result = {};
      if (cExists) {
        cExists.forEach(doc => {
          result = doc.data();
        });
      }
      r(result);
    } catch (e) {
      j(e);
    }
  });
