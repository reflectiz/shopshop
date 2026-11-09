import React, { useMemo, useState } from 'react';
import { BankTransaction } from '../../services/api';
import { formatDate, formatSignedCurrency } from '../../lib/format';

interface TransactionTableProps {
  transactions: BankTransaction[];
  currency: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, currency }) => {
  const [category, setCategory] = useState('all');

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))).sort(),
    [transactions]
  );

  const visible = useMemo(
    () => (category === 'all' ? transactions : transactions.filter((t) => t.category === category)),
    [transactions, category]
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="transactions-filter-select" className="text-sm text-gray-600">
            Category
          </label>
          <select
            id="transactions-filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="p-6 text-sm text-gray-600">No transactions to show.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th scope="col" className="text-left font-medium px-6 py-3">Date</th>
                <th scope="col" className="text-left font-medium px-6 py-3">Description</th>
                <th scope="col" className="text-left font-medium px-6 py-3">Category</th>
                <th scope="col" className="text-right font-medium px-6 py-3">Amount</th>
                <th scope="col" className="text-right font-medium px-6 py-3">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((transaction) => (
                <tr key={transaction.id} id={`transaction-row-${transaction.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">{formatDate(transaction.date)}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {transaction.description}
                    {transaction.status === 'pending' && (
                      <span className="ml-2 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">{transaction.category}</td>
                  <td
                    className={`px-6 py-3 text-right font-semibold whitespace-nowrap ${
                      transaction.amount > 0 ? 'text-action' : 'text-gray-900'
                    }`}
                  >
                    {formatSignedCurrency(transaction.amount, currency)}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-600 whitespace-nowrap">
                    {formatSignedCurrency(transaction.balanceAfter, currency).replace('+', '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
