'use client'
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Menu, ShoppingCart, Sun, Moon, User } from "lucide-react";

// Navigation items
const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

// Utility function to conditionally join classNames
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
 
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">SportsGear</span>
          </a>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="mr-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
            aria-label="Toggle Theme"
            onClick={toggleTheme}
          >
            {mounted ? (
              <>
                <Sun className={`h-4 w-4 ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                <Moon className={`absolute h-4 w-4 ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <Moon className="absolute h-4 w-4 opacity-0" />
              </>
            )}
            <span className="sr-only">Toggle theme</span>
          </button>
          <a href="/cart">
            <button 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </button>
          </a>
          <a href="/login">
            <button 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
              aria-label="Login"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </button>
          </a>
          
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
              <div className="fixed inset-y-0 right-0 z-50 w-64 bg-background shadow-lg">
                <div className="p-4">
                  <button
                    className="ml-auto block"
                    onClick={() => setIsOpen(false)}
                  >
                    &times;
                  </button>
                  <nav className="flex flex-col gap-4 mt-8">
                    {navItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
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