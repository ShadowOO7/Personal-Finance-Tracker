import React, { useState } from 'react';
import api from '../api';
import { useNotification } from '../contexts/NotificationContext';

export default function ReceiptUpload({ onParsed, onSuggestion }){
  const [file, setFile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const upload = async () => {
    if (!file) return showNotification('Choose a PDF file', 'error');
    const fd = new FormData();
    fd.append('file', file);
    setLoading(true);
    try {
      const res = await api.post('/api/parse-receipt', fd, { headers: {'Content-Type':'multipart/form-data'}});
      setSuggestions(res.data.suggestions || []);
      if (res.data.suggestions?.length > 0) {
        showNotification('Receipt parsed successfully', 'success');
      } else {
        showNotification('No suggestions found in the receipt', 'error');
      }
    } catch (err){
      showNotification('Parse error: ' + (err.response?.data?.error || err.message), 'error');
    } finally { setLoading(false); }
  }

  const handleAddSuggestion = (s) => {
    if (onSuggestion) onSuggestion(s);
    setSuggestions(suggestions.filter(i => i !== s));
  }

  return (
    <div className="mt-4">
      <h4 className="mb-3">Upload Receipt (PDF)</h4>
      <div className="input-group mb-3">
        <input type="file" className="form-control" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
        <button className="btn btn-outline-secondary" onClick={upload} disabled={loading}>
          {loading ? 'Parsing...' : 'Parse PDF'}
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-3">
          <h5>Suggestions:</h5>
          <ul className="list-group">
            {suggestions.map((s, idx) => (
              <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Amount:</strong> {s.amount} <br />
                  <small className="text-muted">{s.description}</small>
                </div>
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleAddSuggestion(s)}>Add</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
