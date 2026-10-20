import { getApiBaseUrl, getSiteUrl } from "./services/config";
import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useEffect, useMemo, useState, useRef, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { ShoppingCart, CalendarDays, MessageCircle, Shield, Phone, X, Menu, MessageSquare, LogOut, BookOpen, User, Settings } from "lucide-react";

// --- MAIN PAGES ---
const HomePage = lazy(() => import("./pages/HomePage"));
const PlanAheadPage = lazy(() => import("./pages/PlanAheadPage"));
const PackagesPage = lazy(() => import("./pages/packagespage"));
const ObituaryListPage = lazy(() => import("./pages/ObituaryListPage"));

// --- CATALOG & COMMERCE ---
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const SectionPage = lazy(() => import("./pages/SectionPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const BookingCheckoutPage = lazy(() => import("./pages/BookingCheckoutPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));

// --- ADMIN ---
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));

// --- AUTHENTICATION ---
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const EmailVerificationPage = lazy(() => import("./pages/EmailVerificationPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

// --- MEMORIAL HUB ---
const MemorialOverviewPage = lazy(() => import("./pages/MemorialOverviewPage"));
const OverviewPage = lazy(() => import("./pages/OverviewPage"));
const MemorialWallPage = lazy(() => import("./pages/MemorialWallPage"));
const MemorialPagesPage = lazy(() => import("./pages/MemorialPagesPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const VisitorFlowersPage = lazy(() => import("./pages/VisitorFlowersPage"));
const VisitorCandlesPage = lazy(() => import("./pages/VisitorCandlesPage"));
const FamilyAndFriendsPage = lazy(() => import("./pages/FamilyAndFriendsPage"));
const FamilyTreePage = lazy(() => import("./pages/FamilyTreePage"));
const LiveJournalPage = lazy(() => import("./pages/LiveJournalPage"));
const WriteEulogyPage = lazy(() => import("./pages/WriteEulogyPage"));

// --- NEW PUBLIC DIGITAL TRIBUTE & SETTINGS ---
const DigitalTribute = lazy(() => import("./pages/DigitalTribute"));
const SettingsPage = lazy(() => import("./pages/Settingspage"));

import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import CookieConsent from "./components/CookieConsent";
import ChatWidget from "./components/chat/ChatWidget";

import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";

// ==========================================
// UTILITY COMPONENTS
// ==========================================
const FocusManager = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
    const mainContent = document.getElementById("main-content");
    if (mainContent) mainContent.focus({ preventScroll: true });
  }, [pathname]);
  return null;
};

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

const PageMetadata = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    const publicPages = {
      "/": ["Funeral Planning & Memorial Support Across Kenya", "Explore funeral planning, pre-planning, memorial tributes, and caring support from Last Planner Julz Funeral Planning Hub in Kahawa West, serving families across Kenya."],
      "/plan": ["Plan Ahead with Confidence", "Explore funeral pre-planning, review available packages, and request a consultation with Last Planner Julz."],
      "/packages": ["Funeral Planning Packages", "Review funeral and memorial packages from Last Planner Julz and request an itemized quote."],
      "/obituaries": ["Obituaries and Memorials", "Remember loved ones and find public obituary information from Last Planner Julz."],
      "/catalog": ["Funeral Products and Services", "Browse funeral products, floral tributes, transport, service setups, and media options."],
      "/privacy": ["Privacy Policy", "Learn how Last Planner Julz handles browser storage, account details, enquiries, and payment information."],
      "/terms": ["Terms of Use", "Read the terms for using Last Planner Julz funeral planning and memorial services."],
      "/refunds": ["Refund and Cancellation Policy", "Review cancellation, rescheduling, returns, and refund information for Last Planner Julz."],
    };
    const privateRoute = /^\/(admin|bookings|cart|checkout|booking-checkout|thankyou|thank-you|settings|login|register|verify|forgot-password|reset-password|eulogy|memorial|overview|wall|pages|gallery|flowers|candles|family|tree|journal)(?:\/|$)/.test(path);
    let page = publicPages[path];
    if (!page && /^\/product\/[^/]+$/.test(path)) page = ["Funeral Product Details", "View product details and availability from Last Planner Julz."];
    if (!page && /^\/(?:catalog|section)\/[^/]+$/.test(path)) page = ["Funeral Product Category", "Browse funeral and memorial products from Last Planner Julz."];
    const isNotFound = !page && !privateRoute;
    page = page || (isNotFound
      ? ["Page Not Found", "The requested page could not be found. Browse funeral planning services and memorial products from Last Planner Julz."]
      : ["Account and Memorial Services", "Manage your account, planning requests, or memorial workspace."]);
    const [title, description] = page;
    const canonicalUrl = `${getSiteUrl()}${path}`;
    document.title = `${title} | Last Planner Julz`;
    const setMeta = (selector, attribute, key, value) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, key);
      element.setAttribute('content', value);
    };
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', document.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', document.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="robots"]', 'name', 'robots', privateRoute || isNotFound ? 'noindex,nofollow' : 'index,follow');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [pathname]);

  return null;
};

