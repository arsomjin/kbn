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

// Type definitions
export interface Column {
  Header: string | React.ReactNode;
  accessor?: string;
  id?: string;
  maxWidth?: number;
  minWidth?: number;
  className?: string;
  sortable?: boolean;
  Cell?: (row: any) => React.ReactNode;
  Footer?: React.ReactNode;
}

export interface FilterDataOptions {
  data: any[];
  branchCode: string;
  range: string;
  startDate: Date;
  endDate: Date;
}

export interface FilterDataByDateOptions {
  data: any[];
  branchCode: string;
  date: Date | string;
}

export interface IncomeItem {
  itemCategory?: string;
  modelName?: string;
  [key: string]: any;
}

export interface IncomeRecord {
  id?: number;
  date?: string;
  branchCode?: string;
  prefix?: string;
  firstName?: string;
  lastName?: string;
  total?: number;
  status?: string;
  items?: IncomeItem[];
  incomeType?: string;
  incomeVehicleId?: string;
  orderServiceId?: string;
  orderPartId?: string;
  orderOtherId?: string;
  saleId?: string;
  [key: string]: any;
}

/**
 * Generates column definitions for Income Vehicle table
 * @param grant - User permission flag
 * @param handleItemViewDetails - Function to handle item view
 * @param branches - Branch data
 * @returns Column configuration array
 */
export const IncomeVehicleColumns = (
  grant: boolean,
  handleItemViewDetails: (item: IncomeRecord, category: string) => void,
  branches: Record<string, { branchName: string; [key: string]: any }>
): Column[] => 
  isMobile
    ? [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 40,
          className: 'text-center',
        },
        {
          Header: 'ชื่อ',
          id: 'name',
          minWidth: 140,
          Cell: (row) => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>
                {`${row.original.prefix}${row.original.firstName} ${row.original.lastName}`}
              </span>
            </div>
          ),
        },
        {
          id: 'total',
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          maxWidth: 200,
          minWidth: 100,
          Cell: (row) => (
            <div style={{ flex: 1 }}>
              <span className="text-success">
                {numeral(row.original.total).format('0,0.00')}
              </span>
            </div>
          ),
          className: 'text-right',
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
          Cell: (row) => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button
                theme="white"
                onClick={() => handleItemViewDetails(row.original, 'vehicles')}
                disabled={!grant}
              >
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          ),
        },
      ]
    : [
        {
          Header: 'ลำดับที่',
          accessor: 'id',
          maxWidth: 50,
          className: 'text-center',
        },
        {
          Header: 'วันที่',
          id: 'date',
          maxWidth: 100,
          className: 'text-center',
          Cell: (row) => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>
                {moment(row.original.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}
              </span>
            </div>
          ),
        },
        {
          Header: 'สาขา',
          accessor: 'branchCode',
          minWidth: 100,
          Cell: (row) => (
            <div style={{ flex: 1 }}>
              <span className="text-light">
                {branches[row.original.branchCode].branchName}
              </span>
            </div>
          ),
        },
        {
          Header: 'ชื่อ',
          id: 'name',
          minWidth: 180,
          Cell: (row) => (
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>
                {`${row.original.prefix}${row.original.firstName} ${row.original.lastName}`}
              </span>
            </div>
          ),
        },
        {
          Header: 'ประเภทการรับเงิน',
          accessor: 'incomeType',
          minWidth: 120,
        },
        {
          Header: 'รายการ',
          id: 'items',
          minWidth: 160,
          Cell: (row) =>
            row.original.incomeType === IncomeType.reservation ? (
              <div>
                <Chip
                  avatar={<Avatar>R</Avatar>}
                  label={'เงินจอง'}
                  clickable
                  color="primary"
                  deleteIcon={<DoneIcon />}
                  variant="outlined"
                  size="small"
                  className="mx-1"
                />
              </div>
            ) : (
              row.original.items.map((item: IncomeItem, index: number) => (
                <div key={index}>
                  <Chip
                    avatar={
                      <Avatar>
                        {item.itemCategory && item.itemCategory.startsWith('รถ')
                          ? 'V'
                          : 'E'}
                      </Avatar>
                    }
                    label={item.modelName}
                    clickable
                    color="primary"
                    deleteIcon={<DoneIcon />}
                    variant="outlined"
                    size="small"
                    className="mx-1"
                  />
                </div>
              ))
            ),
        },
        {
          Header: 'ยอดสุทธิ',
          accessor: 'total',
          id: 'total',
          maxWidth: 200,
          minWidth: 140,
          Cell: (row) => (
            <div style={{ flex: 1 }}>
              <span className="text-success">
                {numeral(row.original.total).format('0,0.00')}
              </span>
            </div>
          ),
          className: 'text-right',
        },
        {
          Header: 'สถานะ',
          accessor: 'status',
          id: 'status',
          maxWidth: 100,
          Cell: (row) => {
            const status = row.original.status || 'pending';
            return (
              <Badge outline pill theme={StatusMapBadgeType[status]}>
                {StatusMapToThai[status]}
              </Badge>
            );
          },
          className: 'text-center',
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
          Cell: (row) => (
            <ButtonGroup size="sm" className="d-table mx-auto">
              <Button
                theme="white"
                onClick={() => handleItemViewDetails(row.original, 'vehicles')}
                disabled={!grant}
              >
                <i className="material-icons">keyboard_arrow_right</i>
              </Button>
            </ButtonGroup>
          ),
        },
      ];

