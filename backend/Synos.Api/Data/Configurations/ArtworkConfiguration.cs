using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Synos.Api.Models;

namespace Synos.Api.Data.Configurations
{
    public class ArtworkConfiguration : IEntityTypeConfiguration<Artwork>
    {
        public void Configure(EntityTypeBuilder<Artwork> builder)
        {
            builder.ToTable("artworks");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.Title)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(a => a.FixedPrice)
                .HasColumnType("decimal(12,2)");

            builder.Property(a => a.Currency)
                .HasMaxLength(3);

            builder.Property(a => a.Dimensions)
                .HasMaxLength(100);

            builder.Property(a => a.Condition)
                .HasMaxLength(150);

            // Relationships
            builder.HasOne(a => a.Seller)
                .WithMany(s => s.Artworks)
                .HasForeignKey(a => a.SellerId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.Category)
                .WithMany(c => c.Artworks)
                .HasForeignKey(a => a.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(a => a.ArtworkImages)
                .WithOne(ai => ai.Artwork)
                .HasForeignKey(ai => ai.ArtworkId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            builder.HasIndex(a => a.SellerId);
            builder.HasIndex(a => a.CategoryId);
            builder.HasIndex(a => a.CreatedAt);
        }
    }
}