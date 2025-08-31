import React, { useEffect, useState } from 'react';
import api from '../api';
import dayjs from 'dayjs';
import { useNotification } from '../contexts/NotificationContext';

export default function TransactionList({ reload }){
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(()=> {
    fetchData();
  }, [reload, page]);

  const fetchData = async () => {
    setLoading(true);
    const q = [];
    if (from) q.push('from='+from);
    if (to) q.push('to='+to);
    q.push('page='+page);
    q.push('limit='+limit);
    try {
      const res = await api.get('/api/transactions?'+q.join('&'));
      setItems(res.data.items);
      setTotal(res.data.total || 0);
    } catch (err){
      showNotification('Error fetching transactions: '+err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleFilter = () => {
    setPage(1);
    fetchData();
  }

  const handleClearFilter = () => {
    setFrom('');
    setTo('');
    setPage(1);
    fetchData();
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/api/transactions/${id}`);
        showNotification('Transaction deleted successfully', 'success');
        fetchData(); // Refresh the list and charts
      } catch (err) {
        showNotification('Error deleting transaction: ' + (err.response?.data?.error || err.message), 'error');
      }
    }
  };

  return (
    <div>
      <h3 className="mb-3">Transactions</h3>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <input type="date" className="form-control" value={from} onChange={e=>setFrom(e.target.value)} />
            </div>
            <div className="col-md-4">
              <input type="date" className="form-control" value={to} onChange={e=>setTo(e.target.value)} />
            </div>
            <div className="col-md-4 d-flex justify-content-between">
              <button className="btn btn-primary flex-grow-1 me-2" onClick={handleFilter}>Filter</button>
              <button className="btn btn-secondary flex-grow-1" onClick={handleClearFilter}>Clear Filter</button>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <p className="text-center">No transactions found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th className="text-end">Amount</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it._id}>
                      <td>{dayjs(it.date).format('YYYY-MM-DD')}</td>
                      <td><span className={`badge bg-${it.type === 'income' ? 'success' : 'danger'}`}>{it.type}</span></td>
                      <td>{it.category}</td>
                      <td className="text-end">{it.amount.toFixed(2)}</td>
                      <td>{it.description}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(it._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
              </li>
              <li className="page-item active"><span className="page-link">{page}</span></li>
              <li className={`page-item ${(page * limit) >= total ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
