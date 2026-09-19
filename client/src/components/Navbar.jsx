import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="18" cy="21" r="1.4" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    api
      .get("/cart")
      .then(({ data }) => setCartCount(data.items.reduce((sum, i) => sum + i.quantity, 0)))
      .catch(() => {});
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm pb-1 border-b ${isActive ? "border-[var(--color-clay)]" : "border-transparent text-neutral-600"}`;

  return (
    <header className="border-b border-[var(--color-line)] relative">
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl"
          style={{ color: "var(--color-ink)", fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          ShopEZ
        </Link>

        <nav className="hidden md:flex items-center gap-8" style={{ color: "var(--color-ink)" }}>
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/products?sort=new" className={navLinkClass}>
            New Arrivals
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-5" style={{ color: "var(--color-ink)" }}>
          <Link to="/products" aria-label="Search products">
            <SearchIcon />
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Account"
              className="flex items-center"
            >
              <UserIcon />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-8 bg-white border border-[var(--color-line)] rounded-md shadow-sm py-2 w-40 text-sm z-10"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-neutral-50">
                      Profile
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-neutral-50">
                        Admin
                      </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-neutral-50">
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-neutral-50">
                      Log in
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-neutral-50">
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/cart" aria-label="Cart" className="relative">
            <CartIcon />
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"
                style={{ backgroundColor: "var(--color-clay)" }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}