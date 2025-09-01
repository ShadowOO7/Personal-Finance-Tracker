import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNotification } from '../contexts/NotificationContext';

export default function TransactionForm({ onDone, suggestion, onAddTransaction }){
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (suggestion) {
      setAmount(suggestion.amount || '');
      setDescription(suggestion.description || '');
      setDate(suggestion.date || new Date().toISOString().slice(0,10));
      setCategory(suggestion.category || 'General');
    }
  }, [suggestion]);

  const addTransaction = async (data) => {
    setLoading(true);
    try {
      await api.post('/api/transactions', data);
      setAmount(''); setDescription(''); setCategory('General');
      if (onDone) onDone();
      showNotification('Transaction added successfully', 'success');
      return true;
    } catch (err) {
      showNotification('Error: ' + (err.response?.data?.error || err.message), 'error');
      return false;
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (onAddTransaction) {
      onAddTransaction(addTransaction);
    }
  }, [onAddTransaction, addTransaction]);

  const submit = async (e) => {
    e.preventDefault();
    await addTransaction({ type, amount: parseFloat(amount), category, description, date });
  }

  return (
    <div>
      <h3 className="mb-3">Add Transaction</h3>
      <form onSubmit={submit}>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Type</label>
            <select className="form-select" value={type} onChange={e=>setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="col">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <input className="form-control" placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
