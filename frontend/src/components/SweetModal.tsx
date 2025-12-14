import React, { useState, useEffect } from 'react';
import { Sweet, SweetCategory, CreateSweetData } from '../types';

/**
 * Props for SweetModal component
 */
interface SweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSweetData) => Promise<void>;
  sweet?: Sweet | null;
  title: string;
}

/**
 * Modal for creating/editing sweets
 */
const SweetModal: React.FC<SweetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sweet,
  title,
}) => {
  const [formData, setFormData] = useState<CreateSweetData>({
    name: '',
    description: '',
    category: SweetCategory.OTHER,
    price: 0,
    quantity: 0,
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or sweet changes
  useEffect(() => {
    if (sweet) {
      setFormData({
        name: sweet.name,
        description: sweet.description || '',
        category: sweet.category,
        price: sweet.price,
        quantity: sweet.quantity,
        imageUrl: sweet.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: SweetCategory.OTHER,
        price: 0,
        quantity: 0,
        imageUrl: '',
      });
    }
    setError('');
  }, [sweet, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter sweet name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {Object.values(SweetCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="price">
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                className="form-input"
                value={formData.price}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="quantity">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className="form-input"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="imageUrl">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                className="form-input"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : sweet ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SweetModal;
