import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ITEMS_API = import.meta.env.VITE_API_URL + '/items';
const SALES_API = import.meta.env.VITE_API_URL + '/sales';

export default function PurchaseEntry() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(ITEMS_API);
        setItems(res.data);
      } catch (err) {
        setError('Failed to fetch items');
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  // Add item to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedItem || quantity < 1) {
      setError('Select an item and enter a valid quantity');
      return;
    }
    const itemObj = items.find(i => i._id === selectedItem);
    if (!itemObj) {
      setError('Invalid item selected');
      return;
    }
    // Check if already in cart
    const existing = cart.find(c => c._id === selectedItem);
    if (existing) {
      setCart(cart.map(c => c._id === selectedItem ? { ...c, quantity: c.quantity + Number(quantity) } : c));
    } else {
      setCart([...cart, { ...itemObj, quantity: Number(quantity) }]);
    }
    setSelectedItem('');
    setQuantity(1);
  };

  // Remove item from cart
  const handleRemove = (id) => {
    setCart(cart.filter(c => c._id !== id));
  };

  // Submit purchase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }
    setLoading(true);
    try {
      // Send each cart item as a sale
      await Promise.all(cart.map(item =>
        axios.post(SALES_API, {
          itemName: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })
      ));
      setSuccess('Purchase recorded!');
      setCart([]);
    } catch (err) {
      setError('Failed to record purchase');
    }
    setLoading(false);
  };

  return (
    <div className="homepage-container">
      <div className="page-content">
        <Link className="card-link" to="/">← Back</Link>
        <h2 className="homepage-title">Purchase Entry</h2>
        <form onSubmit={handleAddToCart} style={{marginBottom: '2rem', width: '100%', maxWidth: 400}}>
          <div style={{display: 'flex', gap: '1rem', marginBottom: 8}}>
            <select
              value={selectedItem}
              onChange={e => setSelectedItem(e.target.value)}
              style={{flex: 2, padding: '0.7em', borderRadius: 8, border: '1px solid #e0e7ff'}}
            >
              <option value="">Select item</option>
              {items.map(item => (
                <option key={item._id} value={item._id}>{item.name} (₹{item.price})</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              style={{width: 80, padding: '0.7em', borderRadius: 8, border: '1px solid #e0e7ff'}}
              placeholder="Qty"
            />
            <button type="submit" className="card-link" style={{padding: '0.7em 1.2em'}}>Add</button>
          </div>
        </form>
        {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
        {success && <div style={{color: 'green', marginBottom: 8}}>{success}</div>}
        <div style={{width: '100%', maxWidth: 500, marginBottom: 24}}>
          {cart.length === 0 ? (
            <div style={{color: '#888'}}>Cart is empty.</div>
          ) : (
            <ul style={{listStyle: 'none', padding: 0}}>
              {cart.map(item => (
                <li key={item._id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ff', marginBottom: 12, padding: '1em 1.2em'}}>
                  <div>
                    <div style={{fontWeight: 600, fontSize: '1.1em'}}>{item.name}</div>
                    <div style={{color: '#6366f1'}}>₹ {item.price} × {item.quantity} = ₹ {item.price * item.quantity}</div>
                  </div>
                  <button onClick={() => handleRemove(item._id)} style={{background: '#f87171', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5em 1em', cursor: 'pointer', fontWeight: 500}}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{width: '100%', maxWidth: 400}}>
          <button type="submit" className="card-link" style={{width: '100%', padding: '0.9em', fontSize: '1.1em'}} disabled={loading || cart.length === 0}>
            {loading ? 'Processing...' : 'Submit Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
} 