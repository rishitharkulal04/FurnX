export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <h3 className="font-display text-xl font-bold text-primary">furnX</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Beautifully crafted furniture for the modern home.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Living</li><li>Dining</li><li>Bedroom</li><li>Outdoor</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Shipping</li><li>Returns</li><li>FAQs</li><li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Stay updated</h4>
          <p className="mt-3 text-sm text-muted-foreground">Get news on new collections.</p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} furnX. Crafted with care.
      </div>
    </footer>
  );
}
