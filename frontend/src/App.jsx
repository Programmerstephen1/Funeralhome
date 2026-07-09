import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, CalendarDays, MessageCircle } from "lucide-react"; 
import HomePage from "./pages/HomePage";
import MemorialOverviewPage from "./pages/MemorialOverviewPage";
import PlanAheadPage from "./pages/PlanAheadPage";
import TributePage from "./pages/TributePage";
import WriteEulogyPage from "./pages/WriteEulogyPage";
import EulogyViewPage from './pages/EulogyViewPage'; 
import OverviewPage from "./pages/OverviewPage";
import MemorialWallPage from "./pages/MemorialWallPage";
import MemorialPagesPage from "./pages/MemorialPagesPage";
import GalleryPage from "./pages/GalleryPage";
import VisitorFlowersPage from "./pages/VisitorFlowersPage";
import VisitorCandlesPage from "./pages/VisitorCandlesPage";
import FamilyAndFriendsPage from "./pages/FamilyAndFriendsPage";
import FamilyTreePage from "./pages/FamilyTreePage";
import LiveJournalPage from "./pages/LiveJournalPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CatalogPage from "./pages/CatalogPage"; 
import CartPage from "./pages/CartPage"; 
import CheckoutPage from "./pages/CheckoutPage";
import BookingCheckoutPage from "./pages/BookingCheckoutPage"; 
import ThankYouPage from "./pages/ThankYouPage";
import BookingsPage from "./pages/BookingsPage";

// PRO-GRADE ADDITIONS: The secure authentication screens
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const sectionPages = {
  overview: OverviewPage,
  memorialWall: MemorialWallPage,
  memorialPages: MemorialPagesPage,
  gallery: GalleryPage,
  visitorFlowers: VisitorFlowersPage,
  visitorCandles: VisitorCandlesPage,
  familyAndFriends: FamilyAndFriendsPage,
  familyTree: FamilyTreePage,
  liveJournal: LiveJournalPage,
  eulogy: WriteEulogyPage, 
};

const pages = [
  { id: "home", label: "Home", Component: HomePage },
  { id: "memorial", label: "Memorial Hub", Component: MemorialOverviewPage },
  { id: "plan", label: "Plan Ahead", Component: PlanAheadPage },
  { id: "catalog", label: "Catalog", Component: CatalogPage }, 
  { id: "cart", label: "Cart", Component: CartPage }, 
  { id: "bookings", label: "Bookings", Component: BookingsPage },
  { id: "checkout", label: "Checkout", Component: CheckoutPage },
  { id: "booking-checkout", label: "Booking Checkout", Component: BookingCheckoutPage }, 
  { id: "thankyou", label: "Complete", Component: ThankYouPage },
  { id: "tribute", label: "Tribute", Component: TributePage },
  { id: "eulogy_view", label: "View Eulogy", Component: EulogyViewPage },
  { id: "login", label: "Sign In", Component: LoginPage },
  { id: "register", label: "Register", Component: RegisterPage },
  
  // SECURE ROUTES
  { id: "verify", label: "Verify Email", Component: EmailVerificationPage },
  { id: "forgot-password", label: "Forgot Password", Component: ForgotPasswordPage },
  { id: "reset-password", label: "Reset Password", Component: ResetPasswordPage },
];

