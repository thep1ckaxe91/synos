using Microsoft.AspNetCore.Mvc;
using Synos.Api.Services;
using Synos.Api.DTOs;
using Synos.Api.Models;
using Synos.Api.Attributes;
using Synos.Api.Extensions;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        // ===========================================
        // AUTHENTICATION ENDPOINTS
        // ===========================================

        /// <summary>
        /// Admin login
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AdminAuthResultDto>> Login([FromBody] AdminLoginDto loginDto)
        {
            try
            {
                var result = await _adminService.LoginAsync(loginDto);
                
                if (!result.Success)
                {
                    return Unauthorized(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during admin login");
                return StatusCode(500, new { Message = "An error occurred during login" });
            }
        }

        /// <summary>
        /// Get admin profile
        /// </summary>
        [HttpGet("profile")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<AdminDto>> GetProfile()
        {
            try
            {
                var adminId = HttpContext.GetCurrentAdminId();
                if (adminId == null)
                    return Unauthorized(new { Message = "Invalid admin token" });
                
                var profile = await _adminService.GetAdminProfileAsync(adminId.Value);
                
                if (profile == null)
                {
                    return NotFound(new { Message = "Admin profile not found" });
                }

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin profile");
                return StatusCode(500, new { Message = "An error occurred while retrieving profile" });
            }
        }

        /// <summary>
        /// Update admin profile
        /// </summary>
        [HttpPut("profile")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<AdminDto>> UpdateProfile([FromBody] UpdateAdminDto updateDto)
        {
            try
            {
                var adminId = HttpContext.GetCurrentAdminId();
                if (adminId == null)
                    return Unauthorized(new { Message = "Invalid admin token" });
                
                var updatedProfile = await _adminService.UpdateAdminProfileAsync(adminId.Value, updateDto);
                
                if (updatedProfile == null)
                {
                    return NotFound(new { Message = "Admin profile not found" });
                }

                return Ok(updatedProfile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating admin profile");
                return StatusCode(500, new { Message = "An error occurred while updating profile" });
            }
        }

        // ===========================================
        // MEMBER MANAGEMENT ENDPOINTS
        // ===========================================

        /// <summary>
        /// Get all members for admin view
        /// </summary>
        [HttpGet("members")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminMemberViewDto>>> GetMembers([FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            try
            {
                var members = await _adminService.GetMembersForAdminAsync(skip, take);
                return Ok(members);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving members for admin");
                return StatusCode(500, new { Message = "An error occurred while retrieving members" });
            }
        }

        /// <summary>
        /// Get member details for admin
        /// </summary>
        [HttpGet("members/{memberId}")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<AdminMemberViewDto>> GetMemberDetails(long memberId)
        {
            try
            {
                var member = await _adminService.GetMemberDetailsForAdminAsync(memberId);
                
                if (member == null)
                {
                    return NotFound(new { Message = "Member not found" });
                }

                return Ok(member);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member details for admin");
                return StatusCode(500, new { Message = "An error occurred while retrieving member details" });
            }
        }

        /// <summary>
        /// Approve a pending member
        /// </summary>
        [HttpPost("members/{memberId}/approve")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult> ApproveMember(long memberId)
        {
            try
            {
                var adminId = HttpContext.GetCurrentAdminId();
                if (adminId == null)
                    return Unauthorized(new { Message = "Invalid admin token" });
                
                var result = await _adminService.ApproveMemberAsync(adminId.Value, memberId);
                
                if (!result)
                {
                    return BadRequest(new { Message = "Failed to approve member" });
                }

                return Ok(new { Message = "Member approved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving member");
                return StatusCode(500, new { Message = "An error occurred while approving member" });
            }
        }

        /// <summary>
        /// Reject a pending member
        /// </summary>
        [HttpPost("members/{memberId}/reject")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult> RejectMember(long memberId)
        {
            try
            {
                var adminId = HttpContext.GetCurrentAdminId();
                if (adminId == null)
                    return Unauthorized(new { Message = "Invalid admin token" });
                
                var result = await _adminService.RejectMemberAsync(adminId.Value, memberId);
                
                if (!result)
                {
                    return BadRequest(new { Message = "Failed to reject member" });
                }

                return Ok(new { Message = "Member rejected successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting member");
                return StatusCode(500, new { Message = "An error occurred while rejecting member" });
            }
        }

        // ===========================================
        // ARTWORK MANAGEMENT ENDPOINTS
        // ===========================================

        /// <summary>
        /// Get all artworks for admin view
        /// </summary>
        [HttpGet("artworks")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminArtworkViewDto>>> GetArtworks([FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            try
            {
                var artworks = await _adminService.GetArtworksForAdminAsync(skip, take);
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving artworks for admin");
                return StatusCode(500, new { Message = "An error occurred while retrieving artworks" });
            }
        }

        /// <summary>
        /// Get artwork details for admin
        /// </summary>
        [HttpGet("artworks/{artworkId}")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<AdminArtworkViewDto>> GetArtworkDetails(long artworkId)
        {
            try
            {
                var artwork = await _adminService.GetArtworkDetailsForAdminAsync(artworkId);
                
                if (artwork == null)
                {
                    return NotFound(new { Message = "Artwork not found" });
                }

                return Ok(artwork);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving artwork details for admin");
                return StatusCode(500, new { Message = "An error occurred while retrieving artwork details" });
            }
        }

        /// <summary>
        /// Update artwork status
        /// </summary>
        [HttpPut("artworks/{artworkId}/status")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult> UpdateArtworkStatus(long artworkId, [FromBody] UpdateArtworkStatusDto statusDto)
        {
            try
            {
                var adminId = HttpContext.GetCurrentAdminId();
                if (adminId == null)
                    return Unauthorized(new { Message = "Invalid admin token" });
                
                var result = await _adminService.UpdateArtworkStatusAsync(adminId.Value, artworkId, statusDto.Status);
                
                if (!result)
                {
                    return BadRequest(new { Message = "Failed to update artwork status" });
                }

                return Ok(new { Message = "Artwork status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating artwork status");
                return StatusCode(500, new { Message = "An error occurred while updating artwork status" });
            }
        }

        /// <summary>
        /// Delete artwork
        /// </summary>
        [HttpDelete("artworks/{artworkId}")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult> DeleteArtwork(long artworkId)
        {
            try
            {
                var adminId = HttpContext.GetCurrentAdminId();
                if (adminId == null)
                    return Unauthorized(new { Message = "Invalid admin token" });
                
                var result = await _adminService.DeleteArtworkAsync(adminId.Value, artworkId);
                
                if (!result)
                {
                    return BadRequest(new { Message = "Failed to delete artwork" });
                }

                return Ok(new { Message = "Artwork deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting artwork");
                return StatusCode(500, new { Message = "An error occurred while deleting artwork" });
            }
        }

        // ===========================================
        // TRANSACTION MANAGEMENT ENDPOINTS
        // ===========================================

        /// <summary>
        /// Get all transactions for admin monitoring
        /// </summary>
        [HttpGet("transactions")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<TransactionMonitorDto>>> GetTransactions([FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            try
            {
                var transactions = await _adminService.GetTransactionsForAdminAsync(skip, take);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions for admin");
                return StatusCode(500, new { Message = "An error occurred while retrieving transactions" });
            }
        }

        /// <summary>
        /// Get transaction details
        /// </summary>
        [HttpGet("transactions/{orderId}")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<TransactionMonitorDto>> GetTransactionDetails(long orderId)
        {
            try
            {
                var transaction = await _adminService.GetTransactionDetailsAsync(orderId);
                
                if (transaction == null)
                {
                    return NotFound(new { Message = "Transaction not found" });
                }

                return Ok(transaction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction details for admin");
                return StatusCode(500, new { Message = "An error occurred while retrieving transaction details" });
            }
        }

        /// <summary>
        /// Get transactions by date range
        /// </summary>
        [HttpGet("transactions/date-range")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<TransactionMonitorDto>>> GetTransactionsByDateRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate, 
            [FromQuery] int skip = 0, 
            [FromQuery] int take = 50)
        {
            try
            {
                var transactions = await _adminService.GetTransactionsByDateRangeAsync(startDate, endDate, skip, take);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions by date range for admin");
                return StatusCode(500, new { Message = "An error occurred while retrieving transactions" });
            }
        }

        // ===========================================
        // EXHIBITION MANAGEMENT ENDPOINTS
        // ===========================================

        /// <summary>
        /// Get all exhibitions for admin view
        /// </summary>
        [HttpGet("exhibitions")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminExhibitionViewDto>>> GetExhibitions([FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            try
            {
                var exhibitions = await _adminService.GetExhibitionsForAdminAsync(skip, take);
                return Ok(exhibitions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving exhibitions for admin");
                return StatusCode(500, new { Message = "An error occurred while retrieving exhibitions" });
            }
        }

        /// <summary>
        /// Get exhibition details for admin
        /// </summary>
        [HttpGet("exhibitions/{exhibitionId}")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<AdminExhibitionViewDto>> GetExhibitionDetails(long exhibitionId)
        {
            try
            {
                var exhibition = await _adminService.GetExhibitionDetailsForAdminAsync(exhibitionId);
                
                if (exhibition == null)
                {
                    return NotFound(new { Message = "Exhibition not found" });
                }

                return Ok(exhibition);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving exhibition details for admin");
                return StatusCode(500, new { Message = "An error occurred while retrieving exhibition details" });
            }
        }

        // ===========================================
        // DASHBOARD & ANALYTICS ENDPOINTS
        // ===========================================

        /// <summary>
        /// Get admin dashboard statistics
        /// </summary>
        [HttpGet("dashboard")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
        {
            try
            {
                var dashboard = await _adminService.GetDashboardAsync();
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin dashboard");
                return StatusCode(500, new { Message = "An error occurred while retrieving dashboard" });
            }
        }

        /// <summary>
        /// Get recent system activities
        /// </summary>
        [HttpGet("dashboard/activities")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<RecentActivityDto>>> GetRecentActivities([FromQuery] int count = 10)
        {
            try
            {
                var activities = await _adminService.GetRecentActivitiesAsync(count);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent activities");
                return StatusCode(500, new { Message = "An error occurred while retrieving activities" });
            }
        }

        /// <summary>
        /// Get most viewed artworks
        /// </summary>
        [HttpGet("analytics/popular-artworks")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminArtworkViewDto>>> GetMostViewedArtworks([FromQuery] int count = 10)
        {
            try
            {
                var artworks = await _adminService.GetMostViewedArtworksAsync(count);
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving most viewed artworks");
                return StatusCode(500, new { Message = "An error occurred while retrieving popular artworks" });
            }
        }

        /// <summary>
        /// Get most popular categories
        /// </summary>
        [HttpGet("analytics/popular-categories")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetMostPopularCategories([FromQuery] int count = 10)
        {
            try
            {
                var categories = await _adminService.GetMostPopularCategoriesAsync(count);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving most popular categories");
                return StatusCode(500, new { Message = "An error occurred while retrieving popular categories" });
            }
        }

        // ===========================================
        // NON-PAGINATED ENDPOINTS
        // ===========================================

        /// <summary>
        /// Get all members without pagination
        /// </summary>
        [HttpGet("members/all")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminMemberViewDto>>> GetAllMembers()
        {
            try
            {
                var members = await _adminService.GetAllMembersAsync();
                return Ok(members);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all members");
                return StatusCode(500, new { Message = "An error occurred while retrieving members" });
            }
        }

        /// <summary>
        /// Get all artworks without pagination
        /// </summary>
        [HttpGet("artworks/all")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminArtworkViewDto>>> GetAllArtworks()
        {
            try
            {
                var artworks = await _adminService.GetAllArtworksAsync();
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all artworks");
                return StatusCode(500, new { Message = "An error occurred while retrieving artworks" });
            }
        }

        /// <summary>
        /// Get all transactions without pagination
        /// </summary>
        [HttpGet("transactions/all")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminOrderViewDto>>> GetAllTransactions()
        {
            try
            {
                var transactions = await _adminService.GetAllTransactionsAsync();
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all transactions");
                return StatusCode(500, new { Message = "An error occurred while retrieving transactions" });
            }
        }

        /// <summary>
        /// Get all exhibitions without pagination
        /// </summary>
        [HttpGet("exhibitions/all")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminExhibitionViewDto>>> GetAllExhibitions()
        {
            try
            {
                var exhibitions = await _adminService.GetAllExhibitionsAsync();
                return Ok(exhibitions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all exhibitions");
                return StatusCode(500, new { Message = "An error occurred while retrieving exhibitions" });
            }
        }

        // ===========================================
        // EXHIBITION MANAGEMENT
        // ===========================================

        /// <summary>
        /// Create new exhibition
        /// </summary>
        [HttpPost("exhibitions")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<AdminExhibitionViewDto>> CreateExhibition([FromBody] CreateExhibitionDto dto)
        {
            try
            {
                var exhibition = await _adminService.CreateExhibitionAsync(dto);
                return CreatedAtAction(nameof(GetExhibitionDetails), new { exhibitionId = exhibition.Id }, exhibition);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating exhibition");
                return StatusCode(500, new { Message = "An error occurred while creating exhibition" });
            }
        }

        /// <summary>
        /// Update exhibition
        /// </summary>
        [HttpPut("exhibitions/{exhibitionId}")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<AdminExhibitionViewDto>> UpdateExhibition(long exhibitionId, [FromBody] UpdateExhibitionDto dto)
        {
            try
            {
                var exhibition = await _adminService.UpdateExhibitionAsync(exhibitionId, dto);
                if (exhibition == null)
                {
                    return NotFound(new { Message = "Exhibition not found" });
                }
                return Ok(exhibition);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating exhibition with ID {ExhibitionId}", exhibitionId);
                return StatusCode(500, new { Message = "An error occurred while updating exhibition" });
            }
        }

        /// <summary>
        /// Delete exhibition
        /// </summary>
        [HttpDelete("exhibitions/{exhibitionId}")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult> DeleteExhibition(long exhibitionId, [FromBody] DeleteExhibitionDto dto)
        {
            try
            {
                var success = await _adminService.DeleteExhibitionAsync(exhibitionId, dto);
                if (!success)
                {
                    return NotFound(new { Message = "Exhibition not found" });
                }
                return Ok(new { Message = "Exhibition deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting exhibition with ID {ExhibitionId}", exhibitionId);
                return StatusCode(500, new { Message = "An error occurred while deleting exhibition" });
            }
        }

        // ===========================================
        // ARTWORK MANAGEMENT (FULL CRUD)
        // ===========================================

        /// <summary>
        /// Update artwork information
        /// </summary>
        [HttpPut("artworks/{artworkId}")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<AdminArtworkViewDto>> UpdateArtwork(long artworkId, [FromBody] UpdateArtworkAdminDto dto)
        {
            try
            {
                var artwork = await _adminService.UpdateArtworkAsync(artworkId, dto);
                if (artwork == null)
                {
                    return NotFound(new { Message = "Artwork not found" });
                }
                return Ok(artwork);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating artwork with ID {ArtworkId}", artworkId);
                return StatusCode(500, new { Message = "An error occurred while updating artwork" });
            }
        }

        // ===========================================
        // PURCHASE REQUEST MANAGEMENT
        // ===========================================

        /// <summary>
        /// Get pending purchase requests
        /// </summary>
        [HttpGet("purchase-requests")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminOrderViewDto>>> GetPendingPurchaseRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var requests = await _adminService.GetPendingPurchaseRequestsAsync(page, pageSize);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending purchase requests");
                return StatusCode(500, new { Message = "An error occurred while retrieving purchase requests" });
            }
        }

        /// <summary>
        /// Get all pending purchase requests without pagination
        /// </summary>
        [HttpGet("purchase-requests/all")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult<IEnumerable<AdminOrderViewDto>>> GetAllPendingPurchaseRequests()
        {
            try
            {
                var requests = await _adminService.GetAllPendingPurchaseRequestsAsync();
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all pending purchase requests");
                return StatusCode(500, new { Message = "An error occurred while retrieving purchase requests" });
            }
        }

        /// <summary>
        /// Approve purchase request
        /// </summary>
        [HttpPost("purchase-requests/{orderId}/approve")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult> ApprovePurchaseRequest(long orderId, [FromBody] ApprovePurchaseDto dto)
        {
            try
            {
                var success = await _adminService.ApprovePurchaseRequestAsync(orderId, dto);
                if (!success)
                {
                    return NotFound(new { Message = "Purchase request not found" });
                }
                return Ok(new { Message = "Purchase request approved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving purchase request with ID {OrderId}", orderId);
                return StatusCode(500, new { Message = "An error occurred while approving purchase request" });
            }
        }

        /// <summary>
        /// Reject purchase request
        /// </summary>
        [HttpPost("purchase-requests/{orderId}/reject")]
        [JwtAuthorize("Admin")]
        public async Task<ActionResult> RejectPurchaseRequest(long orderId, [FromBody] RejectPurchaseDto dto)
        {
            try
            {
                var success = await _adminService.RejectPurchaseRequestAsync(orderId, dto);
                if (!success)
                {
                    return NotFound(new { Message = "Purchase request not found" });
                }
                return Ok(new { Message = "Purchase request rejected successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting purchase request with ID {OrderId}", orderId);
                return StatusCode(500, new { Message = "An error occurred while rejecting purchase request" });
            }
        }

        // ===========================================
        // HELPER METHODS
        // ===========================================
    }
}
