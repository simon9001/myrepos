import React, { useState, useEffect, useCallback, memo } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";

// Import components
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import Projects from './pages/Projects';
import Testimonials from './pages/Testimonials';
import UserRoute from './components/auth/UserRoute';
import AdminRoute from './components/auth/AdminRoute';

// Import pages
import Home from "./pages/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import ProductDetail from "./pages/ProductDetail";
import Partners from "./pages/Partners";
import SponsorApply from "./pages/SponsorApply";


// --- NEW AWESOME BACKGROUND ---
export const StaticBackground = memo(({ theme }) => {
  const lightStyles = {
    backgroundColor: 'hsl(140, 60%, 98%)', // Very light green tint
    backgroundImage: `
      radial-gradient(ellipse at 10% 10%, hsla(140, 70%, 94%, 0.5), transparent),
      radial-gradient(ellipse at 90% 90%, hsla(160, 70%, 94%, 0.5), transparent),
      linear-gradient(hsl(140, 40%, 96%) 1px, transparent 1px),
      linear-gradient(to right, hsl(140, 40%, 96%) 1px, hsl(140, 60%, 98%) 1px)
    `,
    backgroundSize: '40px 40px',
  };

  const darkStyles = {
    backgroundColor: 'hsl(222, 47%, 11%)', // Deep dark blue/gray
    backgroundImage: `
      radial-gradient(ellipse at 10% 10%, hsla(140, 50%, 15%, 0.2), transparent),
      radial-gradient(ellipse at 90% 90%, hsla(160, 50%, 20%, 0.2), transparent),
      linear-gradient(hsla(222, 47%, 13%, 1) 1px, transparent 1px),
      linear-gradient(to right, hsla(222, 47%, 13%, 1) 1px, hsl(222, 47%, 11%) 1px)
    `,
    backgroundSize: '40px 40px',
  };

  const styles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <div
      className="fixed inset-0 -z-50 pointer-events-none transition-colors duration-500"
      style={styles}
    />
  );
});
StaticBackground.displayName = "StaticBackground";

// --- ANIMATION LOGIC ---
const pageVariants = { initial: { opacity: 0, y: 10 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -10 } };
const pageTransition = { type: "tween", ease: "easeOut", duration: 0.3 };

// Memoize the routes
const AnimatedRoutes = memo(() => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Home />
          </motion.div>
        } />
        <Route path="/about" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <About />
          </motion.div>
        } />
        <Route path="/contact" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Contact />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Login />
          </motion.div>
        } />
        <Route path="/register" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Register />
          </motion.div>
        } />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <Dashboard />
              </motion.div>
            </UserRoute>
          }
        />
        <Route
          path="/services"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Services />
            </motion.div>
          }
        />
        <Route
          path="/booking"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Bookings />
            </motion.div>
          }
        />
        <Route
          path="/projects"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Projects />
            </motion.div>
          }
        />
        <Route
          path="/testimonials"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Testimonials />
            </motion.div>
          }
        />
        <Route
          path="/market"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Market />
            </motion.div>
          }
        />
        <Route
          path="/market/product/:id"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <ProductDetail />
            </motion.div>
          }
        />
        <Route
          path="/partners"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Partners />
            </motion.div>
          }
        />
        <Route
          path="/sponsors/apply"
          element={
            <UserRoute>
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <SponsorApply />
              </motion.div>
            </UserRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <AdminDashboard />
              </motion.div>
            </AdminRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
});
AnimatedRoutes.displayName = 'AnimatedRoutes';


function App() {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [sideNavOpen, setSideNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout
        theme={theme}
        toggleTheme={toggleTheme}
        sideNavOpen={sideNavOpen}
        setSideNavOpen={setSideNavOpen}
      >
        <AnimatedRoutes />
      </Layout>
      <Analytics />
    </Router>
  );
}

export default App;