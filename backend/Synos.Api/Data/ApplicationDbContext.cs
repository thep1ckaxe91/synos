using Microsoft.EntityFrameworkCore;
using Synos.Api.Models;
using Synos.Api.Data.Configurations;

namespace Synos.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<Exhibition> Exhibitions { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Artwork> Artworks { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<Commission> Commissions { get; set; }
        public DbSet<ArtworkImage> ArtworkImages { get; set; }
        public DbSet<ExhibitionArtwork> ExhibitionArtworks { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Auction> Auctions { get; set; }
        public DbSet<Favorite> Favorites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Apply configurations
            modelBuilder.ApplyConfiguration(new ArtworkConfiguration());
            modelBuilder.ApplyConfiguration(new OrderConfiguration());
            
            // Configure composite keys
            ConfigureCompositeKeys(modelBuilder);
            
            // Configure relationships and constraints
            ConfigureMembers(modelBuilder);
            ConfigureSellers(modelBuilder);
            ConfigureExhibitions(modelBuilder);
            ConfigureArtworks(modelBuilder);
            ConfigureOrders(modelBuilder);
            ConfigureFavorites(modelBuilder);
            ConfigureAuctions(modelBuilder);
            
            // Configure enums
            ConfigureEnums(modelBuilder);
        }

        private void ConfigureExhibitions(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ExhibitionArtwork>()
                .HasOne(ea => ea.Exhibition)
                .WithMany(e => e.ExhibitionArtworks)
                .HasForeignKey(ea => ea.ExhibitionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ExhibitionArtwork>()
                .HasOne(ea => ea.Artwork)
                .WithMany(a => a.ExhibitionArtworks)
                .HasForeignKey(ea => ea.ArtworkId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigureArtworks(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Artwork>()
                .HasOne(a => a.Seller)
                .WithMany(s => s.Artworks)
                .HasForeignKey(a => a.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Artwork>()
                .HasOne(a => a.Category)
                .WithMany(c => c.Artworks)
                .HasForeignKey(a => a.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ArtworkImage>()
                .HasOne(ai => ai.Artwork)
                .WithMany(a => a.ArtworkImages)
                .HasForeignKey(ai => ai.ArtworkId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Commission relationship
            modelBuilder.Entity<Commission>()
                .HasOne(c => c.Artwork)
                .WithMany(a => a.Commissions)
                .HasForeignKey(c => c.ArtworkId)
                .OnDelete(DeleteBehavior.SetNull);
        }

        private void ConfigureOrders(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(m => m.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Artwork)
                .WithMany(a => a.OrderItems)
                .HasForeignKey(oi => oi.ArtworkId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private void ConfigureFavorites(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.Artwork)
                .WithMany(a => a.Favorites)
                .HasForeignKey(f => f.ArtworksId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.User)
                .WithMany(m => m.Favorites)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigureCompositeKeys(ModelBuilder modelBuilder)
        {
            // ExhibitionArtwork composite key
            modelBuilder.Entity<ExhibitionArtwork>()
                .HasKey(ea => new { ea.ExhibitionId, ea.ArtworkId });

            // Favorite composite key  
            modelBuilder.Entity<Favorite>()
                .HasKey(f => new { f.ArtworksId, f.UserId });
        }

        private void ConfigureMembers(ModelBuilder modelBuilder)
        {
            // Members unique constraints
            modelBuilder.Entity<Member>()
                .HasIndex(m => m.Email)
                .IsUnique();

            // Admin unique constraints
            modelBuilder.Entity<Admin>()
                .HasIndex(a => a.Email)
                .IsUnique();
        }

        private void ConfigureSellers(ModelBuilder modelBuilder)
        {
            // Seller has one-to-one relationship with Member
            modelBuilder.Entity<Seller>()
                .HasOne(s => s.Member)
                .WithOne(m => m.Seller)
                .HasForeignKey<Seller>(s => s.Id)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigureAuctions(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Auction>()
                .HasOne(a => a.Artwork)
                .WithMany(art => art.Auctions)
                .HasForeignKey(a => a.ArtworkId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Auction>()
                .HasOne(a => a.WinnerBid)
                .WithMany(m => m.WonAuctions)
                .HasForeignKey(a => a.WinnerBidId)
                .OnDelete(DeleteBehavior.SetNull);
        }

        private void ConfigureEnums(ModelBuilder modelBuilder)
        {
            // Configure enum conversions to string
            modelBuilder.Entity<Member>()
                .Property(m => m.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Artwork>()
                .Property(a => a.IsFor)
                .HasConversion<string>();

            modelBuilder.Entity<Artwork>()
                .Property(a => a.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Auction>()
                .Property(a => a.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Commission>()
                .Property(c => c.CommissionType)
                .HasConversion<string>();
        }
    }
}