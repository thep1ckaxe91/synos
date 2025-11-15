'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, Heart, ShoppingBag, Palette, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="text-2xl font-serif">Synos</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/artworks"
              className={`text-sm hover:text-primary transition-colors ${
                pathname === '/artworks' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Artworks
            </Link>
            <Link
              href="/exhibitions"
              className={`text-sm hover:text-primary transition-colors ${
                pathname === '/exhibitions' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Exhibitions
            </Link>
            <Link
              href="/auctions"
              className={`text-sm hover:text-primary transition-colors ${
                pathname === '/auctions' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Auctions
            </Link>
            {user?.role === 'Seller' && (
              <Link
                href="/seller"
                className={`text-sm hover:text-primary transition-colors ${
                  pathname.startsWith('/seller') ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                My Studio
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'Buyer' && (
                  <Link href="/orders">
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <ShoppingBag className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/favorites">
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{user.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        My Favorites
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'Buyer' && (
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="cursor-pointer">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'Seller' && (
                      <DropdownMenuItem asChild>
                        <Link href="/seller" className="cursor-pointer">
                          <Palette className="mr-2 h-4 w-4" />
                          My Studio
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden md:flex">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="hidden md:flex">Get Started</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                href="/artworks"
                className="text-sm hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Artworks
              </Link>
              <Link
                href="/exhibitions"
                className="text-sm hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Exhibitions
              </Link>
              <Link
                href="/auctions"
                className="text-sm hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Auctions
              </Link>
              {user?.role === 'Seller' && (
                <Link
                  href="/seller"
                  className="text-sm hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Studio
                </Link>
              )}
              {!user && (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
