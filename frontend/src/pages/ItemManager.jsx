import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL + '/items';

export default function ItemManager() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Fetch items from backend
  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API_URL);
      setItems(res.data);
    } catch (err) {
      setError('Failed to fetch items');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add new item
  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || !price) {
      setError('Name and price are required');
      return;
    }
    try {
      const res = await axios.post(API_URL, { name, price: Number(price) });
      setSuccess('Item added!');
      setName('');
      setPrice('');
      setItems([...items, res.data]);
    } catch (err) {
      setError('Failed to add item');
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_URL}/${id}`);
      setItems(items.filter((item) => item._id !== id));
      setSuccess('Item deleted');
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  // Start editing
  const handleEdit = (item) => {
    setEditId(item._id);
    setEditName(item.name);
    setEditPrice(item.price);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditId(null);
    setEditName('');
    setEditPrice('');
  };

  // Save edit
  const handleSave = async (id) => {
    setError('');
    setSuccess('');
    if (!editName.trim() || !editPrice) {
      setError('Name and price are required');
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/${id}`, { name: editName, price: Number(editPrice) });
      setItems(items.map(item => item._id === id ? res.data : item));
      setSuccess('Item updated!');
      setEditId(null);
      setEditName('');
      setEditPrice('');
    } catch (err) {
      setError('Failed to update item');
    }
  };

  return (
    <div className="homepage-container">
      <div className="page-content">
        <Link className="card-link" to="/">← Back</Link>
        <h2 className="homepage-title">Item Manager</h2>
        <form onSubmit={handleAdd} style={{marginBottom: '2rem', width: '100%', maxWidth: 400}}>
          <div style={{display: 'flex', gap: '1rem', marginBottom: 8}}>
            <input
              type="text"
              placeholder="Item name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{flex: 1, padding: '0.7em', borderRadius: 8, border: '1px solid #e0e7ff'}}
            />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={{width: 100, padding: '0.7em', borderRadius: 8, border: '1px solid #e0e7ff'}}
              min="0"
              step="0.01"
            />
            <button type="submit" className="card-link" style={{padding: '0.7em 1.2em'}}>Add</button>
          </div>
        </form>
        {loading && <div>Loading...</div>}
        {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
        {success && <div style={{color: 'green', marginBottom: 8}}>{success}</div>}
        <div style={{width: '100%', maxWidth: 500}}>
          {items.length === 0 && !loading ? (
            <div style={{color: '#888'}}>No items found.</div>
          ) : (
            <ul style={{listStyle: 'none', padding: 0}}>
              {items.map(item => (
                <li key={item._id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ff', marginBottom: 12, padding: '1em 1.2em'}}>
                  {editId === item._id ? (
                    <>
                      <div style={{display: 'flex', flexDirection: 'column', flex: 1, gap: 4}}>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          style={{marginBottom: 4, padding: '0.5em', borderRadius: 8, border: '1px solid #e0e7ff'}}
                        />
                        <input
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          style={{padding: '0.5em', borderRadius: 8, border: '1px solid #e0e7ff'}}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                        <button onClick={() => handleSave(item._id)} style={{background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5em 1em', cursor: 'pointer', fontWeight: 500, marginBottom: 4}}>Save</button>
                        <button onClick={handleCancel} style={{background: '#f87171', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5em 1em', cursor: 'pointer', fontWeight: 500}}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div style={{fontWeight: 600, fontSize: '1.1em'}}>{item.name}</div>
                        <div style={{color: '#6366f1'}}>₹ {item.price}</div>
                      </div>
                      <div style={{display: 'flex', gap: 8}}>
                        <button onClick={() => handleEdit(item)} style={{background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5em 1em', cursor: 'pointer', fontWeight: 500, marginRight: 6}}>Edit</button>
                        <button onClick={() => handleDelete(item._id)} style={{background: '#f87171', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5em 1em', cursor: 'pointer', fontWeight: 500}}>Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 