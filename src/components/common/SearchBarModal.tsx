import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { Product } from '../../types';
import { getProducts } from '../../services/productService';

interface SearchBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
  onSearchSubmit: (query: string) => void;
}

const POPULAR_SEARCHES = ['Oversized Black', '280 GSM Slate', 'Build Your Style', 'Chalk White', 'Acid Wash'];
const RECENT_SEARCHES_KEY = 'sanubuilds_recent_searches';

export const SearchBarModal: React.FC<SearchBarModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ['Oversized Black', 'Heavyweight Slate'];
    } catch {
      return ['Oversized Black'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      getProducts().then(setAllProducts);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.categoryName?.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 5));
  }, [query, allProducts]);

  const saveRecent = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSelect = (slug: string, term?: string) => {
    if (term) saveRecent(term);
    onSelectProduct(slug);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecent(query.trim());
    onSearchSubmit(query.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-4 bg-neutral-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="search-modal-container"
        className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-b border-neutral-200">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            id="search-modal-input"
            type="text"
            placeholder="Search Sanu Builds T-Shirts, GSM, fit, or SKU (e.g., Oversized, 280 GSM)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-neutral-900 text-sm font-medium focus:outline-none placeholder:text-neutral-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-700 p-1 text-xs font-semibold"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-6">
          {/* Real-time search results */}
          {results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Products ({results.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    saveRecent(query);
                    onSearchSubmit(query);
                    onClose();
                  }}
                  className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
                >
                  View all results <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-neutral-100">
                {results.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product.slug, product.name)}
                    className="w-full py-2.5 flex items-center gap-3.5 text-left hover:bg-neutral-50 rounded-lg px-2 transition-colors group"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-md object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-neutral-900 truncate group-hover:text-neutral-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-neutral-500 truncate">
                        {product.categoryName || 'T-Shirts'} • {product.details?.gsm || 240} GSM
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-neutral-900">${product.price}</span>
                      {product.compareAtPrice && (
                        <span className="block text-[11px] text-neutral-400 line-through">
                          ${product.compareAtPrice}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-neutral-900 font-semibold text-sm">No exact matches found for "{query}"</p>
              <p className="text-neutral-500 text-xs mt-1">
                Try searching for "Oversized", "Heavyweight", "Minimal", or check our categories below.
              </p>
            </div>
          )}

          {/* Popular searches */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    saveRecent(term);
                    onSearchSubmit(term);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 text-xs font-medium transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recent Searches</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                  }}
                  className="text-[10px] text-neutral-400 hover:text-neutral-700 underline"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      onSearchSubmit(term);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-900 text-neutral-700 text-xs font-medium transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