/**
 * Generates column definitions for Income Service table
 * @param grant - User permission flag
 * @param handleItemViewDetails - Function to handle item view
 * @param branches - Branch data
 * @returns Column configuration array
 */
export const IncomeServiceColumns = (
  grant: boolean,
  handleItemViewDetails: (item: IncomeRecord, category: string) => void,
  branches: Record<string, { branchName: string; [key: string]: any }>
): Column[] => 
  isMobile
    ? [
        // ...existing code...
      ]
    : [
        // ...existing code...
      ];

/**
 * Generates column definitions for Income Part table
 * @param grant - User permission flag
 * @param handleItemViewDetails - Function to handle item view
 * @param branches - Branch data
 * @returns Column configuration array
 */
export const IncomePartColumns = (
  grant: boolean,
  handleItemViewDetails: (item: IncomeRecord, category: string) => void,
  branches: Record<string, { branchName: string; [key: string]: any }>
): Column[] => 
  isMobile
    ? [
        // ...existing code...
      ]
    : [
        // ...existing code...
      ];

/**
 * Generates column definitions for Income Other table
 * @param grant - User permission flag
 * @param handleItemViewDetails - Function to handle item view
 * @param branches - Branch data
 * @returns Column configuration array
 */
export const IncomeOtherColumns = (
  grant: boolean,
  handleItemViewDetails: (item: IncomeRecord, category: string) => void,
  branches: Record<string, { branchName: string; [key: string]: any }>
): Column[] => 
  isMobile
    ? [
        // ...existing code...
      ]
    : [
        // ...existing code...
      ];

/**
 * Filter data based on branch, date range, etc.
 * @param options - Filter options
 * @returns Filtered data array
 */
export const getFilterData = (options: FilterDataOptions): any[] => {
  const { data, branchCode, range, startDate, endDate } = options;
  
  let branchFiltered: any[] = [];
  if (branchCode === 'all') {
    branchFiltered = data;
  } else {
    branchFiltered = data.filter((l) => l.branchCode === branchCode);
  }
  
  let rangeFiltered: any[] = [];
  switch (range) {
    case DateRange.today:
      rangeFiltered = branchFiltered.filter(
        (l) => l.date === moment().format('YYYY-MM-DD')
      );
      break;
    case DateRange.thisWeek:
      rangeFiltered = branchFiltered.filter(
        (l) => l.date >= moment().startOf('week').format('YYYY-MM-DD')
      );
      break;
    case DateRange.thisMonth:
      rangeFiltered = branchFiltered.filter(
        (l) => l.date >= moment().startOf('month').format('YYYY-MM-DD')
      );
      break;
    case DateRange.sevenDays:
      rangeFiltered = branchFiltered.filter(
        (l) => l.date >= moment().subtract(7, 'days').format('YYYY-MM-DD')
      );
      break;
    case DateRange.thirtyDays:
      rangeFiltered = branchFiltered.filter(
        (l) => l.date >= moment().subtract(30, 'days').format('YYYY-MM-DD')
      );
      break;
    case DateRange.custom:
      rangeFiltered = branchFiltered.filter(
        (l) =>
          l.date >= moment(startDate).format('YYYY-MM-DD') &&
          l.date <= moment(endDate).format('YYYY-MM-DD')
      );
      break;
    default:
      break;
  }
  
  return rangeFiltered;
};

/**
 * Filter data by specific date
 * @param options - Filter options with specific date
 * @returns Filtered data array
 */
export const getFilterDataByDate = (options: FilterDataByDateOptions): any[] => {
  const { data, branchCode, date } = options;
  
  let branchFiltered: any[] = [];
  if (branchCode === 'all') {
    branchFiltered = data;
  } else {
    branchFiltered = data.filter((l) => l.branchCode === branchCode);
  }
  
  return branchFiltered.filter(
    (l) => l.date === moment(date).format('YYYY-MM-DD')
  );
};

/**
 * Create a new random order ID with timestamp and random number
 * @param suffix - Order ID prefix
 * @returns New unique order ID
 */
export const createNewOrderId = (suffix: string = 'KBN-ACC-INC'): string => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000).toString());
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  return `${suffix}${moment().format('YYYYMMDD')}${padLastNo}`;
};

/**
 * Generate a unique item ID for orders
 * @param suffix - Item ID prefix
 * @returns New unique item ID
 */
export const getItemId = (suffix: string = 'KBN-ACC-INC'): string => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000).toString());
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  return `${suffix}-ITEM${moment().format('YYYYMMDD')}${padLastNo}`;
};

/**
 * Check if account income data exists for a sale
 * @param sale - Sale object to check
 * @returns Promise that resolves to existing data or false
 */
export const checkAccountIncomeDataExists = (sale: { saleId?: string; [key: string]: any }): Promise<any> =>
  new Promise(async (r, j) => {
    try {
      if (!sale?.saleId) {
        return r(false);
      }
      const cExists = await checkCollection('sections/account/incomes', [
        ['saleId', '==', sale.saleId],
      ]);
      let result = {};
      if (cExists) {
        cExists.forEach((doc: { data: () => any }) => {
          result = doc.data();
        });
      }
      r(result);
    } catch (e) {
      j(e);
    }
  });