const DynamicRouteWrapper = ({ Component, sharedProps }) => {
  const params = useParams();
  const dynamicId = params.id || null;
  return <Component dynamicId={dynamicId} {...sharedProps} />;
};

const NotFoundPage = () => (
  <section className="site-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
    <p className="section-eyebrow">Page not found</p>
    <h1 className="mt-3 font-serif text-4xl font-semibold text-[#1F2E27]">We couldn’t find that page</h1>
    <p className="mt-4 max-w-xl text-[#3D3530]">The link may have changed. You can return home, browse the catalog, or call our team for help.</p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Link to="/" className="rounded bg-[#1F2E27] px-5 py-3 font-semibold text-white hover:bg-[#A8895C]">Go to homepage</Link>
      <Link to="/catalog" className="rounded border border-[#1F2E27] px-5 py-3 font-semibold text-[#1F2E27] hover:bg-[#EFEAE0]">Browse catalog</Link>
      <a href="tel:+254799847727" className="rounded border border-[#1F2E27] px-5 py-3 font-semibold text-[#1F2E27] hover:bg-[#EFEAE0]">Call our team</a>
    </div>
  </section>
);

const getSavedCart = (email) => {
  try { return JSON.parse(localStorage.getItem(email ? `cart_${email}` : "cart_guest")) || []; }
  catch { return []; }
};

const getSavedBookings = (email) => {
  try { return JSON.parse(localStorage.getItem(email ? `bookings_${email}` : "bookings_guest")) || []; }
  catch { return []; }
};

const mergeCart = (accountCart, guestCart) => {
  const merged = [...accountCart];
  guestCart.forEach((guestItem) => {
    const guestId = guestItem.cartItemId || guestItem.id;
    const existingIndex = merged.findIndex((item) => (item.cartItemId || item.id) === guestId);
    if (existingIndex === -1) merged.push(guestItem);
    else merged[existingIndex] = { ...merged[existingIndex], quantity: (merged[existingIndex].quantity || 1) + (guestItem.quantity || 1) };
  });
  return merged;
};

