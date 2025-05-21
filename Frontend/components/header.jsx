'use client'
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Menu, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  ShieldAlert, 
  ChevronDown,
  ShoppingCart,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { getAuthToken, removeAuthToken } from "@/lib/api/admin";
import { getCart } from "@/lib/actions/cart";

// Navigation items for regular users
const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/orders", label: "Orders" },
  { href: "/about", label: "About" },
];

// Admin panel navigation items
const adminItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/analytics", label: "Analytics" },
];

// Utility function to conditionally join classNames
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  
  // Check if the user is on an admin page
  const isOnAdminPage = pathname?.startsWith('/admin');
 
  useEffect(() => {
    setMounted(true);
    
    // Check for authentication token
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      
      try {
        // Parse the token to check if user has admin role
        // This assumes your token has a role or isAdmin claim
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(tokenData.role === 'admin' || tokenData.isAdmin === true);
      } catch (error) {
        console.error("Error parsing auth token:", error);
        // Fallback for demo purposes only - remove this in production
        setIsAdmin(true);
      }
    }

    // Only fetch cart data if not on admin page
    if (!isOnAdminPage) {
      const fetchCartData = async () => {
        try {
          const cart = await getCart();
          const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
          setCartItemCount(itemCount);
        } catch (error) {
          console.error("Error fetching cart:", error);
        }
      };
      
      fetchCartData();
    }
  }, [isOnAdminPage]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserMenuOpen(false);
    toast.success("Logged out successfully");

    // Redirect to home page if on admin page
    if (isOnAdminPage && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Render a different header for admin pages
  if (isOnAdminPage) {
    // Only show admin header if user is authenticated and is an admin
    if (!isAuthenticated || !isAdmin) {
      // Redirect to login if not authenticated or not admin
      if (typeof window !== 'undefined') {
        window.location.href = '/login?redirect=/admin';
      }
      return null; // Don't render anything while redirecting
    }

    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/admin" className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-xl font-bold">Admin Panel</span>
            </Link>
            
            <nav className="hidden md:flex gap-6">
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary flex items-center",
                    pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              className="mr-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
              aria-label="Toggle Theme"
              onClick={toggleTheme}
            >
              {mounted ? (
                <>
                  <Sun className={`h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                  <Moon className={`absolute h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  <Moon className="absolute h-4 w-4 opacity-0" />
                </>
              )}
              <span className="sr-only">Toggle theme</span>
            </button>
            
            {/* Back to Store Button */}
            <Link href="/">
              <div 
                className="mr-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
              >
                Back to Store
              </div>
            </Link>
            
            {/* Admin Account Button */}
            <div className="relative">
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
                aria-label="User Menu"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Admin</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {/* Admin dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border overflow-hidden z-10">
                  <div className="py-1">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-accent"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile menu for admin */}
            <div className="md:hidden">
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                aria-label="Menu"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </button>
              
              {/* Mobile navigation drawer for admin */}
              {isOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
                  <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-background shadow-lg border-l animate-in slide-in-from-right">
                    <div className="p-6 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-2">
                          <ShieldAlert className="h-5 w-5" />
                          <span className="text-xl font-bold">Admin Panel</span>
                        </div>
                        <button
                          className="rounded-md p-1 hover:bg-accent"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-2xl">&times;</span>
                        </button>
                      </div>
                      
                      <nav className="flex flex-col gap-6">
                        {adminItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "text-base font-medium transition-colors hover:text-primary flex items-center",
                              pathname === item.href ? "text-primary font-semibold" : "text-foreground"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                      
                      <div className="h-px bg-border my-6"></div>
                      
                      <Link
                        href="/"
                        className="block text-base font-medium hover:text-primary mb-4"
                        onClick={() => setIsOpen(false)}
                      >
                        Back to Store
                      </Link>
                      
                      <button
                        className="flex items-center text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Admin Mode
                          </span>
                          <button
                            className="rounded-md p-2 border border-input hover:bg-accent"
                            onClick={toggleTheme}
                          >
                            {theme === "dark" ? (
                              <Sun className="h-4 w-4" />
                            ) : (
                              <Moon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Regular store header (non-admin pages)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">HireSports</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Cart Icon with Badge */}
          <Link href="/cart">
            <button
              className="mr-2 relative inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </Link>
          
          {/* Theme Toggle */}
          <button
            className="mr-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
            aria-label="Toggle Theme"
            onClick={toggleTheme}
          >
            {mounted ? (
              <>
                <Sun className={`h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                <Moon className={`absolute h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <Moon className="absolute h-4 w-4 opacity-0" />
              </>
            )}
            <span className="sr-only">Toggle theme</span>
          </button>
          
          {/* User Account Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
                aria-label="User Menu"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Account</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border overflow-hidden z-10">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    
                    {/* Admin Dashboard Link */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </div>
                      </Link>
                    )}
                    
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-accent"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
                aria-label="Login"
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Login</span>
              </button>
            </Link>
          )}
          
          {/* Mobile menu */}
          <div className="md:hidden">
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
              aria-label="Menu"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </button>
            
            {/* Mobile navigation drawer */}
            {isOpen && (
              <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
                <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-background shadow-lg border-l animate-in slide-in-from-right">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold">HireSports</span>
                      </Link>
                      <button
                        className="rounded-md p-1 hover:bg-accent"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="text-2xl">&times;</span>
                      </button>
                    </div>
                    
                    <nav className="flex flex-col gap-6">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "text-base font-medium transition-colors hover:text-primary",
                            pathname === item.href ? "text-primary font-semibold" : "text-foreground"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      {/* Add Cart Link for Mobile */}
                      <Link
                        href="/cart"
                        className="flex items-center text-base font-medium hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Cart
                        {cartItemCount > 0 && (
                          <span className="ml-2 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {cartItemCount}
                          </span>
                        )}
                      </Link>
                    </nav>
                    
                    {isAuthenticated && (
                      <>
                        <div className="h-px bg-border my-6"></div>
                        <div className="space-y-4">
                          <div className="text-sm font-semibold text-muted-foreground uppercase">
                            Account
                          </div>
                          <Link
                            href="/profile"
                            className="block text-base font-medium hover:text-primary"
                            onClick={() => setIsOpen(false)}
                          >
                            My Profile
                          </Link>
                          <Link
                            href="/orders"
                            className="block text-base font-medium hover:text-primary"
                            onClick={() => setIsOpen(false)}
                          >
                            My Orders
                          </Link>
                          
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center text-base font-medium hover:text-primary"
                              onClick={() => setIsOpen(false)}
                            >
                              <ShieldAlert className="h-4 w-4 mr-2" />
                              Admin Dashboard
                            </Link>
                          )}
                          
                          <button
                            className="flex items-center text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </>
                    )}
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          © 2025 HireSports
                        </span>
                        <button
                          className="rounded-md p-2 border border-input hover:bg-accent"
                          onClick={toggleTheme}
                        >
                          {theme === "dark" ? (
                            <Sun className="h-4 w-4" />
                          ) : (
                            <Moon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;