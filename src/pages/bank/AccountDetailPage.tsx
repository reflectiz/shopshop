import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import TransactionTable from '../../components/Bank/TransactionTable';
import { formatCurrency } from '../../lib/format';
import { useFlavorPath } from '../../flavors/FlavorContext';
import { useAuth } from '../../hooks/useAuth';

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const flavorPath = useFlavorPath();
  const { user } = useAuth();

  const accountQuery = useQuery({
    queryKey: ['bankAccount', user?.id, id],
    enabled: Boolean(id),
    queryFn: () => apiService.getBankAccount(id!),
  });

  const transactionsQuery = useQuery({
    queryKey: ['bankTransactions', user?.id, id],
    enabled: Boolean(id),
    queryFn: () => apiService.getBankTransactions(id!),
  });

  if (accountQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
      </div>
    );
  }

  if (accountQuery.isError || !accountQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Account not found</h2>
          <p className="text-gray-600 mb-6 text-sm">
            This account does not exist, or it does not belong to the signed-in customer.
          </p>
          <Link
            to={flavorPath('accounts')}
            id="account-detail-back-link"
            className="inline-block bg-brand text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-hover transition-colors"
          >
            Back to accounts
          </Link>
        </div>
      </div>
    );
  }

  const account = accountQuery.data;
  const isCredit = account.type === 'credit';
  const owed = isCredit && account.balance < 0;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={flavorPath('accounts')}
          id="account-detail-back-link"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All accounts
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
          <p className="text-sm text-gray-500 font-mono mt-1">
            {account.sortCode ? `${account.sortCode} · ` : ''}
            {account.accountNumberMasked}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">{owed ? 'Balance owed' : 'Balance'}</p>
              <p id="account-detail-balance" className="text-3xl font-bold text-brand mt-0.5">
                {formatCurrency(owed ? Math.abs(account.balance) : account.balance, account.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{isCredit ? 'Available credit' : 'Available'}</p>
              <p id="account-detail-available" className="text-3xl font-bold text-gray-900 mt-0.5">
                {formatCurrency(account.available, account.currency)}
              </p>
            </div>
            <div className="space-y-1 text-sm">
              {typeof account.interestRate === 'number' && (
                <p className="text-gray-600">
                  Interest <span className="font-semibold text-gray-900">{account.interestRate}% AER</span>
                </p>
              )}
              {typeof account.creditLimit === 'number' && (
                <p className="text-gray-600">
                  Credit limit{' '}
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(account.creditLimit, account.currency)}
                  </span>
                </p>
              )}
              {typeof account.arrangedOverdraft === 'number' && account.arrangedOverdraft > 0 && (
                <p className="text-gray-600">
                  Overdraft{' '}
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(account.arrangedOverdraft, account.currency)}
                  </span>
                </p>
              )}
              {account.paymentDueDate && (
                <p className="text-gray-600">
                  Payment due <span className="font-semibold text-gray-900">{account.paymentDueDate}</span>
                </p>
              )}
              {account.maturesAt && (
                <p className="text-gray-600">
                  Matures <span className="font-semibold text-gray-900">{account.maturesAt}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {transactionsQuery.isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
          </div>
        ) : (
          <TransactionTable
            transactions={transactionsQuery.data ?? []}
            currency={account.currency}
          />
        )}
      </div>
    </div>
  );
};

export default AccountDetailPage;
