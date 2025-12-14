import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Sweet, CreateSweetData } from '../types';
import { sweetsApi } from '../services/api';
import SweetCard from '../components/SweetCard';
import SweetModal from '../components/SweetModal';
import RestockModal from '../components/RestockModal';

/**
 * Admin panel page component
 * Provides admin-specific functionality for managing sweets
 */
const AdminPanel: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null);

  /**
   * Fetch all sweets
   */
  const fetchSweets = async () => {
    setLoading(true);
    try {
      const response = await sweetsApi.getAll();
      setSweets(response.data);
    } catch (error) {
      toast.error('Failed to fetch sweets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  /**
   * Handle creating a new sweet
   */
  const handleCreateSweet = async (data: CreateSweetData) => {
    const response = await sweetsApi.create(data);
    if (response.success) {
      toast.success('Sweet created successfully!');
      setSweets((prev) => [response.data, ...prev]);
    }
  };

  /**
   * Handle updating a sweet
   */
  const handleUpdateSweet = async (data: CreateSweetData) => {
    if (!selectedSweet) return;
    const response = await sweetsApi.update(selectedSweet.id, data);
    if (response.success) {
      toast.success('Sweet updated successfully!');
      setSweets((prev) =>
        prev.map((s) => (s.id === selectedSweet.id ? response.data : s))
      );
    }
  };

  /**
   * Handle deleting a sweet
   */
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) return;

    try {
      await sweetsApi.delete(id);
      toast.success('Sweet deleted successfully!');
      setSweets((prev) => prev.filter((s) => s.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  /**
   * Handle restocking a sweet
   */
  const handleRestock = async (id: string, quantity: number) => {
    const response = await sweetsApi.restock(id, quantity);
    if (response.success) {
      toast.success(response.message || 'Restock successful!');
      setSweets((prev) =>
        prev.map((s) => (s.id === id ? response.data : s))
      );
    }
  };

  /**
   * Handle purchase (for testing)
   */
  const handlePurchase = async (id: string) => {
    try {
      const response = await sweetsApi.purchase(id, 1);
      if (response.success) {
        toast.success(response.message || 'Purchase successful!');
        setSweets((prev) =>
          prev.map((s) => (s.id === id ? response.data : s))
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    }
  };

  /**
   * Calculate statistics
   */
  const stats = {
    totalSweets: sweets.length,
    totalStock: sweets.reduce((sum, s) => sum + s.quantity, 0),
    outOfStock: sweets.filter((s) => s.quantity === 0).length,
    totalValue: sweets.reduce((sum, s) => sum + s.price * s.quantity, 0),
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">🔧 Admin Panel</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Add Sweet
        </button>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Total Products
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' }}>
            {stats.totalSweets}
          </p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Total Stock
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success-color)' }}>
            {stats.totalStock}
          </p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Out of Stock
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--danger-color)' }}>
            {stats.outOfStock}
          </p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Inventory Value
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary-color)' }}>
            ${stats.totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Sweets Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading sweets...</p>
        </div>
      ) : sweets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍬</div>
          <h3>No sweets yet</h3>
          <p>Start by adding some sweet treats to your inventory!</p>
        </div>
      ) : (
        <div className="sweets-grid">
          {sweets.map((sweet) => (
            <SweetCard
              key={sweet.id}
              sweet={sweet}
              onPurchase={handlePurchase}
              onEdit={(s) => {
                setSelectedSweet(s);
                setIsEditModalOpen(true);
              }}
              onDelete={handleDelete}
              onRestock={(s) => {
                setSelectedSweet(s);
                setIsRestockModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <SweetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSweet}
        title="Add New Sweet"
      />

      {/* Edit Modal */}
      <SweetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSweet(null);
        }}
        onSubmit={handleUpdateSweet}
        sweet={selectedSweet}
        title="Edit Sweet"
      />

      {/* Restock Modal */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setSelectedSweet(null);
        }}
        onSubmit={handleRestock}
        sweet={selectedSweet}
      />
    </div>
  );
};

export default AdminPanel;
