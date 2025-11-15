import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Palette, Gavel, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gradient-to-br from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl md:text-7xl mb-6 text-balance">
            Discover Exceptional Art
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A curated platform connecting artists, collectors, and art enthusiasts through exceptional artworks, exhibitions, and auctions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/artworks">
              <Button size="lg" className="text-base">
                Explore Artworks
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-base">
                Join as Artist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-16">
            Experience Art in New Ways
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Curated Collections</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse thousands of artworks across various categories, from paintings to sculptures, carefully selected for quality.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
                <Gavel className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Live Auctions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Participate in exciting auctions, place bids on unique pieces, and build your collection with confidence.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Heart className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-3">Personal Galleries</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create your own curated gallery of favorite artworks and share your artistic vision with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-balance">
            Ready to Start Your Art Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join our community of artists and collectors today.
          </p>
          <Link href="/register">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
