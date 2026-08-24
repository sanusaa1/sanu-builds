import React, { useState } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  Package,
  MapPin,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface HeaderProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  onOpenSearch: () => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenSearch, currentRoute }) => {
  const { currentUser, userProfile, isAdmin, logout, loginAsDemoAdmin, loginAsDemoCustomer } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Shop All', route: '/shop' },
    { name: 'Oversized', route: '/category/oversized-tees' },
    { name: 'Heavyweight', route: '/category/heavyweight-basics' },
    { name: 'Minimal', route: '/category/minimal-tees' },
    { name: 'Graphic', route: '/category/graphic-tees' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      {/* Top Announcement Bar */}
      <div className="bg-neutral-900 text-white text-[11px] font-semibold tracking-wider uppercase py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-neutral-400 shrink-0" />
        <span>Free expedited shipping on orders $50+ • Use code <strong>BUILD15</strong> for 15% off</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-neutral-800 hover:text-neutral-950 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start">
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 bg-neutral-950 text-white flex items-center justify-center font-black text-sm tracking-tighter rounded-md group-hover:bg-neutral-800 transition-colors shadow-xs">
                SB
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-widest text-neutral-950 leading-none">
                  SANU BUILDS
                </span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
                  BUILD YOUR STYLE
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => onNavigate(link.route)}
                className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-neutral-950 py-1 ${
                  currentRoute === link.route || currentRoute.startsWith(link.route)
                    ? 'text-neutral-950 border-b-2 border-neutral-950'
                    : 'text-neutral-600'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Actions: Search, Wishlist, Cart, Account */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search Trigger */}
            <button
              id="header-search-btn"
              onClick={onOpenSearch}
              className="p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              id="header-wishlist-btn"
              onClick={() => onNavigate('/wishlist')}
              className="relative p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span
                  id="wishlist-badge"
                  className="absolute top-1 right-1 w-4 h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs"
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={() => onNavigate('/cart')}
              className="relative p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span
                  id="cart-badge"
                  className="absolute top-1 right-1 w-4 h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs"
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account Menu Dropdown */}
            <div className="relative">
              <button
                id="header-account-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="User menu"
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.name}
                    className="w-6 h-6 rounded-full object-cover border border-neutral-300"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
                {isAdmin && (
                  <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-neutral-100">
                        <p className="text-xs font-bold text-neutral-900 truncate">
                          {userProfile?.name || 'Sanu Builder'}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">{currentUser.email}</p>
                        {isAdmin && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-neutral-900">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Admin Verified</span>
                          </div>
                        )}
                      </div>

                      {isAdmin && (
                        <button
                          id="dropdown-admin-portal-btn"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigate('/admin');
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-neutral-900 hover:bg-neutral-100 flex items-center gap-2 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-neutral-900" />
                          <span>Admin Control Panel</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('/orders');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors"
                      >
                        <Package className="w-4 h-4 text-neutral-500" />
                        <span>My Orders & Tracking</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('/addresses');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-neutral-500" />
                        <span>Saved Addresses</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('/profile');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-neutral-500" />
                        <span>Profile Settings</span>
                      </button>

                      <div className="border-t border-neutral-100 mt-1 pt-1">
                        <button
                          id="dropdown-logout-btn"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-neutral-900">Welcome to Sanu Builds</p>
                        <p className="text-[11px] text-neutral-500">Sign in to track orders and save your wishlist</p>
                        <button
                          id="dropdown-login-btn"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigate('/login');
                          }}
                          className="mt-2.5 w-full py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                        >
                          Sign In / Register
                        </button>
                      </div>

                      <div className="border-t border-neutral-100 mt-2 pt-2 px-4 space-y-1.5 pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          One-Click Demo Access
                        </p>
                        <button
                          id="demo-admin-login-btn"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            loginAsDemoAdmin();
                          }}
                          className="w-full py-1.5 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-md text-[11px] font-semibold flex items-center justify-between transition-colors"
                        >
                          <span>Log in as Admin</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                        </button>
                        <button
                          id="demo-customer-login-btn"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            loginAsDemoCustomer();
                          }}
                          className="w-full py-1.5 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-md text-[11px] font-semibold flex items-center justify-between transition-colors"
                        >
                          <span>Log in as Customer</span>
                          <UserIcon className="w-3.5 h-3.5 text-neutral-700" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg"
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate(link.route);
                }}
                className={`py-2 px-3 text-left text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${
                  currentRoute === link.route ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-100 pt-3 flex flex-col gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('/admin');
                }}
                className="py-2.5 px-3 bg-neutral-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            )}
            {!currentUser && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('/login');
                }}
                className="py-2.5 px-3 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 text-center uppercase tracking-wider"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
