import React, { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Charts from '../components/Charts';
import ReceiptUpload from '../components/ReceiptUpload';
import { useAuth } from '../contexts/AuthContext';

function DashboardPage() {
  const [reload, setReload] = useState(0);
  const { user } = useAuth();

  return (
    <div className="container mt-4 py-3 px-3">
       <div className="row d-flex align-items-stretch">
        <div className="col-lg-6">
          <div className="card shadow-sm mb-4 h-100">
            <div className="card-body">
              <TransactionForm onDone={() => setReload(n => n + 1)} />
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
              <ReceiptUpload onParsed={() => setReload(n => n + 1)} />
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
