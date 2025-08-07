import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SALES_API = import.meta.env.VITE_API_URL + '/sales';
console.log('Using SALES_API:', SALES_API);
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getTodayString() {
  return formatDate(new Date());
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

export default function SalesDashboard() {
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
          <h2 className="homepage-title">Sales Dashboard</h2>
          <form onSubmit={e => { e.preventDefault(); if (input === PASSWORD) setAuth(true); else setInput(''); }} style={{marginTop: 40}}>
            <input type="password" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter password" style={{padding: '0.7em', borderRadius: 8, border: '1px solid #e0e7ff', marginRight: 8}} />
            <button className="card-link" type="submit">Submit</button>
          </form>
          {input !== '' && input !== PASSWORD && <div style={{color: 'red', marginTop: 8}}>Incorrect password</div>}
        </div>
      </div>
    );
  }

  // Filter today's sales
  const today = getTodayString();
  const todaysSales = sales.filter(sale => formatDate(new Date(sale.date)) === today);
  const { summary, totalRevenue } = aggregateSales(todaysSales);

  // Download CSV
  const handleDownloadCSV = () => {
    const csv = toCSV(summary);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="homepage-container">
      <div className="page-content">
        <Link className="card-link" to="/">← Back</Link>
        <h2 className="homepage-title">Sales Dashboard</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
        <div style={{width: '100%', maxWidth: 700, margin: '0 auto'}}>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginBottom: 24}}>
            {Object.keys(summary).length === 0 ? (
              <div style={{color: '#888', fontWeight: 500, fontSize: '1.1em'}}>No sales today.</div>
            ) : (
              Object.entries(summary).map(([name, data]) => (
                <div key={name} style={{background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #e0e7ff', padding: '1.5em 2em', minWidth: 220, flex: '1 1 220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{fontWeight: 700, fontSize: '1.2em', color: '#2d3748', marginBottom: 8}}>{name}</div>
                  <div style={{fontWeight: 500, color: '#6366f1', fontSize: '1.1em', marginBottom: 4}}>Qty: {data.quantity}</div>
                  <div style={{fontWeight: 600, color: '#10b981', fontSize: '1.1em'}}>₹ {data.revenue}</div>
                </div>
              ))
            )}
          </div>
          <div style={{marginTop: 16, textAlign: 'right'}}>
            <button className="card-link" style={{padding: '0.5em 1.2em'}} onClick={fetchSales} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div style={{marginTop: 24, fontWeight: 700, fontSize: '1.2em', color: '#6366f1', textAlign: 'right'}}>
            Total Revenue: ₹ {totalRevenue}
          </div>
        </div>
      </div>
    </div>
  );
} 