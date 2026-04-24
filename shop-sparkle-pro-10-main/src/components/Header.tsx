import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Heart, User, Search, Moon, Sun, LogOut, LayoutDashboard, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [mobile, setMobile] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: q || undefined, category: undefined, min: undefined, max: undefined, rating: undefined } as any });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-primary">furnX</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 text-sm md:flex">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary font-medium" }} className="hover:text-primary">Home</Link>
          <Link to="/shop" activeProps={{ className: "text-primary font-medium" }} className="hover:text-primary">Shop</Link>
          <Link to="/about" activeProps={{ className: "text-primary font-medium" }} className="hover:text-primary">About</Link>
          <Link to="/contact" activeProps={{ className: "text-primary font-medium" }} className="hover:text-primary">Contact</Link>
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden flex-1 max-w-sm md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search furniture…" className="pl-9 bg-secondary/40 border-transparent focus:bg-background" />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link to="/wishlist"><Button variant="ghost" size="icon" aria-label="Wishlist"><Heart className="h-5 w-5" /></Button></Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart"><ShoppingCart className="h-5 w-5" /></Button>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account"><User className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild><Link to="/orders">My Orders</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/wishlist">Wishlist</Link></DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth"><Button variant="default" size="sm" className="ml-1">Sign in</Button></Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobile((v) => !v)} aria-label="Menu"><Menu className="h-5 w-5" /></Button>
        </div>
      </div>
      {mobile && (
        <div className="border-t border-border md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm">
            <Link to="/" onClick={() => setMobile(false)}>Home</Link>
            <Link to="/shop" onClick={() => setMobile(false)}>Shop</Link>
            <Link to="/about" onClick={() => setMobile(false)}>About</Link>
            <Link to="/contact" onClick={() => setMobile(false)}>Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
