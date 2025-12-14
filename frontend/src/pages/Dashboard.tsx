import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Sweet, SweetCategory } from '../types';
import { sweetsApi } from '../services/api';
import SweetCard from '../components/SweetCard';

/**
 * Dashboard page component
 * Displays all sweets with search and filter functionality
 */
const Dashboard: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [searchName, setSearchName] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
        <h1 className="dashboard-title">Sweet Shop</h1>
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
          <div className="empty-state-icon">Sweet</div>
          <h3>No sweets found</h3>
          <p>
            {searchName || filterCategory || minPrice || maxPrice
              ? 'Try adjusting your filters'
              : 'No sweets available at the moment'}
          </p>
        </div>
      ) : (
        <div className="sweets-grid">
          {sweets.map((sweet) => (
            <SweetCard key={sweet.id} sweet={sweet} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
