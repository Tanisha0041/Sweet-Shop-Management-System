import React, { useState } from 'react';
import { Sweet } from '../types';

/**
 * Props for RestockModal component
 */
interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, quantity: number) => Promise<void>;
  sweet: Sweet | null;
}

/**
 * Modal for restocking sweets
 */
const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sweet,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sweet || quantity <= 0) return;

    setLoading(true);
    setError('');

    try {
      await onSubmit(sweet.id, quantity);
      setQuantity(0);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !sweet) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Restock: {sweet.name}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Current stock: <strong>{sweet.quantity}</strong>
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="restockQuantity">
                Quantity to Add *
              </label>
              <input
                type="number"
                id="restockQuantity"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                required
                min="1"
                placeholder="Enter quantity"
              />
            </div>

            <p style={{ color: 'var(--text-secondary)' }}>
              New stock will be: <strong>{sweet.quantity + quantity}</strong>
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || quantity <= 0}
            >
              {loading ? 'Restocking...' : 'Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
