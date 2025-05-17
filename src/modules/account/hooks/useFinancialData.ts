import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { DateTime } from 'luxon';
import { FinancialDataPoint, AccountOverviewData } from '../types';
import { useAuth } from '../../../hooks/useAuth';
import { firestore } from '../../../services/firebase';

export const useFinancialData = (range: [DateTime, DateTime]) => {
  const [data, setData] = useState<AccountOverviewData>({
    data: [],
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const provinceIds = userProfile?.accessibleProvinceIds || [];
      if (!provinceIds.length) {
        setError(new Error('No accessible provinces found for user profile.'));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [startDate, endDate] = range;
        const provinceWhere = provinceIds.length === 1
          ? where('provinceId', '==', provinceIds[0])
          : where('provinceId', 'in', provinceIds);

        // Fetch income data
        const incomeQuery = query(
          collection(firestore, 'sections/account/incomes'),
          provinceWhere,
          where('date', '>=', startDate.toJSDate()),
          where('date', '<=', endDate.toJSDate()),
          orderBy('date', 'asc')
        );

        // Fetch expense data
        const expenseQuery = query(
          collection(firestore, 'sections/account/expenses'),
          provinceWhere,
          where('date', '>=', startDate.toJSDate()),
          where('date', '<=', endDate.toJSDate()),
          orderBy('date', 'asc')
        );

        const [incomeSnapshot, expenseSnapshot] = await Promise.all([
          getDocs(incomeQuery),
          getDocs(expenseQuery)
        ]);

        const incomeData = incomeSnapshot.docs.map(doc => ({
          date: DateTime.fromJSDate(doc.data().date.toDate()),
          amount: doc.data().amount
        }));

        const expenseData = expenseSnapshot.docs.map(doc => ({
          date: DateTime.fromJSDate(doc.data().date.toDate()),
          amount: doc.data().amount
        }));

        // Combine and process data
        const combinedData: FinancialDataPoint[] = [];
        let currentDate = startDate;

        while (currentDate <= endDate) {
          const dayIncome = incomeData
            .filter(item => item.date.hasSame(currentDate, 'day'))
            .reduce((sum, item) => sum + item.amount, 0);

          const dayExpense = expenseData
            .filter(item => item.date.hasSame(currentDate, 'day'))
            .reduce((sum, item) => sum + item.amount, 0);

          combinedData.push({
            date: currentDate,
            income: dayIncome,
            expense: dayExpense,
            balance: dayIncome - dayExpense
          });

          currentDate = currentDate.plus({ days: 1 });
        }

        const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
        const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);

        setData({
          data: combinedData,
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch financial data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range, userProfile?.accessibleProvinceIds]);

  return { data, loading, error };
}; 