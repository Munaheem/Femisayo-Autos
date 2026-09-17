import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Car, 
  ShoppingBag, 
  Calendar, 
  ShieldCheck, 
  Bell, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Phone, 
  Sparkles, 
  Lock,
  Info
} from 'lucide-react';
import { UserRole, PushNotification } from '../types';

interface HeaderProps {
  activeTab: 'home' | 'services' | 'cars' | 'parts' | 'garage' | 'admin' | 'about';
  setActiveTab: (tab: 'home' | 'services' | 'cars' | 'parts' | 'garage' | 'admin' | 'about') => void;
  cartCount: number;
  openCart: () => void;
  currentRole: UserRole;
  isAuthenticated: boolean;
  onOpenLogin: (portal: 'customer' | 'staff') => void;
  notifications: PushNotification[];
  onOpenNotifications: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  selectedVehicleFitment: { year: string; make: string; model: string } | null;
  onClearFitment: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  currentRole,
  isAuthenticated,
  onOpenLogin,
  notifications,
  onOpenNotifications,
  wishlistCount,
  onOpenWishlist,
  selectedVehicleFitment,
  onClearFitment,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isStaff = currentRole === 'admin' || currentRole === 'technician' || currentRole === 'sales';

  const handleGarageClick = () => {
    if (isAuthenticated) {
      setActiveTab(isStaff ? 'admin' : 'garage');
    } else {
      onOpenLogin('customer');
    }
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string; desc: string }> = {
    customer: { 
      label: 'Customer Mode', 
      badge: 'Client', 
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      desc: 'Book services, browse cars & parts, track garage'
    },
    technician: { 
      label: 'Service Tech Mode', 
      badge: 'Master Mechanic', 
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      desc: 'Bay inspection, repair status & technician notes'
    },
    sales: { 
      label: 'Parts & Sales Rep', 
      badge: 'Inventory Rep', 
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      desc: 'Manage vehicle showroom & stock levels'
    },
    admin: { 
      label: 'Shop Administrator', 
      badge: 'Full RBAC Admin', 
      color: 'bg-red-500/10 text-red-400 border-red-500/30',
      desc: 'Full CRUD, encrypted privacy vault, financial analytics'
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0c10]/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100">
      {/* Top Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden text-center min-w-0">
            <span className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse shrink-0" />
              <span className="font-bold tracking-tight">FEMISAYO AUTOS</span>
            </span>
            <span className="text-red-200 hidden sm:inline shrink-0">•</span>
            <span className="hidden sm:inline text-red-100 shrink-0">BN-2641123</span>
            <span className="text-red-200 hidden md:inline shrink-0">•</span>
            <span className="whitespace-nowrap flex items-center gap-1 text-yellow-300 font-semibold shrink-0">
              <span>★ 4.4/5</span>
              <span className="text-red-200 text-[10px] sm:text-[11px] font-normal hidden md:inline">(8 Reviews)</span>
            </span>
            <span className="hidden xl:inline text-red-200 shrink-0">•</span>
            <span className="hidden xl:inline whitespace-nowrap text-zinc-100">
              Ilasan New Road, Eti-Osa &amp; FemisayoAutos Annex, Lekki
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap shrink-0">
            <a 
              href="tel:+2348023179860"
              className="flex items-center gap-1 text-red-100 hover:text-white text-[11px] sm:text-xs font-semibold underline sm:no-underline"
            >
              <Phone className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">+234 802 317 9860</span>
              <span className="sm:hidden">Call</span>
            </a>
            <span className="bg-black/25 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold text-yellow-300 hidden md:inline">
              MON - SAT: 7:00 AM - 7:30 PM
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-lg shadow-red-900/40 ring-1 ring-red-500/50 group-hover:scale-105 transition-transform duration-200 shrink-0 bg-zinc-900">
              <img
                src="/images/femisayo%20brand%20logo.jpg"
                alt="Femisayo Autos brand logo"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-base sm:text-xl font-black tracking-tight text-white font-mono">FEMISAYO</span>
                <span className="text-base sm:text-xl font-black text-red-500 font-mono">AUTOS</span>
              </div>
              <p className="text-[9px] sm:text-[10px] tracking-wider text-zinc-400 uppercase font-semibold truncate max-w-[170px] xs:max-w-[240px] sm:max-w-none">
                Auto Repair Shop • Lekki, Lagos
              </p>
            </div>
          </div>

          {/* Fitment indicator if vehicle selected */}
          {selectedVehicleFitment && (
            <div className="hidden xl:flex items-center gap-2 bg-zinc-900/90 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs">
              <Car className="w-3.5 h-3.5 text-red-400" />
              <span className="text-zinc-400">Viewing fitment for:</span>
              <span className="font-semibold text-white">
                {selectedVehicleFitment.year} {selectedVehicleFitment.make} {selectedVehicleFitment.model}
              </span>
              <button 
                onClick={onClearFitment}
                className="text-zinc-500 hover:text-zinc-200 ml-1 hover:bg-zinc-800 p-0.5 rounded"
                title="Clear Vehicle Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Desktop Navigation Links */}
          <nav className={`hidden lg:flex items-center space-x-1 ${activeTab === 'admin' ? 'hidden' : ''}`}>
            {activeTab !== 'admin' && (<>
            <button
              id="nav-services"
              onClick={() => setActiveTab('services')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Service &amp; Booking</span>
            </button>

            <button
              id="nav-cars"
              onClick={() => setActiveTab('cars')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'cars'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Car Showroom</span>
            </button>

            <button
              id="nav-parts"
              onClick={() => setActiveTab('parts')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'parts'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Parts &amp; Accessories</span>
            </button>

            <button
              id="nav-about"
              onClick={() => setActiveTab('about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'about'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About Us</span>
            </button>

            {isAuthenticated && (
              <button
                id="nav-garage"
                onClick={handleGarageClick}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'garage'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>My Garage</span>
              </button>
            )}
            </>)}

            {isStaff && (
              <button
                id="nav-admin"
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-zinc-800/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Staff Portal</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                  RBAC
                </span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* All prices displayed in Naira */}

            {/* Signed-in Role Pill + Logout (or Sign In for guests) */}
            {/* Hidden on mobile — account controls live inside the hamburger menu */}
            <div className="hidden lg:flex items-center gap-1.5">
              {isAuthenticated ? (
                <>
                  <div
                    className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${roleLabels[currentRole].color}`}
                    title={roleLabels[currentRole].desc}
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden md:inline">{roleLabels[currentRole].badge}</span>
                    <span className="md:hidden">{currentRole === 'customer' ? 'Client' : currentRole.toUpperCase()}</span>
                  </div>
                  <div
                    className={`sm:hidden flex items-center gap-1 px-1.5 py-1.5 rounded-lg border text-[10px] font-semibold ${roleLabels[currentRole].color}`}
                    title={roleLabels[currentRole].desc}
                  >
                    <Lock className="w-3 h-3 shrink-0" />
                    <span className="uppercase">{currentRole === 'customer' ? 'Client' : currentRole}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title={`Log out ${roleLabels[currentRole].badge}`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onOpenLogin('customer')}
                  className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] sm:text-[11px] font-bold transition-all shadow-md shadow-red-700/30"
                  title="Sign in to track bookings in My Garage"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Notification Bell with Badge — signed-in only, hidden on mobile (hamburger menu) */}
            {isAuthenticated && (
              <button
                id="notifications-btn"
                onClick={onOpenNotifications}
                className="hidden lg:flex relative p-1.5 sm:p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors items-center"
                title="Push Notifications & Live Updates"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Wishlist Button with Count Badge — signed-in only, hidden on mobile (hamburger menu) */}
            {isAuthenticated && !isStaff && (
              <button
                id="wishlist-btn"
                onClick={onOpenWishlist}
                className="hidden lg:flex relative p-1.5 sm:p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors items-center"
                title="My Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {wishlistCount > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.2 rounded-full ring-2 ring-zinc-900">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Button with Count Badge — signed-in only (hidden in the Admin portal) */}
            {isAuthenticated && activeTab !== 'admin' && (
              <button
                id="cart-btn"
                onClick={openCart}
                className="relative p-1.5 sm:p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.2 rounded-full ring-2 ring-zinc-900">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-3 pb-5 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {selectedVehicleFitment && (
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-xs">
              <span className="text-zinc-400">
                Fitment: <strong className="text-white">{selectedVehicleFitment.year} {selectedVehicleFitment.make} {selectedVehicleFitment.model}</strong>
              </span>
              <button onClick={onClearFitment} className="text-red-400 font-semibold text-xs">Clear</button>
            </div>
          )}

          {/* Notifications + Wishlist — signed-in only (desktop: navbar icons) */}
          {isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => { onOpenNotifications(); setMobileMenuOpen(false); }}
                className="relative w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 text-zinc-300 hover:bg-zinc-900"
              >
                <Bell className="w-4 h-4 text-red-400" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {!isStaff && (
                <button
                  onClick={() => { onOpenWishlist(); setMobileMenuOpen(false); }}
                  className="relative w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 text-zinc-300 hover:bg-zinc-900"
                >
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-1.5 pt-1">
            {activeTab !== 'admin' && (<>
            <button
              onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
                activeTab === 'services' ? 'bg-red-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Wrench className="w-4 h-4 text-red-400" />
              <span>Service &amp; Online Booking</span>
            </button>

            <button
              onClick={() => { setActiveTab('cars'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
                activeTab === 'cars' ? 'bg-red-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Car className="w-4 h-4 text-red-400" />
              <span>Car Showroom</span>
            </button>

            <button
              onClick={() => { setActiveTab('parts'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
                activeTab === 'parts' ? 'bg-red-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-red-400" />
              <span>Parts &amp; Accessories</span>
            </button>

            <button
              onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
                activeTab === 'about' ? 'bg-red-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Info className="w-4 h-4 text-red-400" />
              <span>About Us</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => { handleGarageClick(); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
                  activeTab === 'garage' ? 'bg-red-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <Calendar className="w-4 h-4 text-red-400" />
                <span>My Garage &amp; Bookings</span>
              </button>
            )}
            </>)}

            {isStaff && (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
                  activeTab === 'admin' ? 'bg-red-600 text-white' : 'text-amber-400 hover:bg-zinc-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Staff Portal</span>
              </button>
            )}
          </div>

            {/*Removed the price (NGN) display from the header*/}                            

          {/* Signed-in account info + Logout in Mobile Menu */}
          <div className="pt-3 border-t border-zinc-800/80">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="w-full px-2.5 py-2 rounded-lg text-xs font-medium border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-950/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => { onOpenLogin('customer'); setMobileMenuOpen(false); }}
                className="w-full px-2.5 py-2 rounded-lg text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
              >
                Sign In / Create Account
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