function normalizeHash(hash) {
  const rawValue = (hash || "").replace(/^#/, "");
  if (rawValue.startsWith("eulogy_view/")) return rawValue; 
  
  const match = pages.find((page) => rawValue.toLowerCase().startsWith(page.id.toLowerCase()));
  if (match) return rawValue; 
  
  const sectionMatch = Object.keys(sectionPages).find((key) => rawValue.toLowerCase().startsWith(key.toLowerCase()));
  if (sectionMatch) return rawValue; 
  
  return "home";
}

const getSavedCart = (email) => {
  try { return JSON.parse(localStorage.getItem(email ? `cart_${email}` : "cart_guest")) || []; } 
  catch { return []; }
};

const getSavedBookings = (email) => {
  try { return JSON.parse(localStorage.getItem(email ? `bookings_${email}` : "bookings_guest")) || []; } 
  catch { return []; }
};

export default function App() {
  const [currentHash, setCurrentHash] = useState(() => normalizeHash(window.location.hash));
  const [currentPage, currentDynamicId] = currentHash.split("/");

  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));
  const isLoggedIn = !!userEmail;

  const [cart, setCart] = useState(() => getSavedCart(userEmail));
  const [serviceBookings, setServiceBookings] = useState(() => getSavedBookings(userEmail));
  const [toast, setToast] = useState("");

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const bookingCount = useMemo(() => serviceBookings.length, [serviceBookings]);

  useEffect(() => {
    const key = userEmail ? `cart_${userEmail}` : "cart_guest";
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, userEmail]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const key = userEmail ? `bookings_${userEmail}` : "bookings_guest";
    localStorage.setItem(key, JSON.stringify(serviceBookings));
  }, [serviceBookings, userEmail]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    setCart([]);
    setServiceBookings([]);
    setToast("You have been signed out.");
    window.location.hash = "#home";
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
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
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(normalizeHash(window.location.hash));
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const ActivePage = useMemo(() => {
    const page = pages.find((page) => page.id === currentPage);
    if (page) return page.Component;
    const SectionComponent = sectionPages[currentPage];
    if (SectionComponent) return SectionComponent;
    return HomePage;
  }, [currentPage]);

  useEffect(() => {
    const pageLabel = pages.find((page) => page.id === currentPage)?.label || "Home";
    document.title = `${pageLabel} • Last Planner Julz`;
  }, [currentPage]);

  return (
    <div className="site-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-[#1F2E27] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">
        Skip to content
      </a>
      {toast && (
        <div className="fixed left-1/2 top-4 z-[80] w-[min(92vw,24rem)] -translate-x-1/2 rounded-full border border-[#E8DFD1] bg-[#1F2E27] px-4 py-3 text-center text-sm font-medium text-white shadow-lg" role="status" aria-live="polite">
          {toast}
        </div>
      )}
      <nav className="sticky top-0 z-50 border-b border-[#D8CFBC] bg-[#F8F6F0]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(31,46,39,0.1)] no-print">
        <div className="site-container flex flex-col items-start gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <a href="#home" className="flex items-baseline gap-3">
            <span className="text-[0.95rem] font-serif font-semibold tracking-[0.18em] text-[#1F2E27]">Last Planner julz</span>
            <span className="text-[0.7rem] tracking-[0.28em] uppercase text-[#A8895C]">Funeral Home</span>
          </a>

          <div className="flex flex-wrap items-center gap-2 text-[0.95rem] text-[#3D3530] md:gap-3">
            {pages.map((page) => {
              if (isLoggedIn && (page.id === "login" || page.id === "register")) return null;
              
              // HIDE THE UTILITY & AUTH SCREENS FROM THE TOP MENU
              if (["cart", "checkout", "booking-checkout", "thankyou", "bookings", "tribute", "eulogy_view", "verify", "forgot-password", "reset-password"].includes(page.id)) return null;
              
              return (
                <a
                  key={page.id}
                  href={`#${page.id}`}
                  aria-current={currentPage === page.id ? "page" : undefined}
                  className={`transition-opacity ${currentPage === page.id ? "border-b border-[#A8895C] text-[#1F2E27]" : "border-b border-transparent hover:opacity-80"} pb-1`}
                >
                  {page.label}
                </a>
              );
            })}
            
            <div className="ml-0 flex items-center gap-4 border-l border-[#D8CFBC] pl-4 md:ml-2">
              <a href="#cart" aria-label="Shopping cart" className="relative text-[#A8895C] hover:text-[#1F2E27] transition-colors">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#1F2E27] text-white text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </a>

              <a href="#bookings" aria-label="Service bookings" className="relative text-[#A8895C] hover:text-[#1F2E27] transition-colors">
                <CalendarDays size={20} />
                {bookingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#A8895C] text-white text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {bookingCount}
                  </span>
                )}
              </a>

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

      <main id="main-content" tabIndex="-1">
        <a
          href="tel:+254799847727"
          aria-label="Call Last Planner Julz"
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-[#1F2E27] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_16px_40px_rgba(31,46,39,0.25)] transition-transform hover:-translate-y-1"
        >
          <MessageCircle size={18} />
          <span>Contact Us</span>
        </a>
        <ActivePage 
          dynamicId={currentDynamicId}
          userEmail={userEmail} // EXTREMELY IMPORTANT: Passes the email to the OTP screen
          cart={cart} 
          addToCart={addToCart} 
          bookRental={bookRental}
          serviceBookings={serviceBookings}
          removeRental={removeRental}
          updateQuantity={updateQuantity} 
          removeFromCart={removeFromCart} 
        />
      </main>
    </div>
  );
}