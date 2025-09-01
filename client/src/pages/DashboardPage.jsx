import React, { useState, useCallback } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Charts from '../components/Charts';
import ReceiptUpload from '../components/ReceiptUpload';
import { useAuth } from '../contexts/AuthContext';

function DashboardPage() {
  const [reload, setReload] = useState(0);
  const { user } = useAuth();
  const [addTransactionFn, setAddTransactionFn] = useState(null);

  const handleSetAddTransactionFn = useCallback((fn) => {
    setAddTransactionFn(() => fn);
  }, []);

  const handleSuggestion = useCallback(async (suggestion) => {
    if (addTransactionFn) {
      const success = await addTransactionFn({
        type: 'expense',
        amount: suggestion.amount,
        category: suggestion.category || 'Uncategorized',
        description: suggestion.description,
        date: suggestion.date || new Date().toISOString().slice(0, 10),
      });
      if (success) {
        setReload(n => n + 1);
      }
    } else {
      console.warn('addTransaction function not available yet.');
    }
  }, [addTransactionFn]);

  return (
    <div className="container mt-4 py-3 px-3">
       <div className="row d-flex align-items-stretch">
        <div className="col-lg-6">
          <div className="card shadow-sm mb-4 h-100">
            <div className="card-body">
              <TransactionForm onDone={() => setReload(n => n + 1)} onAddTransaction={handleSetAddTransactionFn} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm mb-4 h-100">
            <div className="card-body">
              <Charts reload={reload} />
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <ReceiptUpload onParsed={() => setReload(n => n + 1)} onSuggestion={handleSuggestion} />
            </div>
          </div>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="card-body">
          <TransactionList reload={reload} />
        </div>
      </div>
      <footer className="text-center text-muted mt-5 mb-3">
        <p>Personal Finance Assistant by Shekhar Nayak</p>
      </footer>
    </div>
  );
}

export default DashboardPage;
