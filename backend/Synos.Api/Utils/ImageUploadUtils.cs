namespace Synos.Api.Utils
{
    public static class ImageUploadUtils
    {
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private static readonly long MaxFileSize = 5 * 1024 * 1024; // 5MB

        public static async Task<string> UploadArtworkImageAsync(IFormFile file, string webRootPath)
        {
            // Validate file
            ValidateImageFile(file);

            // Create upload directory if it doesn't exist
            var uploadDir = Path.Combine(webRootPath, "uploads", "ArtworkImg");
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            // Generate unique filename
            var fileName = GenerateUniqueFileName(file.FileName);
            var filePath = Path.Combine(uploadDir, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative path for storage in database
            return Path.Combine("uploads", "ArtworkImg", fileName).Replace("\\", "/");
        }

        public static async Task<List<string>> UploadMultipleArtworkImagesAsync(IFormFileCollection files, string webRootPath)
        {
            var uploadedFiles = new List<string>();

            foreach (var file in files)
            {
                try
                {
                    var filePath = await UploadArtworkImageAsync(file, webRootPath);
                    uploadedFiles.Add(filePath);
                }
                catch (Exception ex)
                {
                    // Log error but continue with other files
                    Console.WriteLine($"Failed to upload file {file.FileName}: {ex.Message}");
                }
            }

            return uploadedFiles;
        }

        public static bool DeleteArtworkImage(string imagePath, string webRootPath)
        {
            try
            {
                var fullPath = Path.Combine(webRootPath, imagePath.Replace("/", "\\"));
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to delete image {imagePath}: {ex.Message}");
            }
            return false;
        }

        public static void ValidateImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file provided or file is empty");
            }

            if (file.Length > MaxFileSize)
            {
                throw new ArgumentException($"File size exceeds maximum allowed size of {MaxFileSize / (1024 * 1024)}MB");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"File extension '{extension}' is not allowed. Allowed extensions: {string.Join(", ", AllowedExtensions)}");
            }

            // Validate MIME type
            if (!IsValidImageMimeType(file.ContentType))
            {
                throw new ArgumentException("Invalid file type. Only image files are allowed.");
            }
        }

        private static bool IsValidImageMimeType(string contentType)
        {
            var allowedMimeTypes = new[]
            {
                "image/jpeg",
                "image/jpg", 
                "image/png",
                "image/gif",
                "image/webp"
            };

            return allowedMimeTypes.Contains(contentType.ToLowerInvariant());
        }

        private static string GenerateUniqueFileName(string originalFileName)
        {
            var extension = Path.GetExtension(originalFileName);
            var timestamp = TimeUtils.GetCurrentTime().ToString("yyyyMMddHHmmss");
            var uniqueId = Guid.NewGuid().ToString("N")[..8];
            return $"{timestamp}_{uniqueId}{extension}";
        }

        public static string GetImageUrl(string imagePath, string baseUrl)
        {
            if (string.IsNullOrEmpty(imagePath))
                return string.Empty;

            return $"{baseUrl.TrimEnd('/')}/{imagePath.TrimStart('/')}";
        }

        public static Task<string> ResizeImageAsync(string imagePath, string webRootPath, int maxWidth = 800, int maxHeight = 600)
        {
            // This is a placeholder for image resizing functionality
            // You would implement this using a library like ImageSharp or System.Drawing
            // For now, just return the original path
            return Task.FromResult(imagePath);
        }

        public static string GetThumbnailPath(string imagePath)
        {
            var directory = Path.GetDirectoryName(imagePath);
            var fileName = Path.GetFileNameWithoutExtension(imagePath);
            var extension = Path.GetExtension(imagePath);
            
            return Path.Combine(directory ?? "", $"{fileName}_thumb{extension}").Replace("\\", "/");
        }

        public static void CleanupOldImages(string webRootPath, int daysOld = 30)
        {
            try
            {
                var uploadDir = Path.Combine(webRootPath, "uploads", "ArtworkImg");
                if (!Directory.Exists(uploadDir))
                    return;

                var cutoffDate = TimeUtils.GetCurrentTime().AddDays(-daysOld);
                var files = Directory.GetFiles(uploadDir);

                foreach (var file in files)
                {
                    var fileInfo = new FileInfo(file);
                    if (fileInfo.CreationTime < cutoffDate)
                    {
                        File.Delete(file);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to cleanup old images: {ex.Message}");
            }
        }
    }
}