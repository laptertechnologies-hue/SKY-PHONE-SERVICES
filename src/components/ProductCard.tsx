import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category?: string;
  condition?: string;
}

const ProductCard: React.FC<Props> = ({ id, name, price, image_url }) => {
  // Generate stable mock discount percent (20% - 39%) based on product id
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const discountPercent = (Math.abs(hash) % 20) + 20; 
  const originalPrice = Math.round((price / (1 - discountPercent / 100)) / 1000) * 1000;

  return (
    <Link to={`/products/${id}`} className="jumia-product-card" style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '0.5rem',
      background: '#ffffff',
      border: '1px solid #f1f1f2',
      textDecoration: 'none',
      color: 'inherit',
      position: 'relative',
      borderRadius: '4px',
      boxShadow: 'none',
      transition: 'all 0.15s ease-in-out',
    }}>
      {/* Discount Badge */}
      <div className="badge-discount">
        -{discountPercent}%
      </div>

      {/* Product Image */}
      <div style={{
        width: '100%',
        paddingBottom: '100%', // 1:1 Aspect Ratio (Square like Jumia)
        position: 'relative',
        borderRadius: '4px',
        overflow: 'hidden',
        background: '#ffffff',
        marginBottom: '0.5rem',
      }}>
        <img
          src={image_url || 'https://placehold.co/300x300/ffffff/f68b1e?text=No+Image'}
          alt={name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Info details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 0.25rem' }}>
        <h3 style={{
          fontSize: '0.8rem',
          fontWeight: 400,
          lineHeight: '1.3',
          color: '#313137',
          height: '2.6rem', // Force 2 lines height limit like Jumia
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          marginBottom: '0.25rem',
        }}>
          {name}
        </h3>
        
        <div style={{ marginTop: 'auto' }}>
          {/* Current Price */}
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#000000',
            display: 'block',
          }}>
            UGX {price.toLocaleString()}
          </span>
          {/* Strikethrough Price */}
          <span className="original-price" style={{ marginLeft: 0, fontSize: '0.75rem' }}>
            UGX {originalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
