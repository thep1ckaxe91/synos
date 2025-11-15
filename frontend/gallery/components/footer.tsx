import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl mb-4">Synos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A comprehensive art gallery and auction platform connecting artists, collectors, and art enthusiasts.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/artworks" className="hover:text-primary transition-colors">
                  Browse Artworks
                </Link>
              </li>
              <li>
                <Link href="/exhibitions" className="hover:text-primary transition-colors">
                  Exhibitions
                </Link>
              </li>
              <li>
                <Link href="/auctions" className="hover:text-primary transition-colors">
                  Active Auctions
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>info@synos.art</li>
              <li>Vietnam</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Synos Art Gallery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
