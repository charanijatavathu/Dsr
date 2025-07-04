import { Link, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import ItemManager from './pages/ItemManager';
import PurchaseEntry from './pages/PurchaseEntry';
import SalesDashboard from './pages/SalesDashboard';
import DaywiseData from './pages/DaywiseData';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/item-manager" element={<ItemManager />} />
      <Route path="/purchase-entry" element={<PurchaseEntry />} />
      <Route path="/sales-dashboard" element={<SalesDashboard />} />
      <Route path="/daywise-data" element={<DaywiseData />} />
    </Routes>
  );
}

export default App;
