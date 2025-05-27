import React from 'react';
import { Skeleton } from 'antd';
import { h } from 'api';

/**
 * AccountSkeleton - Modern skeleton loading component using Ant Design
 * Provides a loading placeholder for account-related content
 */
export const AccountSkeleton = () => (
  <div
    className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
    style={{ minHeight: h(60) }}
  >
    <Skeleton.Input active size="default" className="w-full mb-3" />

    <Skeleton.Input active={false} size="small" className="w-3/4 mb-3" />

    <Skeleton
      active
      paragraph={{ rows: 2, width: ['100%', '50%'] }}
      title={false}
      className="mb-4"
    />

    <Skeleton.Input active={false} size="small" className="w-2/3 mb-3" />

    <Skeleton.Input active size="default" className="w-full mb-3" />

    <Skeleton.Input active={false} size="small" className="w-1/2 mb-3" />

    <Skeleton active paragraph={{ rows: 1, width: '30%' }} title={false} className="mb-4" />

    <Skeleton.Input active={false} size="small" className="w-3/5 mb-3" />

    <Skeleton.Input active size="default" className="w-4/5 mb-3" />

    <Skeleton.Input active={false} size="small" className="w-2/5" />
  </div>
);

/**
 * CardSkeleton - Skeleton for card-based layouts
 */
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
    <Skeleton active avatar paragraph={{ rows: 3 }} title={{ width: '60%' }} />
  </div>
);

/**
 * TableSkeleton - Skeleton for table layouts
 */
export const TableSkeleton = ({ rows = 5 } = {}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    {Array.from({ length: rows }, (_, index) => (
      <div
        key={index}
        className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
      >
        <Skeleton active paragraph={{ rows: 1, width: '100%' }} title={{ width: '30%' }} />
      </div>
    ))}
  </div>
);
