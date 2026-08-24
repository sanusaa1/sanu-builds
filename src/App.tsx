import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { BottomNav } from './components/common/BottomNav';
import { SearchBarModal } from './components/common/SearchBarModal';
import { SizeGuideModal } from './components/common/SizeGuideModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPages } from './pages/AuthPages';
import { AdminDashboard } from './pages/AdminDashboard';
import { Product, Category } from './types';
import { getAllProducts, getProductBySlug } from './services/productService';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data/seedData';

function MainApp() {
  // App routing state
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  // Global Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);

  // Load products from firestore with seed fallback
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err) {
      console.warn('Using initial product fallback:', err);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoadingData(false);
    }
  };

  // Simple, solid router navigation handler
  const handleNavigate = (route: string, params: Record<string, string> = {}) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRouteParams(params);

    if (route.startsWith('/product/')) {
      const slug = route.replace('/product/', '');
      handleSelectProduct(slug);
      return;
    }

    if (route.startsWith('/category/')) {
      const catSlug = route.replace('/category/', '');
      setCurrentRoute('/shop');
      setRouteParams({ category: catSlug });
      return;
    }

    if (route.startsWith('/order-success/')) {
      const orderId = route.replace('/order-success/', '');
      setCurrentRoute('/order-success');
      setRouteParams({ orderId });
      return;
    }

    if (route.startsWith('/track/')) {
      const orderId = route.replace('/track/', '');
      setCurrentRoute('/track');
      setRouteParams({ orderId });
      return;
    }

    setCurrentRoute(route);
  };

  const handleSelectProduct = async (slug: string) => {
    // Find in memory first
    const found = products.find((p) => p.slug === slug);
    if (found) {
      setActiveProduct(found);
      setCurrentRoute(`/product/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Try fetching from firestore
    const fetched = await getProductBySlug(slug);
    if (fetched) {
      setActiveProduct(fetched);
    } else if (products.length > 0) {
      setActiveProduct(products[0]);
    }
    setCurrentRoute(`/product/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render view
  const renderCurrentView = () => {
    if (currentRoute === '/') {
      return (
        <HomePage
          products={products}
          categories={categories}
          onSelectProduct={handleSelectProduct}
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/shop') {
      return (
        <ShopPage
          products={products}
          categories={categories}
          initialCategory={routeParams.category || 'all'}
          initialSearch={routeParams.search || ''}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    if (currentRoute.startsWith('/product/')) {
      if (!activeProduct) {
        return (
          <div className="py-20 text-center text-xs text-neutral-400">
            Finding product details...
          </div>
        );
      }
      return (
        <ProductDetailPage
          product={activeProduct}
          allProducts={products}
          onSelectProduct={handleSelectProduct}
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/cart') {
      return <CartPage onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />;
    }

    if (currentRoute === '/wishlist') {
      return (
        <WishlistPage
          allProducts={products}
          onNavigate={handleNavigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    if (currentRoute === '/checkout') {
      return <CheckoutPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/order-success') {
      return (
        <OrderSuccessPage
          orderId={routeParams.orderId || ''}
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/orders') {
      return <OrderHistoryPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/track') {
      return (
        <OrderTrackingPage
          orderId={routeParams.orderId || ''}
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/profile') {
      return <ProfilePage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/login' || currentRoute === '/register') {
      return <AuthPages onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/admin') {
      return (
        <AdminDashboard
          categories={categories}
          onNavigate={handleNavigate}
          onRefreshData={loadProducts}
        />
      );
    }

    // Default Fallback
    return (
      <HomePage
        products={products}
        categories={categories}
        onSelectProduct={handleSelectProduct}
        onNavigate={handleNavigate}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans antialiased">
      {/* Header */}
      <Header
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentRoute={currentRoute}
      />

      {/* Main View Stage */}
      <main className="flex-1 pb-16 md:pb-0">{renderCurrentView()}</main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation */}
      <BottomNav onNavigate={handleNavigate} currentRoute={currentRoute} />

      {/* Search Modal */}
      <SearchBarModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Global Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
