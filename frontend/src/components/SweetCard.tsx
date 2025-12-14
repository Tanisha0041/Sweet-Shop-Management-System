import React from 'react';
import { Sweet, SweetCategory } from '../types';
import { useAuth } from '../context/AuthContext';

/**
 * Category emoji mapping
 */
const categoryEmojis: Record<SweetCategory, string> = {
  [SweetCategory.CHOCOLATE]: '🍫',
  [SweetCategory.CANDY]: '🍬',
  [SweetCategory.COOKIE]: '🍪',
  [SweetCategory.CAKE]: '🎂',
  [SweetCategory.PASTRY]: '🥐',
  [SweetCategory.ICE_CREAM]: '🍨',
  [SweetCategory.OTHER]: '🍭',
};

/**
 * Props for SweetCard component
 */
interface SweetCardProps {
  sweet: Sweet;
  onPurchase: (id: string) => void;
  onEdit?: (sweet: Sweet) => void;
  onDelete?: (id: string) => void;
  onRestock?: (sweet: Sweet) => void;
  purchasing?: boolean;
}

/**
 * Sweet card component
 */
const SweetCard: React.FC<SweetCardProps> = ({
  sweet,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  purchasing,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOutOfStock = sweet.quantity === 0;

  return (
    <div className="sweet-card">
      <div className="sweet-image">
        {categoryEmojis[sweet.category as SweetCategory] || '🍭'}
      </div>
      <div className="sweet-content">
        <h3 className="sweet-name">{sweet.name}</h3>
        <span className="sweet-category">{sweet.category.replace('_', ' ')}</span>
        {sweet.description && (
          <p className="sweet-description">{sweet.description}</p>
        )}
        <div className="sweet-footer">
          <span className="sweet-price">${Number(sweet.price).toFixed(2)}</span>
          <span className={`sweet-quantity ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {isOutOfStock ? 'Out of Stock' : `${sweet.quantity} in stock`}
          </span>
        </div>
      </div>
      <div className="sweet-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onPurchase(sweet.id)}
          disabled={isOutOfStock || purchasing}
        >
          {purchasing ? 'Purchasing...' : 'Purchase'}
        </button>
        {isAdmin && onEdit && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(sweet)}
          >
            Edit
          </button>
        )}
        {isAdmin && onRestock && (
          <button
            className="btn btn-success btn-sm"
            onClick={() => onRestock(sweet)}
          >
            Restock
          </button>
        )}
        {isAdmin && onDelete && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(sweet.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default SweetCard;
