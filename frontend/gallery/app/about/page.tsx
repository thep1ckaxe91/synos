export default function AboutPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-6">About Synos</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-xl leading-relaxed">
            Synos Art Gallery is a comprehensive art platform connecting artists, collectors, 
            and art enthusiasts through exceptional artworks, exhibitions, and auctions.
          </p>

          <h2 className="font-serif text-2xl text-foreground mt-8 mb-4">Our Mission</h2>
          <p className="leading-relaxed">
            We believe art should be accessible to everyone. Our platform empowers artists 
            to showcase their work to a global audience while providing collectors with 
            a trusted marketplace to discover and acquire exceptional pieces.
          </p>

          <h2 className="font-serif text-2xl text-foreground mt-8 mb-4">What We Offer</h2>
          <ul className="space-y-3 leading-relaxed">
            <li>Curated collections of artworks across various categories</li>
            <li>Secure purchasing with integrated payment processing</li>
            <li>Live auctions for unique and valuable pieces</li>
            <li>Exhibition spaces for discovering new artists</li>
            <li>Portfolio management for artists</li>
            <li>Personal galleries for collectors</li>
          </ul>

          <h2 className="font-serif text-2xl text-foreground mt-8 mb-4">For Artists</h2>
          <p className="leading-relaxed">
            Whether you're an emerging artist or an established creator, Synos provides 
            the tools you need to share your work with the world. Upload your artworks, 
            set your prices, and reach collectors globally.
          </p>

          <h2 className="font-serif text-2xl text-foreground mt-8 mb-4">For Collectors</h2>
          <p className="leading-relaxed">
            Build your collection with confidence. Browse thousands of artworks, participate 
            in auctions, and connect directly with artists. Every purchase is protected by 
            our secure payment system.
          </p>
        </div>
      </div>
    </div>
  );
}
