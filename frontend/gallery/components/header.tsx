"use client"

import Link from "next/link"
import { ShoppingCart, Heart, User, Menu, Search, Briefcase } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()

  const isSeller = user?.role === 'Seller'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-serif text-2xl font-bold tracking-tight">SYNOS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/artworks" className="text-sm font-medium transition-colors hover:text-accent">
              Artworks
            </Link>
            <Link href="/auctions" className="text-sm font-medium transition-colors hover:text-accent">
              Auctions
            </Link>
            <Link href="/exhibitions" className="text-sm font-medium transition-colors hover:text-accent">
              Exhibitions
            </Link>
            <Link href="/categories" className="text-sm font-medium transition-colors hover:text-accent">
              Categories
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/favorites">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Favorites</span>
                </Link>
              </Button>

              {!isSeller && (
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {totalItems}
                      </Badge>
                    )}
                    <span className="sr-only">Cart</span>
                  </Link>
                </Button>
              )}

              {isSeller && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/seller/dashboard">
                    <Briefcase className="h-5 w-5" />
                    <span className="sr-only">Seller Dashboard</span>
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-xs">{user?.role}</Badge>
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isSeller && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites">My Favorites</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {isSeller && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/artworks">My Artworks</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/sales">Sales History</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Join</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/artworks" className="text-lg font-medium">
                  Artworks
                </Link>
                <Link href="/auctions" className="text-lg font-medium">
                  Auctions
                </Link>
                <Link href="/exhibitions" className="text-lg font-medium">
                  Exhibitions
                </Link>
                <Link href="/categories" className="text-lg font-medium">
                  Categories
                </Link>
                <Link href="/search" className="text-lg font-medium">
                  Search
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
