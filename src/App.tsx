// App.tsx

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
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] =
    useState<Category[]>(INITIAL_CATEGORIES);
  const [activeProduct, setActiveProduct] =
    useState<Product | null>(null);
  const [loadingData, setLoadingData] =
    useState<boolean>(true);

  const [isSearchOpen, setIsSearchOpen] =
    useState<boolean>(false);

  const [isSizeGuideOpen, setIsSizeGuideOpen] =
    useState<boolean>(false);

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
      console.warn(
        'Using initial product fallback:',
        err
      );

      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoadingData(false);
    }
  };

  /*
   * SEO
   * --------------------------------------------------
   * Updates document title, description and canonical
   * dynamically according to the current public page.
   */
  useEffect(() => {
    const siteName = 'Sanu Builds';
    const siteUrl = 'https://sanubuilds.com';

    let title =
      'Sanu Builds — Premium 240+ GSM Heavyweight T-Shirts';

    let description =
      'Shop Sanu Builds premium 240+ GSM heavyweight T-shirts in India. Built for modern creators, engineers, developers, and builders.';

    let canonicalPath = '/';
    let shouldIndex = true;

    if (currentRoute === '/') {
      title =
        'Sanu Builds — Premium 240+ GSM Heavyweight T-Shirts';

      description =
        'Shop Sanu Builds premium 240+ GSM heavyweight T-shirts in India. Built for modern creators, engineers, developers, and builders.';

      canonicalPath = '/';
    }

    else if (currentRoute === '/shop') {
      title =
        'Shop Premium Heavyweight T-Shirts — Sanu Builds';

      description =
        'Shop premium 240+ GSM heavyweight T-shirts from Sanu Builds. Explore heavyweight, oversized and creator-focused T-shirts in India.';

      canonicalPath = '/shop';
    }

    else if (currentRoute.startsWith('/product/')) {
      if (activeProduct) {
        const productName =
          activeProduct.name || 'Premium Heavyweight T-Shirt';

        const productDescription =
          activeProduct.description ||
          `Shop ${productName} from Sanu Builds. Premium heavyweight T-shirt designed for modern creators, developers, engineers and builders.`;

        title =
          `${productName} — Sanu Builds`;

        description =
          productDescription.length > 160
            ? productDescription.substring(0, 157) + '...'
            : productDescription;

        canonicalPath =
          `/product/${activeProduct.slug}`;

        shouldIndex = true;
      } else {
        title =
          'Product — Sanu Builds';

        description =
          'Explore premium heavyweight T-shirts from Sanu Builds.';

        canonicalPath =
          currentRoute;

        shouldIndex = false;
      }
    }

    else if (currentRoute === '/wishlist') {
      title =
        'Wishlist — Sanu Builds';

      description =
        'View your saved Sanu Builds products and premium heavyweight T-shirts.';

      canonicalPath = '/wishlist';

      shouldIndex = false;
    }

    else if (currentRoute === '/cart') {
      title =
        'Shopping Cart — Sanu Builds';

      description =
        'Review your Sanu Builds shopping cart before checkout.';

      canonicalPath = '/cart';

      shouldIndex = false;
    }

    else if (currentRoute === '/checkout') {
      title =
        'Checkout — Sanu Builds';

      description =
        'Complete your Sanu Builds order securely.';

      canonicalPath = '/checkout';

      shouldIndex = false;
    }

    else if (currentRoute === '/login') {
      title =
        'Login — Sanu Builds';

      description =
        'Sign in to your Sanu Builds account.';

      canonicalPath = '/login';

      shouldIndex = false;
    }

    else if (currentRoute === '/register') {
      title =
        'Create Account — Sanu Builds';

      description =
        'Create your Sanu Builds account and start shopping premium heavyweight T-shirts.';

      canonicalPath = '/register';

      shouldIndex = false;
    }

    else if (currentRoute === '/profile') {
      title =
        'My Profile — Sanu Builds';

      description =
        'Manage your Sanu Builds account profile and personal information.';

      canonicalPath = '/profile';

      shouldIndex = false;
    }

    else if (currentRoute === '/orders') {
      title =
        'Order History — Sanu Builds';

      description =
        'View your Sanu Builds orders and purchase history.';

      canonicalPath = '/orders';

      shouldIndex = false;
    }

    else if (currentRoute === '/order-success') {
      title =
        'Order Confirmed — Sanu Builds';

      description =
        'Your Sanu Builds order has been successfully confirmed.';

      canonicalPath = '/order-success';

      shouldIndex = false;
    }

    else if (currentRoute === '/track') {
      title =
        'Track Your Order — Sanu Builds';

      description =
        'Track your Sanu Builds order and view the latest delivery status.';

      canonicalPath = '/track';

      shouldIndex = false;
    }

    else if (currentRoute === '/admin') {
      title =
        'Admin Dashboard — Sanu Builds';

      description =
        'Sanu Builds administration dashboard.';

      canonicalPath = '/admin';

      shouldIndex = false;
    }

    else {
      title =
        'Sanu Builds — Premium Heavyweight T-Shirts';

      description =
        'Shop premium 240+ GSM heavyweight T-shirts from Sanu Builds.';

      canonicalPath = '/';

      shouldIndex = true;
    }

    document.title = title;

    const setMeta = (
      name: string,
      content: string
    ) => {
      let element =
        document.querySelector<HTMLMetaElement>(
          `meta[name="${name}"]`
        );

      if (!element) {
        element =
          document.createElement('meta');

        element.setAttribute('name', name);

        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    const setPropertyMeta = (
      property: string,
      content: string
    ) => {
      let element =
        document.querySelector<HTMLMetaElement>(
          `meta[property="${property}"]`
        );

      if (!element) {
        element =
          document.createElement('meta');

        element.setAttribute(
          'property',
          property
        );

        document.head.appendChild(element);
      }

      element.setAttribute(
        'content',
        content
      );
    };

    setMeta(
      'description',
      description
    );

    setMeta(
      'robots',
      shouldIndex
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow'
    );

    setPropertyMeta(
      'og:title',
      title
    );

    setPropertyMeta(
      'og:description',
      description
    );

    setPropertyMeta(
      'og:url',
      `${siteUrl}${canonicalPath}`
    );

    setPropertyMeta(
      'og:type',
      currentRoute.startsWith('/product/')
        ? 'product'
        : 'website'
    );

    setPropertyMeta(
      'og:site_name',
      siteName
    );

    setPropertyMeta(
      'og:locale',
      'en_IN'
    );

    setPropertyMeta(
      'og:image',
      activeProduct?.image ||
        `${siteUrl}/og-image.jpg`
    );

    setPropertyMeta(
      'og:image:alt',
      activeProduct?.name ||
        'Sanu Builds Premium Heavyweight T-Shirts'
    );

    setMeta(
      'twitter:title',
      title
    );

    setMeta(
      'twitter:description',
      description
    );

    setMeta(
      'twitter:image',
      activeProduct?.image ||
        `${siteUrl}/og-image.jpg`
    );

    let canonical =
      document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]'
      );

    if (!canonical) {
      canonical =
        document.createElement('link');

      canonical.setAttribute(
        'rel',
        'canonical'
      );

      document.head.appendChild(canonical);
    }

    canonical.setAttribute(
      'href',
      `${siteUrl}${canonicalPath}`
    );
  }, [
    currentRoute,
    activeProduct,
  ]);

  const handleNavigate = (
    route: string,
    params: Record<string, string> = {}
  ) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setRouteParams(params);

    if (route.startsWith('/product/')) {
      const slug =
        route.replace('/product/', '');

      handleSelectProduct(slug);

      return;
    }

    if (route.startsWith('/category/')) {
      const catSlug =
        route.replace('/category/', '');

      setCurrentRoute('/shop');

      setRouteParams({
        category: catSlug,
      });

      return;
    }

    if (route.startsWith('/order-success/')) {
      const orderId =
        route.replace(
          '/order-success/',
          ''
        );

      setCurrentRoute(
        '/order-success'
      );

      setRouteParams({
        orderId,
      });

      return;
    }

    if (route.startsWith('/track/')) {
      const orderId =
        route.replace(
          '/track/',
          ''
        );

      setCurrentRoute('/track');

      setRouteParams({
        orderId,
      });

      return;
    }

    setCurrentRoute(route);
  };

  const handleSelectProduct = async (
    slug: string
  ) => {
    const found =
      products.find(
        (p) => p.slug === slug
      );

    if (found) {
      setActiveProduct(found);

      setCurrentRoute(
        `/product/${slug}`
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    const fetched =
      await getProductBySlug(slug);

    if (fetched) {
      setActiveProduct(fetched);
    } else if (products.length > 0) {
      setActiveProduct(products[0]);
    }

    setCurrentRoute(
      `/product/${slug}`
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const renderCurrentView = () => {
    if (currentRoute === '/') {
      return (
        <HomePage
          products={products}
          categories={categories}
          onSelectProduct={
            handleSelectProduct
          }
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/shop') {
      return (
        <ShopPage
          products={products}
          categories={categories}
          initialCategory={
            routeParams.category || 'all'
          }
          initialSearch={
            routeParams.search || ''
          }
          onSelectProduct={
            handleSelectProduct
          }
        />
      );
    }

    if (
      currentRoute.startsWith(
        '/product/'
      )
    ) {
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
          onSelectProduct={
            handleSelectProduct
          }
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/cart') {
      return (
        <CartPage
          onNavigate={handleNavigate}
          onSelectProduct={
            handleSelectProduct
          }
        />
      );
    }

    if (currentRoute === '/wishlist') {
      return (
        <WishlistPage
          allProducts={products}
          onNavigate={handleNavigate}
          onSelectProduct={
            handleSelectProduct
          }
        />
      );
    }

    if (currentRoute === '/checkout') {
      return (
        <CheckoutPage
          onNavigate={handleNavigate}
        />
      );
    }

    if (
      currentRoute ===
      '/order-success'
    ) {
      return (
        <OrderSuccessPage
          orderId={
            routeParams.orderId || ''
          }
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/orders') {
      return (
        <OrderHistoryPage
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/track') {
      return (
        <OrderTrackingPage
          orderId={
            routeParams.orderId || ''
          }
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/profile') {
      return (
        <ProfilePage
          onNavigate={handleNavigate}
        />
      );
    }

    if (
      currentRoute === '/login' ||
      currentRoute === '/register'
    ) {
      return (
        <AuthPages
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/admin') {
      return (
        <AdminDashboard
          categories={categories}
          onNavigate={handleNavigate}
          onRefreshData={
            loadProducts
          }
        />
      );
    }

    return (
      <HomePage
        products={products}
        categories={categories}
        onSelectProduct={
          handleSelectProduct
        }
        onNavigate={handleNavigate}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans antialiased">

      <Header
        onNavigate={handleNavigate}
        onOpenSearch={() =>
          setIsSearchOpen(true)
        }
        currentRoute={currentRoute}
      />

      <main className="flex-1 pb-16 md:pb-0">
        {renderCurrentView()}
      </main>

      <Footer
        onNavigate={handleNavigate}
      />

      <BottomNav
        onNavigate={handleNavigate}
        currentRoute={currentRoute}
      />

      <SearchBarModal
        isOpen={isSearchOpen}
        onClose={() =>
          setIsSearchOpen(false)
        }
        products={products}
        onSelectProduct={
          handleSelectProduct
        }
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() =>
          setIsSizeGuideOpen(false)
        }
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
