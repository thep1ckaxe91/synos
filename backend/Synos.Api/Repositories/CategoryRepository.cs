using Microsoft.EntityFrameworkCore;
using Synos.Api.Data;
using Synos.Api.Models;
using Synos.Api.Utils;

namespace Synos.Api.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .Include(c => c.Artworks.Where(a => a.DeletedAt == null))
                .ToListAsync();
        }

        public async Task<Category?> GetCategoryByIdAsync(long id)
        {
            return await _context.Categories
                .Include(c => c.Artworks.Where(a => a.DeletedAt == null))
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Category?> GetCategoryBySlugAsync(string slug)
        {
            return await _context.Categories
                .Include(c => c.Artworks.Where(a => a.DeletedAt == null))
                .FirstOrDefaultAsync(c => c.Slug == slug);
        }

        public async Task<Category> CreateCategoryAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<Category?> UpdateCategoryAsync(long id, Category category)
        {
            var existingCategory = await GetCategoryByIdAsync(id);
            if (existingCategory == null)
                return null;

            existingCategory.Name = category.Name;
            existingCategory.Slug = category.Slug;
            existingCategory.Description = category.Description;

            await _context.SaveChangesAsync();
            return existingCategory;
        }

        public async Task<bool> DeleteCategoryAsync(long id)
        {
            var category = await GetCategoryByIdAsync(id);
            if (category == null)
                return false;

            // Check if category has artworks
            var hasArtworks = await _context.Artworks
                .AnyAsync(a => a.CategoryId == id && a.DeletedAt == null);

            if (hasArtworks)
                return false; // Cannot delete category with active artworks

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsCategorySlugExistsAsync(string slug)
        {
            return await _context.Categories
                .AnyAsync(c => c.Slug == slug);
        }

        public async Task<int> GetCategoryArtworkCountAsync(long categoryId)
        {
            return await _context.Artworks
                .CountAsync(a => a.CategoryId == categoryId && a.DeletedAt == null);
        }

        // Missing interface methods
        public async Task<int> GetArtworkCountByCategoryIdAsync(long categoryId)
        {
            return await GetCategoryArtworkCountAsync(categoryId);
        }

        public async Task<IEnumerable<Category>> GetCategoriesWithArtworkCountAsync()
        {
            return await GetAllCategoriesAsync();
        }

        public async Task<bool> IsCategoryInUseAsync(long categoryId)
        {
            var count = await GetArtworkCountByCategoryIdAsync(categoryId);
            return count > 0;
        }
    }
}
