import React, { useState } from 'react';
import { Sweet, SweetCategory } from '../types';
import { useCart } from '../App';
import toast from 'react-hot-toast';

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
}

/**
 * Sweet card component
 */
const SweetCard: React.FC<SweetCardProps> = ({ sweet }) => {
  const { addToCart, cart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const isOutOfStock = sweet.quantity === 0;
  
  // Get quantity in cart for this sweet
  const cartItem = cart.find(item => item.sweet.id === sweet.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (sweet.quantity > 0) {
      setIsAdding(true);
      addToCart(sweet);
      toast.success(`${sweet.name} added to cart!`);
      
      // Reset button after animation
      setTimeout(() => setIsAdding(false), 600);
    }
  };

  return (
    <div className="sweet-card">
      {sweet.imageUrl ? (
        <img 
          src={sweet.imageUrl} 
          alt={sweet.name} 
          className="sweet-image-img"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div className={`sweet-image ${sweet.imageUrl ? 'hidden' : ''}`}>
        {categoryEmojis[sweet.category as SweetCategory] || '🍭'}
      </div>
      <div className="sweet-content">
        <h3 className="sweet-name">{sweet.name}</h3>
        <span className="sweet-category">{sweet.category.replace('_', ' ')}</span>
        {sweet.description && (
          <p className="sweet-description">{sweet.description}</p>
        )}
        <div className="sweet-footer">
          <span className="sweet-price">Rs.{Number(sweet.price).toFixed(2)}</span>
          <span className={`sweet-quantity ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {isOutOfStock ? 'Out of Stock' : `${sweet.quantity} in stock`}
          </span>
        </div>
      </div>
      <div className="sweet-actions">
        <button
          className={`btn btn-sm ${isAdding ? 'btn-success' : 'btn-primary'} ${quantityInCart > 0 ? 'has-items' : ''}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
        >
          {isOutOfStock 
            ? 'Out of Stock' 
            : isAdding 
              ? '✓ Added!' 
              : quantityInCart > 0 
                ? `Add More (${quantityInCart} in cart)` 
                : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default SweetCard;
