import React from 'react';
import { Link } from 'react-router-dom';
import { BankAccount } from '../../services/api';
import { formatCurrency } from '../../lib/format';
import { useFlavorPath } from '../../flavors/FlavorContext';

/**
 * Follows ProductCard's structure and styling conventions but has no cart CTA — money is not
 * a purchasable item, and bending the shared card to fit would compromise both.
 */
const TYPE_LABELS: Record<BankAccount['type'], string> = {
  checking: 'Current account',
  savings: 'Savings',
  credit: 'Credit card',
};

const AccountCard: React.FC<{ account: BankAccount }> = ({ account }) => {
  const flavorPath = useFlavorPath();
  const isCredit = account.type === 'credit';
  // On a credit card a negative balance is money owed, which reads better as a positive
  // "balance owed" figure than as a minus sign.
  const owed = isCredit && account.balance < 0;

  return (
    <Link
      to={flavorPath(`accounts/${account.id}`)}
      id={`account-card-${account.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 group"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {TYPE_LABELS[account.type]}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand transition-colors">
            {account.name}
          </h3>
          <p className="text-sm text-gray-500 font-mono mt-0.5">
            {account.sortCode ? `${account.sortCode} · ` : ''}
            {account.accountNumberMasked}
          </p>
        </div>
        <svg
          className="w-5 h-5 text-gray-300 group-hover:text-brand transition-colors flex-shrink-0 mt-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <p className="text-xs text-gray-500">{owed ? 'Balance owed' : 'Balance'}</p>
      <p
        id={`account-balance-${account.id}`}
        className={`text-3xl font-bold ${owed ? 'text-gray-900' : 'text-brand'}`}
      >
        {formatCurrency(owed ? Math.abs(account.balance) : account.balance, account.currency)}
      </p>

      <dl className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-1">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-600">{isCredit ? 'Available credit' : 'Available'}</dt>
          <dd className="font-medium text-gray-900">
            {formatCurrency(account.available, account.currency)}
          </dd>
        </div>
        {typeof account.interestRate === 'number' && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-600">Interest rate</dt>
            <dd className="font-medium text-gray-900">{account.interestRate}% AER</dd>
          </div>
        )}
        {isCredit && account.paymentDueDate && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-600">Payment due</dt>
            <dd className="font-medium text-gray-900">{account.paymentDueDate}</dd>
          </div>
        )}
        {account.maturesAt && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-600">Matures</dt>
            <dd className="font-medium text-gray-900">{account.maturesAt}</dd>
          </div>
        )}
      </dl>
    </Link>
  );
};

export default AccountCard;
