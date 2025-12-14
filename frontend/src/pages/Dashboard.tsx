import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Sweet, SweetCategory, CreateSweetData } from '../types';
import { sweetsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SweetCard from '../components/SweetCard';
import SweetModal from '../components/SweetModal';
import RestockModal from '../components/RestockModal';

/**
 * Dashboard page component
 * Displays all sweets with search and filter functionality
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Search and filter state
  const [searchName, setSearchName] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null);

  const isAdmin = user?.role === 'admin';

  /**
   * Fetch sweets from API
   */
  const fetchSweets = useCallback(async () => {
    setLoading(true);
    try {
      const hasFilters = searchName || filterCategory || minPrice || maxPrice;

      if (hasFilters) {
        const response = await sweetsApi.search({
          name: searchName || undefined,
          category: filterCategory as SweetCategory || undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        });
        setSweets(response.data);
      } else {
        const response = await sweetsApi.getAll();
        setSweets(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch sweets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchName, filterCategory, minPrice, maxPrice]);

  // Fetch sweets on mount and when filters change
  useEffect(() => {
    fetchSweets();
  }, [fetchSweets]);

  /**
   * Handle purchasing a sweet
   */
  const handlePurchase = async (id: string) => {
    setPurchasing(id);
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
    } finally {
      setPurchasing(null);
    }
  };

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
   * Open edit modal
   */
  const openEditModal = (sweet: Sweet) => {
    setSelectedSweet(sweet);
    setIsEditModalOpen(true);
  };

  /**
   * Open restock modal
   */
  const openRestockModal = (sweet: Sweet) => {
    setSelectedSweet(sweet);
    setIsRestockModalOpen(true);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchName('');
    setFilterCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">🍬 Sweet Shop</h1>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Add Sweet
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="search-filter-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <select
          className="form-select filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {Object.values(SweetCategory).map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="form-input"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          min="0"
          style={{ width: '120px' }}
        />
        <input
          type="number"
          className="form-input"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          min="0"
          style={{ width: '120px' }}
        />
        {(searchName || filterCategory || minPrice || maxPrice) && (
          <button className="btn btn-outline btn-sm" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
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
          <h3>No sweets found</h3>
          <p>
            {searchName || filterCategory || minPrice || maxPrice
              ? 'Try adjusting your filters'
              : 'Start by adding some sweet treats!'}
          </p>
        </div>
      ) : (
        <div className="sweets-grid">
          {sweets.map((sweet) => (
            <SweetCard
              key={sweet.id}
              sweet={sweet}
              onPurchase={handlePurchase}
              onEdit={isAdmin ? openEditModal : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
              onRestock={isAdmin ? openRestockModal : undefined}
              purchasing={purchasing === sweet.id}
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

export default Dashboard;
