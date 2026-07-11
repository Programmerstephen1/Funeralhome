import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, CalendarDays, MessageCircle } from "lucide-react"; 

// --- MAIN PAGES ---
import HomePage from "./pages/HomePage";
import PlanAheadPage from "./pages/PlanAheadPage";
import ObituaryListPage from "./pages/ObituaryListPage";

// --- CATALOG & COMMERCE ---
import CatalogPage from "./pages/CatalogPage"; 
import SectionPage from "./pages/SectionPage";
import CartPage from "./pages/CartPage"; 
import CheckoutPage from "./pages/CheckoutPage";
import BookingCheckoutPage from "./pages/BookingCheckoutPage"; 
import ThankYouPage from "./pages/ThankYouPage";
import BookingsPage from "./pages/BookingsPage";

// --- AUTHENTICATION ---
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// --- MEMORIAL HUB (The 14 Grid Items & Pages) ---
import MemorialOverviewPage from "./pages/MemorialOverviewPage";
import OverviewPage from "./pages/OverviewPage";
import MemorialWallPage from "./pages/MemorialWallPage";
import MemorialPagesPage from "./pages/MemorialPagesPage";
import GalleryPage from "./pages/GalleryPage";
import VisitorFlowersPage from "./pages/VisitorFlowersPage";
import VisitorCandlesPage from "./pages/VisitorCandlesPage";
import FamilyAndFriendsPage from "./pages/FamilyAndFriendsPage";
import FamilyTreePage from "./pages/FamilyTreePage";
import LiveJournalPage from "./pages/LiveJournalPage";
import TributePage from "./pages/TributePage";
import WriteEulogyPage from "./pages/WriteEulogyPage";
import EulogyViewPage from './pages/EulogyViewPage'; 

import ProtectedRoute from "./components/ProtectedRoute";

// ==========================================
// UTILITY COMPONENTS
// ==========================================

// 1. Manages scroll position and accessibility focus when navigating
const FocusManager = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.focus({ preventScroll: true });
    }
  }, [pathname]);

  return null;
};

