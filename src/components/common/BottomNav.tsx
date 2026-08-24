import React from 'react';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Don't display bottom nav on admin routes
  if (currentRoute.startsWith('/admin')) {
    return null;
  }

  return (
    <nav
      id="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-1.5 px-4"
    >
      <div className="flex items-center justify-around">
        <button
          id="nav-home-btn"
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center py-1 px-2 transition-colors ${
            currentRoute === '/' ? 'text-neutral-950 font-bold' : 'text-neutral-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          id="nav-shop-btn"
          onClick={() => onNavigate('/shop')}
          className={`flex flex-col items-center py-1 px-2 transition-colors ${
            currentRoute.startsWith('/shop') || currentRoute.startsWith('/category')
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Shop</span>
        </button>

        <button
          id="nav-wishlist-btn"
          onClick={() => onNavigate('/wishlist')}
          className={`relative flex flex-col items-center py-1 px-2 transition-colors ${
            currentRoute === '/wishlist' ? 'text-neutral-950 font-bold' : 'text-neutral-500'
          }`}
        >
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-neutral-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Wishlist</span>
        </button>

        <button
          id="nav-cart-btn"
          onClick={() => onNavigate('/cart')}
          className={`relative flex flex-col items-center py-1 px-2 transition-colors ${
            currentRoute === '/cart' || currentRoute === '/checkout' ? 'text-neutral-950 font-bold' : 'text-neutral-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-neutral-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Bag</span>
        </button>

        <button
          id="nav-profile-btn"
          onClick={() => onNavigate('/profile')}
          className={`flex flex-col items-center py-1 px-2 transition-colors ${
            currentRoute === '/profile' || currentRoute === '/orders' || currentRoute === '/login'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Account</span>
        </button>
      </div>
    </nav>
  );
};
