import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import AccountCard from '../../components/Bank/AccountCard';
import { formatCurrency } from '../../lib/format';
import { useAuth } from '../../hooks/useAuth';

/**
 * The bank site's index. Deliberately not the shared marketing HomePage: once you are signed
 * in to a bank you expect balances, not a hero image.
 */
const AccountsPage: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bankAccounts', user?.id],
    queryFn: () => apiService.getBankAccounts(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand mb-4" />
          <p className="text-gray-600 text-lg">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Could not load your accounts</h2>
          <p className="text-red-600 mb-4 text-sm">
            {error instanceof Error ? error.message : 'Please try again.'}
          </p>
          <button
            id="accounts-retry-button"
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const accounts = data?.accounts ?? [];
  const currency = data?.currency ?? 'USD';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Total position across every account */}
        <div className="bg-gradient-to-br from-heroFrom via-heroVia to-heroTo rounded-xl p-8 text-white mb-8 shadow-lg">
          <p className="text-sm text-white/80">
            {user?.name ? `Good to see you, ${user.name.split(' ')[0]}` : 'Your money'}
          </p>
          <p className="text-sm text-white/80 mt-4">Total balance</p>
          <p id="accounts-total-balance" className="text-4xl sm:text-5xl font-extrabold mt-1">
            {formatCurrency(data?.totalBalance ?? 0, currency)}
          </p>
          <p className="text-xs text-white/70 mt-3">
            Across {accounts.length} account{accounts.length === 1 ? '' : 's'}. Credit card balances are
            included as money owed.
          </p>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Your accounts</h2>

        {accounts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-600">This customer has no Northbank accounts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsPage;
