import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Address } from '../types';
import {
  getUserAddresses,
  saveUserAddress,
  deleteUserAddress,
  updateUserProfileData,
} from '../services/userService';

interface ProfilePageProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddrs, setLoadingAddrs] = useState(true);

  // Profile Edit
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // New Address Form
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (currentUser) {
      getUserAddresses(currentUser.uid).then((addrs) => {
        setAddresses(addrs);
        setLoadingAddrs(false);
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <User className="w-12 h-12 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Account Access Required</h2>
        <p className="text-xs text-neutral-500">
          Sign in to manage your addresses, update personal preferences, and track your orders.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    try {
      await updateUserProfileData(currentUser.uid, { name, phone });
      success('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      toastError('Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const saved = await saveUserAddress(currentUser.uid, newAddress);
      setAddresses((prev) => [...prev, saved]);
      setIsAddingAddress(false);
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        isDefault: false,
      });
      success('New address added.');
    } catch (err) {
      console.error(err);
      toastError('Failed to save address.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser) return;
    try {
      await deleteUserAddress(currentUser.uid, addressId);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      success('Address removed.');
    } catch (err) {
      console.error(err);
      toastError('Failed to delete address.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="border-b border-neutral-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Sanu Builds Member
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-0.5">
            {userProfile?.name || currentUser.displayName || 'Customer Account'}
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">{currentUser.email}</p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={() => onNavigate('/admin')}
              className="px-4 py-2 bg-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:bg-neutral-800 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          )}

          <button
            onClick={logout}
            className="px-3.5 py-2 border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'addresses'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          Delivery Addresses ({addresses.length})
        </button>
        <button
          onClick={() => onNavigate('/orders')}
          className="pb-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-neutral-400 hover:text-neutral-700"
        >
          Orders
        </button>
      </div>

      {/* Tab 1: Profile Form */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-xl space-y-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            Edit Profile
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser.email || ''}
                className="w-full px-3 py-2 text-xs bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Email is bound to your authentication provider.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Saved Delivery Addresses
            </h3>
            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                className="px-4 py-2 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            )}
          </div>

          {/* New Address Form */}
          {isAddingAddress && (
            <div className="bg-neutral-50 rounded-xl border border-neutral-300 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <h4 className="text-xs font-bold uppercase text-neutral-900">New Address</h4>
                <button
                  onClick={() => setIsAddingAddress(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-900"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List */}
          {addresses.length === 0 && !isAddingAddress ? (
            <div className="py-10 text-center bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-xs text-neutral-500">No saved addresses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white rounded-xl border border-neutral-200 p-4 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-[10px] font-bold uppercase text-neutral-800">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p className="text-xs text-neutral-500 font-mono">Phone: {addr.phone}</p>

                  <div className="pt-2 border-t border-neutral-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1 rounded"
                      title="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