// 2. Safely converts legacy Hash Links (/#gallery) into React Router Links (/gallery)
const HashBridge = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (window.location.hash && !window.location.hash.startsWith("#/")) {
      const cleanRoute = window.location.hash.replace("#", "/");
      window.history.replaceState(null, "", cleanRoute);
      navigate(cleanRoute, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

// 3. The Pro-Grade Wrapper: Extracts the ID from the URL and passes it down
const DynamicRouteWrapper = ({ Component, sharedProps }) => {
  const params = useParams();
  const dynamicId = params.id || null; 
  return <Component dynamicId={dynamicId} {...sharedProps} />;
};

// ==========================================
// LOCAL STORAGE HELPERS
// ==========================================
const getSavedCart = (email) => {
  try { 
    return JSON.parse(localStorage.getItem(email ? `cart_${email}` : "cart_guest")) || []; 
  } catch { 
    return []; 
  }
};

const getSavedBookings = (email) => {
  try { 
    return JSON.parse(localStorage.getItem(email ? `bookings_${email}` : "bookings_guest")) || []; 
  } catch { 
    return []; 
  }
};

// ==========================================
// MAIN APP CONTENT
// ==========================================
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- GLOBAL STATE ---
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));
  const isLoggedIn = !!userEmail;

  const [cart, setCart] = useState(() => getSavedCart(userEmail));
  const [serviceBookings, setServiceBookings] = useState(() => getSavedBookings(userEmail));
  const [toast, setToast] = useState("");

  const cartCount = useMemo(() => cart.reduce((total, item) => total + (item.quantity || 1), 0), [cart]);
  const bookingCount = useMemo(() => serviceBookings.length, [serviceBookings]);

  // --- EFFECT HOOKS ---
  
  // Save Cart on change
  useEffect(() => {
    const key = userEmail ? `cart_${userEmail}` : "cart_guest";
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, userEmail]);

  // Save Bookings on change
  useEffect(() => {
    const key = userEmail ? `bookings_${userEmail}` : "bookings_guest";
    localStorage.setItem(key, JSON.stringify(serviceBookings));
  }, [serviceBookings, userEmail]);

  // Toast Auto-Dismiss Timer
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Sync login state across multiple open tabs
  useEffect(() => {
    const syncLoginState = () => {
      const currentStoredEmail = localStorage.getItem("userEmail");
      if (currentStoredEmail !== userEmail) {
        setUserEmail(currentStoredEmail);
        setCart(getSavedCart(currentStoredEmail));
        setServiceBookings(getSavedBookings(currentStoredEmail));
      }
    };
    window.addEventListener("storage", syncLoginState);
    return () => window.removeEventListener("storage", syncLoginState);
  }, [userEmail]);

  // Dynamic Page Titles for SEO
  useEffect(() => {
    const path = location.pathname.split("/")[1] || "home";
    const title = `${path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ")} • Last Planner Julz`;
    document.title = title;
  }, [location.pathname]);

  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    setCart([]);
    setServiceBookings([]);
    setToast("You have been signed out.");
    navigate("/");
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) return prevCart.map(item => item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setToast(`${product.title} added to your booking cart.`);
  };

  const bookRental = (service) => {
    setServiceBookings((prev) => [...prev, { ...service, quantity: 1, bookedAt: new Date().toISOString() }]);
    setToast(`${service.title} added to your booking requests.`);
  };

  const removeRental = (indexToRemove) => {
    setServiceBookings((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = (item.quantity || 1) + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Bundle props to pass to pages cleanly
  const sharedProps = { 
    userEmail, 
    cart, 
    addToCart, 
    bookRental, 
    serviceBookings, 
    removeRental, 
    updateQuantity, 
    removeFromCart 
  };

  const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <div className="site-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      
      <FocusManager />
      <HashBridge />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-[#1F2E27] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">
        Skip to content
      </a>

      {toast && (
        <div className="fixed left-1/2 top-4 z-[80] w-[min(92vw,24rem)] -translate-x-1/2 rounded-full border border-[#E8DFD1] bg-[#1F2E27] px-4 py-3 text-center text-sm font-medium text-white shadow-lg animate-fade-in-down" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      {/* --- GLOBAL NAVIGATION --- */}
      <nav aria-label="Main Navigation" className="sticky top-0 z-50 border-b border-[#D8CFBC] bg-[#F8F6F0]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(31,46,39,0.1)] no-print">
        <div className="site-container flex flex-col items-start gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-baseline gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8895C] rounded-sm">
            <span className="text-[0.95rem] font-serif font-semibold tracking-[0.18em] text-[#1F2E27]">Last Planner julz</span>
            <span className="text-[0.7rem] tracking-[0.28em] uppercase text-[#A8895C]">Funeral Home</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-[0.95rem] text-[#3D3530] md:gap-3">
            <Link to="/" className={`transition-opacity ${isActive("/") ? "border-b border-[#A8895C] text-[#1F2E27]" : "border-b border-transparent hover:opacity-80"} pb-1`}>Home</Link>
            <Link to="/memorial" className={`transition-opacity ${isActive("/memorial") ? "border-b border-[#A8895C] text-[#1F2E27]" : "border-b border-transparent hover:opacity-80"} pb-1`}>Memorial Hub</Link>
            <Link to="/plan" className={`transition-opacity ${isActive("/plan") ? "border-b border-[#A8895C] text-[#1F2E27]" : "border-b border-transparent hover:opacity-80"} pb-1`}>Plan Ahead</Link>
            <Link to="/catalog" className={`transition-opacity ${isActive("/catalog") ? "border-b border-[#A8895C] text-[#1F2E27]" : "border-b border-transparent hover:opacity-80"} pb-1`}>Catalog</Link>
            
            {!isLoggedIn && (
              <>
                <Link to="/login" className={`transition-opacity ${isActive("/login") ? "border-b border-[#A8895C] text-[#1F2E27]" : "border-b border-transparent hover:opacity-80"} pb-1`}>Sign In</Link>
                <Link to="/register" className={`transition-opacity ${isActive("/register") ? "border-b border-[#A8895C] text-[#1F2E27]" : "border-b border-transparent hover:opacity-80"} pb-1`}>Register</Link>
              </>
            )}
            
            <div className="ml-0 flex items-center gap-4 border-l border-[#D8CFBC] pl-4 md:ml-2">
              <Link to="/cart" className="relative text-[#A8895C] hover:text-[#1F2E27] transition-colors rounded-sm">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#1F2E27] text-white text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>
              <Link to="/bookings" className="relative text-[#A8895C] hover:text-[#1F2E27] transition-colors rounded-sm">
                <CalendarDays size={20} />
                {bookingCount > 0 && <span className="absolute -top-2 -right-2 bg-[#A8895C] text-white text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">{bookingCount}</span>}
              </Link>

              {isLoggedIn && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#A8895C] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {userEmail ? userEmail[0].toUpperCase() : "U"}
                  </div>
                  <button onClick={handleLogout} className="text-[#A8895C] hover:text-[#1F2E27] border-b border-transparent pb-1 transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN ROUTING AREA --- */}
      <main id="main-content" tabIndex="-1" className="focus:outline-none">
        
        {/* Floating Contact Button */}
        <a href="tel:+254799847727" className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-[#1F2E27] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition-transform hover:-translate-y-1">
          <MessageCircle size={18} /><span>Contact Us</span>
        </a>

        <Routes>
          {/* Main Public Pages */}
          <Route path="/" element={<HomePage {...sharedProps} />} />
          <Route path="/plan" element={<PlanAheadPage {...sharedProps} />} />
          <Route path="/obituaries" element={<ObituaryListPage {...sharedProps} />} />
          
          {/* Catalog & Commerce */}
          <Route path="/catalog" element={<CatalogPage {...sharedProps} />} />
          <Route path="/catalog/:id" element={<DynamicRouteWrapper Component={CatalogPage} sharedProps={sharedProps} />} />
          <Route path="/section/:id" element={<DynamicRouteWrapper Component={SectionPage} sharedProps={sharedProps} />} />
          <Route path="/cart" element={<CartPage {...sharedProps} />} />
          <Route path="/checkout" element={<CheckoutPage {...sharedProps} />} />
          <Route path="/booking-checkout" element={<BookingCheckoutPage {...sharedProps} />} />
          <Route path="/thankyou" element={<ThankYouPage {...sharedProps} />} />
          
          {/* Secure Pages */}
          <Route path="/bookings" element={<ProtectedRoute userEmail={userEmail}><BookingsPage {...sharedProps} /></ProtectedRoute>} />

          {/* ==================================================== */}
          {/* THE MEMORIAL HUB (Dynamic Grids & Sub-Pages)           */}
          {/* ==================================================== */}
          
          {/* 1. The Main Hub Dashboard */}
          <Route path="/memorial" element={<MemorialOverviewPage {...sharedProps} />} />
          <Route path="/memorial/:id" element={<DynamicRouteWrapper Component={MemorialOverviewPage} sharedProps={sharedProps} />} />

          {/* 2. The Individual Grid Pages (Flat paths dynamically loaded) */}
          <Route path="/overview/:id" element={<DynamicRouteWrapper Component={OverviewPage} sharedProps={sharedProps} />} />
          <Route path="/wall/:id" element={<DynamicRouteWrapper Component={MemorialWallPage} sharedProps={sharedProps} />} />
          <Route path="/pages/:id" element={<DynamicRouteWrapper Component={MemorialPagesPage} sharedProps={sharedProps} />} />
          <Route path="/gallery/:id" element={<DynamicRouteWrapper Component={GalleryPage} sharedProps={sharedProps} />} />
          <Route path="/flowers/:id" element={<DynamicRouteWrapper Component={VisitorFlowersPage} sharedProps={sharedProps} />} />
          <Route path="/candles/:id" element={<DynamicRouteWrapper Component={VisitorCandlesPage} sharedProps={sharedProps} />} />
          <Route path="/family/:id" element={<DynamicRouteWrapper Component={FamilyAndFriendsPage} sharedProps={sharedProps} />} />
          <Route path="/tree/:id" element={<DynamicRouteWrapper Component={FamilyTreePage} sharedProps={sharedProps} />} />
          <Route path="/journal/:id" element={<DynamicRouteWrapper Component={LiveJournalPage} sharedProps={sharedProps} />} />
          <Route path="/tribute/:id" element={<DynamicRouteWrapper Component={TributePage} sharedProps={sharedProps} />} />
          
          {/* 3. The Eulogy System */}
          <Route path="/eulogy/:id" element={<ProtectedRoute userEmail={userEmail}><DynamicRouteWrapper Component={WriteEulogyPage} sharedProps={sharedProps} /></ProtectedRoute>} />
          <Route path="/eulogy_view/:id" element={<DynamicRouteWrapper Component={EulogyViewPage} sharedProps={sharedProps} />} />

          {/* ==================================================== */}

          {/* Authentication & Account Recovery */}
          <Route path="/login" element={<LoginPage {...sharedProps} />} />
          <Route path="/register" element={<RegisterPage {...sharedProps} />} />
          <Route path="/verify" element={<EmailVerificationPage {...sharedProps} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage {...sharedProps} />} />
          <Route path="/reset-password" element={<ResetPasswordPage {...sharedProps} />} />

          {/* 404 Catch-All Fallback */}
          <Route path="*" element={<HomePage {...sharedProps} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}