import React, { useState } from 'react';
import { ArrowRight, Check, Instagram, Youtube, Twitter, Mail, Shield, RefreshCw, Truck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { success } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    success('Welcome to the Sanu Builds circle. 15% discount code BUILD15 sent to your inbox.');
    setEmail('');
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 pt-16 pb-12 border-t border-neutral-900">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 rounded-lg text-white shrink-0 border border-neutral-800">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold tracking-tight">Worldwide Fast Dispatch</h4>
              <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                Orders packaged and shipped within 24 hours. Free delivery on orders over $50.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 rounded-lg text-white shrink-0 border border-neutral-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold tracking-tight">240+ GSM Heavyweight Standard</h4>
              <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                100% pre-shrunk ring-spun combed cotton engineered to prevent neck sag and fading.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 rounded-lg text-white shrink-0 border border-neutral-800">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold tracking-tight">30-Day Hassle-Free Returns</h4>
              <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                Wrong size? Exchange or return unwashed garments with prepaid return labels.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white text-neutral-950 flex items-center justify-center font-black text-xs rounded">
                SB
              </div>
              <span className="font-black text-lg tracking-widest text-white">SANU BUILDS</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Sanu Builds is an independent modern apparel label crafting heavyweight, minimalist t-shirts for developers, creators, engineers, and individuals who construct their own path.
            </p>
            <p className="text-xs font-semibold text-neutral-300">
              Tagline: <span className="text-white font-bold tracking-wider">BUILD YOUR STYLE.</span>
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-neutral-900 hover:bg-white hover:text-neutral-950 rounded-lg text-neutral-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-neutral-900 hover:bg-white hover:text-neutral-950 rounded-lg text-neutral-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-neutral-900 hover:bg-white hover:text-neutral-950 rounded-lg text-neutral-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Collections</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-white transition-colors">
                  All T-Shirts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/oversized-tees')} className="hover:text-white transition-colors">
                  Oversized Boxy Fit
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/heavyweight-basics')} className="hover:text-white transition-colors">
                  280 GSM Heavyweight
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/minimal-tees')} className="hover:text-white transition-colors">
                  Minimalist Monogram
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/graphic-tees')} className="hover:text-white transition-colors">
                  Builder Graphic Series
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Customer Care</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('/orders')} className="hover:text-white transition-colors">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/addresses')} className="hover:text-white transition-colors">
                  Shipping Addresses
                </button>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Size Guide & Fit Matrix</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Shipping & Delivery Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Returns & Exchanges</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Join The Circle</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Receive limited capsule drops, private discount codes, and fabric research notes.
            </p>
            {subscribed ? (
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Subscribed! Use code BUILD15.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    id="footer-newsletter-input"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 pl-3 pr-10 bg-neutral-900 text-white rounded-lg text-xs border border-neutral-800 focus:outline-none focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-2.5 bg-white text-neutral-950 rounded-md hover:bg-neutral-200 transition-colors flex items-center justify-center"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
        <p>© 2026 Sanu Builds Apparel Co. All rights reserved.</p>
        <div className="flex items-center space-x-6">
          <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-neutral-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-neutral-300 cursor-pointer">Security</span>
        </div>
      </div>
    </footer>
  );
};