// ==========================================
// FLOATING WHATSAPP & CONTACT WIDGET
// ==========================================
const FloatingContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end">
      {isOpen && (
        <div id="floating-contact-options" className="mb-4 bg-white rounded-xl shadow-2xl border border-[#E8DFD1] p-2 flex flex-col gap-2 w-48 animate-fadeIn">
          <a href="https://wa.me/254799847727" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 text-[#1F2E27] transition-colors">
            <div className="bg-emerald-500 text-white p-2 rounded-full"><MessageCircle size={18} /></div>
            <span className="text-sm font-bold">WhatsApp Us</span>
          </a>
          <a href="tel:+254799847727" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F6F0] text-[#1F2E27] transition-colors">
            <div className="bg-[#1F2E27] text-white p-2 rounded-full"><Phone size={18} /></div>
            <span className="text-sm font-bold">Call Directly</span>
          </a>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls="floating-contact-options" aria-label={isOpen ? "Close contact options" : "Open contact options"} className="bg-[#1F2E27] text-white px-3 py-3.5 sm:px-5 rounded-full shadow-2xl hover:bg-[#A8895C] transition-all flex items-center gap-2 font-bold tracking-widest text-sm uppercase">
        {isOpen ? <X size={18} /> : <MessageSquare size={18} />}
        <span className="hidden sm:inline">{isOpen ? "Close" : "Contact Us"}</span>
      </button>
    </div>
  );
};

// ==========================================
// MAIN APP CONTENT
// ==========================================
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- GLOBAL STATE ---
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("token") ? localStorage.getItem("userEmail") : null);
  const [isAdmin, setIsAdmin] = useState(() => Boolean(localStorage.getItem("token") && localStorage.getItem("isAdmin") === "true"));

  const [userProfilePic, setUserProfilePic] = useState(localStorage.getItem("userProfilePic") || "");
  const [localProfilePic, setLocalProfilePic] = useState(null); // PRO-GRADE: Stores instant local preview
  const [imgError, setImgError] = useState(false);

  const isLoggedIn = !!userEmail;

  const [cart, setCart] = useState(() => getSavedCart(userEmail));
  const [serviceBookings, setServiceBookings] = useState(() => getSavedBookings(userEmail));
  const [toast, setToast] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const portalRef = useRef(null);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + (item.quantity || 1), 0), [cart]);
  const bookingCount = useMemo(() => serviceBookings.length, [serviceBookings]);
  const API_URL = getApiBaseUrl();

  // --- EFFECT HOOKS ---
  useEffect(() => {
    const key = userEmail ? `cart_${userEmail}` : "cart_guest";
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, userEmail]);

  useEffect(() => {
    const key = userEmail ? `bookings_${userEmail}` : "bookings_guest";
    localStorage.setItem(key, JSON.stringify(serviceBookings));
  }, [serviceBookings, userEmail]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Sync avatar when updated in SettingsPage via our Custom Event
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      const { serverUrl, localUrl } = e.detail;
      if (localUrl) setLocalProfilePic(localUrl); // Instant update via local Blob

      setUserProfilePic(serverUrl);
      localStorage.setItem("userProfilePic", serverUrl);
      setImgError(false);
    };
    window.addEventListener('profilePictureUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("isAdmin");
        setUserEmail(null);
        setIsAdmin(false);
        return;
      }
      fetch(`${API_URL}/api/user/profile`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(async (res) => {
          if (res.status === 401 || res.status === 404 || res.status === 422) {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("isAdmin");
            localStorage.removeItem("userProfilePic");
            setUserEmail(null);
            setIsAdmin(false);
            setUserProfilePic("");
            setCart(getSavedCart(null));
            setServiceBookings(getSavedBookings(null));
            return null;
          }
          if (!res.ok) return null;
          return res.json();
        })
        .then(data => {
          if (data?.profile_picture) {
            setUserProfilePic(data.profile_picture);
            localStorage.setItem("userProfilePic", data.profile_picture);
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn, API_URL]);

  useEffect(() => {
    const syncLoginState = () => {
      const tokenExists = Boolean(localStorage.getItem("token"));
      const currentStoredEmail = tokenExists ? localStorage.getItem("userEmail") : null;
      const currentStoredAdmin = Boolean(tokenExists && localStorage.getItem("isAdmin") === "true");
      const currentPic = localStorage.getItem("userProfilePic");

      if (currentStoredEmail !== userEmail) {
        setUserEmail(currentStoredEmail);
        setIsAdmin(currentStoredAdmin);
        setUserProfilePic(currentPic || "");
        setCart(currentStoredEmail ? mergeCart(getSavedCart(currentStoredEmail), getSavedCart(null)) : getSavedCart(null));
        setServiceBookings(currentStoredEmail ? [...getSavedBookings(currentStoredEmail), ...getSavedBookings(null)] : getSavedBookings(null));
      }
    };
    window.addEventListener("storage", syncLoginState);
    return () => window.removeEventListener("storage", syncLoginState);
  }, [userEmail]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (portalRef.current && !portalRef.current.contains(event.target)) {
        setIsPortalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userProfilePic");
    setUserEmail(null);
    setIsAdmin(false);
    setUserProfilePic("");
    setLocalProfilePic(null);
    setCart([]);
    setServiceBookings([]);
    setIsPortalOpen(false);
    setToast("You have been signed out.");
    navigate("/");
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const cartItemId = product.cartItemId || product.id;
      const existing = prevCart.find(item => (item.cartItemId || item.id) === cartItemId);
      if (existing) {
        return prevCart.map(item => (item.cartItemId || item.id) === cartItemId ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
      }
      return [...prevCart, { ...product, cartItemId, quantity: 1 }];
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

  const updateQuantity = (cartItemId, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if ((item.cartItemId || item.id) === cartItemId) {
        const newQty = (item.quantity || 1) + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => (item.cartItemId || item.id) !== cartItemId));
  };

  const sharedProps = { userEmail, cart, addToCart, bookRental, serviceBookings, removeRental, updateQuantity, removeFromCart };
  const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
  const memorialRouteMatch = location.pathname.match(/^\/(?:memorial|overview|wall|pages|gallery|flowers|candles|family|tree|journal)\/([^/]+)/);
  const closeMobileNav = () => setIsMobileNavOpen(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const getDisplayName = (email) => {
    if (!email) return "User";
    const username = email.split("@")[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  // Determine navbar avatar (prioritize the instant local preview if it exists)
  const displayNavPic = localProfilePic || (userProfilePic ? getImageUrl(userProfilePic) : null);

  return (
    <div className="site-shell flex flex-col min-h-screen relative">
      <style>{`
        @keyframes fadeInDropdown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInDropdown { animation: fadeInDropdown 0.2s ease-out forwards; }
      `}</style>
      <FocusManager />
      <HashBridge />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-[#1F2E27] focus:px-4 focus:py-2 text-white">Skip to content</a>

      {toast && (
        <div className="fixed left-1/2 top-4 z-[80] w-[min(92vw,24rem)] -translate-x-1/2 rounded-full border border-[#E8DFD1] bg-[#1F2E27] px-4 py-3 text-center text-sm font-medium text-white shadow-lg animate-fade-in-down" role="status">
          {toast}
        </div>
      )}

      <nav aria-label="Main Navigation" className="sticky top-0 z-50 border-b border-[#D8CFBC] bg-[#F8F6F0]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(31,46,39,0.1)] no-print">
        <div className="site-container flex flex-col items-start gap-2 py-3 md:flex-row md:items-center md:justify-between md:py-4">
          <div className="flex w-full items-center justify-between md:w-auto">
            <Link to="/" onClick={closeMobileNav} className="flex items-baseline gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8895C] sm:gap-3">
              <span className="text-[0.9rem] font-serif font-semibold tracking-[0.14em] text-[#1F2E27] sm:text-[0.95rem] sm:tracking-[0.18em]">Last Planner julz</span>
              <span className="text-[0.62rem] tracking-[0.2em] uppercase text-[#805400] sm:text-[0.7rem] sm:tracking-[0.28em]">Funeral Home</span>
            </Link>
            <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-[#D8CFBC] text-[#1F2E27] md:hidden" aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isMobileNavOpen} aria-controls="main-navigation-links" onClick={() => setIsMobileNavOpen((open) => !open)}>
              {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div id="main-navigation-links" className={`${isMobileNavOpen ? "flex" : "hidden"} w-full flex-wrap items-center gap-1 border-t border-[#D8CFBC] pt-2 text-[0.95rem] text-[#3D3530] md:flex md:w-auto md:gap-3 md:border-0 md:pt-0`}>
            <Link to="/" onClick={closeMobileNav} aria-current={isActive("/") ? "page" : undefined} className={`flex min-h-11 items-center rounded px-2 transition-colors hover:bg-[#EFEAE0] md:min-h-0 md:rounded-none md:bg-transparent md:px-0 ${isActive("/") ? "text-[#1F2E27] md:border-b md:border-[#A8895C]" : "md:border-b md:border-transparent"}`}>Home</Link>
            <Link to="/memorial" onClick={closeMobileNav} aria-current={isActive("/memorial") ? "page" : undefined} className={`flex min-h-11 items-center rounded px-2 transition-colors hover:bg-[#EFEAE0] md:min-h-0 md:rounded-none md:bg-transparent md:px-0 ${isActive("/memorial") ? "text-[#1F2E27] md:border-b md:border-[#A8895C]" : "md:border-b md:border-transparent"}`}>Memorial Hub</Link>
            <Link to="/plan" onClick={closeMobileNav} aria-current={isActive("/plan") ? "page" : undefined} className={`flex min-h-11 items-center rounded px-2 transition-colors hover:bg-[#EFEAE0] md:min-h-0 md:rounded-none md:bg-transparent md:px-0 ${isActive("/plan") ? "text-[#1F2E27] md:border-b md:border-[#A8895C]" : "md:border-b md:border-transparent"}`}>Plan Ahead</Link>
            <Link to="/catalog" onClick={closeMobileNav} aria-current={isActive("/catalog") ? "page" : undefined} className={`flex min-h-11 items-center rounded px-2 transition-colors hover:bg-[#EFEAE0] md:min-h-0 md:rounded-none md:bg-transparent md:px-0 ${isActive("/catalog") ? "text-[#1F2E27] md:border-b md:border-[#A8895C]" : "md:border-b md:border-transparent"}`}>Catalog</Link>

            {!isLoggedIn && (
              <>
                <Link to="/login" onClick={closeMobileNav} className={`flex min-h-11 items-center rounded px-2 transition-colors hover:bg-[#EFEAE0] md:min-h-0 md:rounded-none md:bg-transparent md:px-0 ${isActive("/login") ? "text-[#1F2E27] md:border-b md:border-[#A8895C]" : "md:border-b md:border-transparent"}`}>Sign In</Link>
                <Link to="/register" onClick={closeMobileNav} className={`flex min-h-11 items-center rounded px-2 transition-colors hover:bg-[#EFEAE0] md:min-h-0 md:rounded-none md:bg-transparent md:px-0 ${isActive("/register") ? "text-[#1F2E27] md:border-b md:border-[#A8895C]" : "md:border-b md:border-transparent"}`}>Register</Link>
              </>
            )}

            <div className="ml-0 flex min-h-11 items-center gap-4 border-l border-[#D8CFBC] pl-3 md:ml-2 md:pl-4">
              <Link to="/cart" onClick={closeMobileNav} aria-label={`Planning cart${cartCount ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ", empty"}`} className="relative rounded-sm text-[#805400] transition-colors hover:text-[#1F2E27]">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#1F2E27] text-white text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>

              {isLoggedIn && (
                <div className="relative" ref={portalRef}>
                  <button
                    onClick={() => setIsPortalOpen(!isPortalOpen)}
                    aria-label="Open account menu"
                    aria-expanded={isPortalOpen}
                    className="flex items-center justify-center focus:outline-none transition-transform hover:scale-105"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EA4335] flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-transparent focus-within:ring-[#1F2E27] overflow-hidden">
                      {displayNavPic && !imgError ? (
                        <img src={displayNavPic} alt="Account profile photo" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                      ) : (
                        userEmail ? userEmail[0].toUpperCase() : "U"
                      )}
                    </div>
                  </button>

                  {isPortalOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-[#E8DFD1] rounded-[1.25rem] shadow-2xl overflow-hidden z-50 animate-fadeInDropdown p-2">

                      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EA4335] flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                            {displayNavPic && !imgError ? (
                              <img src={displayNavPic} alt="Account profile photo" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                            ) : (
                              userEmail ? userEmail[0].toUpperCase() : "U"
                            )}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-[#1F2E27] truncate max-w-[120px]">{getDisplayName(userEmail)}</span>
                            <span className="text-[11px] font-medium text-[#716860]">user</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="text-[10px] text-emerald-700 font-bold tracking-wide">Active</span>
                        </div>
                      </div>

                      <div className="px-3 pb-2 text-[10px] font-bold text-[#716860] uppercase tracking-widest border-b border-[#F8F6F0] mb-2 text-left">
                        Account
                      </div>

                      <div className="flex flex-col gap-1">
                        <Link
                          to="/settings?tab=profile"
                          onClick={() => setIsPortalOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8F6F0] transition-colors group text-left"
                        >
                          <User size={18} className="text-[#716860] group-hover:text-[#1F2E27] mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#1F2E27]">Profile details</span>
                            <span className="text-[11px] text-[#716860] leading-tight mt-0.5">Name, photo, email, and phone</span>
                          </div>
                        </Link>

                        <Link
                          to="/settings?tab=account"
                          onClick={() => setIsPortalOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8F6F0] transition-colors group text-left"
                        >
                          <Settings size={18} className="text-[#716860] group-hover:text-[#1F2E27] mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#1F2E27]">Account settings</span>
                            <span className="text-[11px] text-[#716860] leading-tight mt-0.5">Password, plan, and memorial controls</span>
                          </div>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsPortalOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors group text-left"
                          >
                            <Shield size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-emerald-700">Admin Command</span>
                              <span className="text-[11px] text-emerald-600/80 leading-tight mt-0.5">Manage products, orders, and users</span>
                            </div>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors group w-full text-left mt-1"
                        >
                          <LogOut size={18} className="text-red-500 mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-red-600">Sign out</span>
                            <span className="text-[11px] text-red-500/80 leading-tight mt-0.5">End this dashboard session</span>
                          </div>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" tabIndex="-1" className="focus:outline-none">
        <FloatingContactWidget />
        <ChatWidget />
        {memorialRouteMatch && memorialRouteMatch[1] !== "demo" && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm leading-relaxed text-amber-950" role="note">
            This memorial workspace saves activity in this browser only. It does not sync to relatives’ devices or have server backups; avoid entering sensitive details.
          </div>
        )}
        <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center p-6"><LoadingSpinner /></div>}>
          <Routes>
          <Route path="/" element={<HomePage {...sharedProps} />} />
          <Route path="/plan" element={<PlanAheadPage {...sharedProps} />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/obituaries" element={<ObituaryListPage {...sharedProps} />} />
          <Route path="/catalog" element={<CatalogPage {...sharedProps} />} />
          <Route path="/catalog/:id" element={<DynamicRouteWrapper Component={CatalogPage} sharedProps={sharedProps} />} />
          <Route path="/product/:id" element={<ProductPage {...sharedProps} />} />
          <Route path="/section/:id" element={<DynamicRouteWrapper Component={SectionPage} sharedProps={sharedProps} />} />
          <Route path="/cart" element={<CartPage {...sharedProps} />} />
          <Route path="/checkout" element={<CheckoutPage {...sharedProps} />} />
          <Route path="/booking-checkout" element={<BookingCheckoutPage {...sharedProps} />} />
          <Route path="/thank-you" element={<ThankYouPage {...sharedProps} />} />
          <Route path="/thankyou" element={<Navigate to="/thank-you" replace />} />
          <Route path="/bookings" element={<ProtectedRoute userEmail={userEmail}><BookingsPage {...sharedProps} /></ProtectedRoute>} />
          {isAdmin && <Route path="/admin" element={<AdminDashboardPage />} />}
          <Route path="/memorial" element={<MemorialOverviewPage {...sharedProps} />} />
          <Route path="/memorial/download/:eulogyId" element={<DigitalTribute />} />
          <Route path="/settings" element={<ProtectedRoute userEmail={userEmail}><SettingsPage /></ProtectedRoute>} />
          <Route path="/memorial/:id" element={<DynamicRouteWrapper Component={MemorialOverviewPage} sharedProps={sharedProps} />} />
          <Route path="/overview/:id" element={<DynamicRouteWrapper Component={OverviewPage} sharedProps={sharedProps} />} />
          <Route path="/wall/:id" element={<DynamicRouteWrapper Component={MemorialWallPage} sharedProps={sharedProps} />} />
          <Route path="/pages/:id" element={<DynamicRouteWrapper Component={MemorialPagesPage} sharedProps={sharedProps} />} />
          <Route path="/gallery/:id" element={<DynamicRouteWrapper Component={GalleryPage} sharedProps={sharedProps} />} />
          <Route path="/flowers/:id" element={<DynamicRouteWrapper Component={VisitorFlowersPage} sharedProps={sharedProps} />} />
          <Route path="/candles/:id" element={<DynamicRouteWrapper Component={VisitorCandlesPage} sharedProps={sharedProps} />} />
          <Route path="/family/:id" element={<DynamicRouteWrapper Component={FamilyAndFriendsPage} sharedProps={sharedProps} />} />
          <Route path="/tree/:id" element={<DynamicRouteWrapper Component={FamilyTreePage} sharedProps={sharedProps} />} />
          <Route path="/journal/:id" element={<DynamicRouteWrapper Component={LiveJournalPage} sharedProps={sharedProps} />} />
          <Route path="/eulogy/:id" element={<ProtectedRoute userEmail={userEmail}><DynamicRouteWrapper Component={WriteEulogyPage} sharedProps={sharedProps} /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage {...sharedProps} />} />
          <Route path="/register" element={<RegisterPage {...sharedProps} />} />
          <Route path="/verify" element={<EmailVerificationPage {...sharedProps} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage {...sharedProps} />} />
          <Route path="/reset-password" element={<ResetPasswordPage {...sharedProps} />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refunds" element={<RefundPolicyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </main>
      <CookieConsent />
    </div>
  );
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "missing-client-id";
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <PageMetadata />
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}
