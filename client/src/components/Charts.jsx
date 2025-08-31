import React, { useEffect, useState } from 'react';
import api from '../api';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { useNotification } from '../contexts/NotificationContext';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function Charts({ reload }){
  const [byCategory, setByCategory] = useState([]);
  const [byDate, setByDate] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(()=> {
    fetchData();
  }, [reload]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/transactions/summary');
      setByCategory(res.data.byCategory || []);
      setByDate(res.data.byDate || []);
    } catch (err) {
      showNotification('Error fetching chart data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1, // This will make the chart a perfect circle
  };

  const colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#E7E9ED',
    '#7CFC00',
    '#FFD700',
    '#8A2BE2',
  ];

  const catData = {
    labels: byCategory.map(b => b._id),
    datasets: [{
      label: 'Expense by Category',
      data: byCategory.map(b => b.total),
      backgroundColor: colors.slice(0, byCategory.length),
    }]
  };
  const dateData = {
    labels: byDate.map(d => d._id),
    datasets: [{
      label: 'Expense by Date',
      data: byDate.map(d => d.total),
      backgroundColor: colors.slice(0, byDate.length),
    }]
  };

  return (
    <div>
      <h3 className="mb-3">Charts</h3>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {byCategory.length === 0 && byDate.length === 0 ? (
            <p className="text-center">No data available for charts.</p>
          ) : (
            <div className="row">
              <div className="col-md-6">
                <div className="chart-container mb-4">
                  <h4>Expenses by Category</h4>
                  <Pie data={catData} options={chartOptions} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="chart-container">
                  <h4>Expenses by Date</h4>
                  <Pie data={dateData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
