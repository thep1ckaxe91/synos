using Microsoft.AspNetCore.Mvc;
using Synos.Api.Attributes;
using Synos.Api.DTOs;
using Synos.Api.Extensions;
using Synos.Api.Services;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/seller")]
    [JwtAuthorize("Seller")]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<SellerController> _logger;

        public SellerController(ISellerService sellerService, IWebHostEnvironment env, ILogger<SellerController> logger)
        {
            _sellerService = sellerService;
            _env = env;
            _logger = logger;
        }

        [HttpPost("artworks/upload")]
        public async Task<IActionResult> UploadArtworkImage(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files uploaded.");

            var uploadedUrls = new List<string>();
            var uploadPath = Path.Combine(_env.WebRootPath, "uploads", "artworks");

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    try
                    {
                        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                        var filePath = Path.Combine(uploadPath, uniqueFileName);

                        await using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/artworks/{uniqueFileName}";
                        uploadedUrls.Add(fileUrl);
                        _logger.LogInformation("File uploaded successfully: {FilePath}", filePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error uploading file {FileName}", file.FileName);
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                    }
                }
            }

            if (uploadedUrls.Count == 0)
            {
                return BadRequest("No valid files to upload.");
            }

            return Ok(new { urls = uploadedUrls });
        }

        [HttpPost("artworks")]
        public async Task<ActionResult<SellerArtworkDto>> CreateArtwork([FromBody] CreateArtworkDto artworkDto)
        {
            var sellerId = GetCurrentSellerId();
            if (sellerId == null)
            {
                return Unauthorized(new { message = "Invalid token or not a seller." });
            }

            var artwork = await _sellerService.CreateArtworkAsync(sellerId.Value, artworkDto);
            if (artwork == null)
            {
                return BadRequest(new { message = "Failed to create artwork." });
            }
            return CreatedAtAction(nameof(GetArtworks), new { }, artwork);
        }

        [HttpGet("artworks")]
        public async Task<ActionResult<IEnumerable<SellerArtworkDto>>> GetArtworks()
        {
            var sellerId = GetCurrentSellerId();
            if (sellerId == null)
            {
                return Unauthorized(new { message = "Invalid token or not a seller." });
            }

            var artworks = await _sellerService.GetArtworksBySellerAsync(sellerId.Value);
            return Ok(artworks);
        }

        [HttpGet("sales-history")]
        public async Task<ActionResult<IEnumerable<SalesHistoryDto>>> GetSalesHistory()
        {
            var sellerId = GetCurrentSellerId();
            if (sellerId == null)
            {
                return Unauthorized(new { message = "Invalid token or not a seller." });
            }

            var salesHistory = await _sellerService.GetSalesHistoryAsync(sellerId.Value);
            return Ok(salesHistory);
        }

        private long? GetCurrentSellerId()
        {
            // A "Seller" is a "Member" with the role "Seller".
            // We can use the existing GetCurrentMemberId extension method.
            return HttpContext.GetCurrentMemberId();
        }
    }
}
