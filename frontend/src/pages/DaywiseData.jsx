import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SALES_API = 'http://localhost:5000/api/sales';

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function groupSalesByDate(sales) {
  const grouped = {};
  for (const sale of sales) {
    const dateStr = formatDate(new Date(sale.date));
    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push(sale);
  }
  return grouped;
}

function aggregateSales(sales) {
  const summary = {};
  let totalRevenue = 0;
  for (const sale of sales) {
    if (!summary[sale.itemName]) {
      summary[sale.itemName] = { quantity: 0, revenue: 0 };
    }
    summary[sale.itemName].quantity += sale.quantity;
    summary[sale.itemName].revenue += sale.total;
    totalRevenue += sale.total;
  }
  return { summary, totalRevenue };
}

function toCSV(salesSummary) {
  let csv = 'Item Name,Quantity,Revenue (₹)\n';
  for (const [name, data] of Object.entries(salesSummary)) {
    csv += `${name},${data.quantity},${data.revenue}\n`;
  }
  return csv;
}

export default function DaywiseData() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auth, setAuth] = useState(false);
  const [input, setInput] = useState('');
  const PASSWORD = 'pinky';

  const fetchSales = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(SALES_API);
      setSales(res.data);
    } catch (err) {
      setError('Failed to fetch sales');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  if (!auth) {
    return (
      <div className="homepage-container">
        <div className="page-content">
          <h2 className="homepage-title">Day-wise Data</h2>
          <form onSubmit={e => { e.preventDefault(); if (input === PASSWORD) setAuth(true); else setInput(''); }} style={{marginTop: 40}}>
            <input type="password" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter password" style={{padding: '0.7em', borderRadius: 8, border: '1px solid #e0e7ff', marginRight: 8}} />
            <button className="card-link" type="submit">Submit</button>
          </form>
          {input !== '' && input !== PASSWORD && <div style={{color: 'red', marginTop: 8}}>Incorrect password</div>}
        </div>
      </div>
    );
  }

  const grouped = groupSalesByDate(sales);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a)); // newest first

  const handleDownloadCSV = (summary, date) => {
    const csv = toCSV(summary);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="homepage-container">
      <div className="page-content">
        <Link className="card-link" to="/">← Back</Link>
        <h2 className="homepage-title">Day-wise Data</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
        <div style={{width: '100%', maxWidth: 700, margin: '0 auto'}}>
          {dates.length === 0 ? (
            <div style={{color: '#888'}}>No sales data available.</div>
          ) : (
            dates.map(date => {
              const { summary, totalRevenue } = aggregateSales(grouped[date]);
              return (
                <div key={date} style={{marginBottom: 36, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #e0e7ff', padding: '1.5em 1.2em'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                    <div style={{fontWeight: 600, fontSize: '1.1em'}}>Date: {date}</div>
                    <button className="card-link" onClick={() => handleDownloadCSV(summary, date)} style={{padding: '0.5em 1.2em'}}>Download CSV</button>
                  </div>
                  <table style={{width: '100%', borderCollapse: 'collapse', background: '#fff'}}>
                    <thead>
                      <tr style={{background: '#e0e7ff'}}>
                        <th style={{padding: '0.7em'}}>Item Name</th>
                        <th style={{padding: '0.7em'}}>Quantity</th>
                        <th style={{padding: '0.7em'}}>Revenue (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(summary).length === 0 ? (
                        <tr><td colSpan={3} style={{textAlign: 'center', color: '#888', padding: '1.2em'}}>No sales.</td></tr>
                      ) : (
                        Object.entries(summary).map(([name, data]) => (
                          <tr key={name}>
                            <td style={{padding: '0.7em', fontWeight: 500}}>{name}</td>
                            <td style={{padding: '0.7em'}}>{data.quantity}</td>
                            <td style={{padding: '0.7em'}}>₹ {data.revenue}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div style={{marginTop: 16, fontWeight: 700, fontSize: '1.1em', color: '#6366f1', textAlign: 'right'}}>
                    Total Revenue: ₹ {totalRevenue}
                  </div>
                </div>
              );
            })
          )}
          <div style={{marginTop: 16, textAlign: 'right'}}>
            <button className="card-link" style={{padding: '0.5em 1.2em'}} onClick={fetchSales} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 