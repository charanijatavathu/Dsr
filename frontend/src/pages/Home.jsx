import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';

const SALES_API = 'http://localhost:5000/api/sales';

const cards = [
  {
    title: 'Item Manager',
    desc: 'Add, edit, and delete food items with name and price.',
    link: '/item-manager',
  },
  {
    title: 'Purchase Entry',
    desc: 'Select items and quantity to simulate a customer purchase.',
    link: '/purchase-entry',
  },
  {
    title: 'Sales Dashboard',
    desc: "View today's sales summary, item-wise revenue, and download CSV.",
    link: '/sales-dashboard',
  },
  {
    title: 'Day-wise Data',
    desc: 'See daily breakdown of sales per item and date, with CSV export.',
    link: '/daywise-data',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12 } }),
};

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true
  });
}

export default function Home() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(SALES_API);
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecent(sorted.slice(0, 10));
    } catch (err) {
      setError('Failed to fetch recent sales');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  return (
    <div className="homepage-container">
      <h1 className="homepage-title">Dsr_Kitchens Sales Tracking</h1>
      <div className="card-grid">
        {cards.map((card, i) => (
          <motion.div
            className="home-card"
            key={card.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="card-title">{card.title}</div>
            <div className="card-desc">{card.desc}</div>
            <Link className="card-link" to={card.link}>
              Go to {card.title}
            </Link>
          </motion.div>
        ))}
      </div>
      <div style={{width: '100%', maxWidth: 600, margin: '2.5em auto 0'}}>
        <h3 style={{fontWeight: 700, fontSize: '1.3em', marginBottom: 12, color: '#2d3748'}}>Recent Transactions</h3>
        {loading && <div>Loading...</div>}
        {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
        {recent.length === 0 && !loading ? (
          <div style={{color: '#888'}}>No recent sales.</div>
        ) : (
          <div style={{width: '100%'}}>
            <div style={{display: 'flex', fontWeight: 700, color: '#6366f1', background: '#e0e7ff', borderRadius: 8, marginBottom: 6, padding: '0.7em 1.2em', fontSize: '1em'}}>
              <div style={{flex: 0.5, textAlign: 'center'}}>Sl No</div>
              <div style={{flex: 2}}>Item</div>
              <div style={{flex: 1, textAlign: 'center'}}>Qty</div>
              <div style={{flex: 1, textAlign: 'center'}}>Revenue</div>
              <div style={{flex: 2, textAlign: 'right'}}>Date/Time</div>
            </div>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {recent.map((sale, idx) => (
                <li key={sale._id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ff', marginBottom: 10, padding: '0.9em 1.2em', fontSize: '1em'}}>
                  <div style={{flex: 0.5, textAlign: 'center', fontWeight: 600}}>{idx + 1}</div>
                  <div style={{flex: 2, fontWeight: 600}}>{sale.itemName}</div>
                  <div style={{flex: 1, color: '#6366f1', textAlign: 'center'}}>Qty: {sale.quantity}</div>
                  <div style={{flex: 1, color: '#10b981', textAlign: 'center'}}>₹{sale.total}</div>
                  <div style={{flex: 2, color: '#6b7280', textAlign: 'right', fontSize: '0.97em'}}>{formatDateTime(sale.date)}</div>
                </li>
              ))}
            </ul>
            <button className="card-link" style={{marginTop: 12, padding: '0.5em 1.2em'}} onClick={fetchRecent} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 