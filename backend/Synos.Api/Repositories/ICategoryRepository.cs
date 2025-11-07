using Synos.Api.Models;

namespace Synos.Api.Repositories
{
    public interface ICategoryRepository
    {
        // Basic Category Operations
        Task<Category?> GetCategoryByIdAsync(long id);
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<Category> CreateCategoryAsync(Category category);
        Task<Category?> UpdateCategoryAsync(long id, Category category);
        Task<bool> DeleteCategoryAsync(long id);

        // Category Statistics
        Task<int> GetArtworkCountByCategoryIdAsync(long categoryId);
        Task<IEnumerable<Category>> GetCategoriesWithArtworkCountAsync();
        Task<bool> IsCategoryInUseAsync(long categoryId);
    }
}