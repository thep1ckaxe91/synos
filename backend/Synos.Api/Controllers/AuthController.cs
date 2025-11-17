using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Synos.Api.Attributes;
using Synos.Api.Services;
using System.Security.Claims;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IJwtService _jwtService;
        private readonly IMemberService _memberService;

        public AuthController(IJwtService jwtService, IMemberService memberService)
        {
            _jwtService = jwtService;
            _memberService = memberService;
        }

        /// <summary>
        /// Validate JWT token and get token info
        /// </summary>
        [HttpPost("validate")]
        [AllowAnonymous]
        public IActionResult ValidateToken([FromBody] ValidateTokenDto tokenDto)
        {
            if (string.IsNullOrEmpty(tokenDto.Token))
                return BadRequest(new { message = "Token is required" });

            var tokenInfo = _jwtService.GetTokenInfo(tokenDto.Token);
            return Ok(tokenInfo);
        }

        /// <summary>
        /// Refresh JWT token (extend expiration)
        /// </summary>
        [HttpPost("refresh")]
        [RequireAuth]
        public async Task<IActionResult> RefreshToken()
        {
            var memberIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!long.TryParse(memberIdClaim, out long memberId))
                return Unauthorized(new { message = "Invalid token" });

            var member = await _memberService.GetMemberProfileAsync(memberId);
            if (member == null)
                return NotFound(new { message = "Member not found" });

            var memberRepository = HttpContext.RequestServices.GetRequiredService<Repositories.IMemberRepository>();
            var memberEntity = await memberRepository.GetMemberByIdAsync(memberId);
            
            if (memberEntity == null)
                return NotFound(new { message = "Member not found" });

            var newToken = _jwtService.GenerateToken(memberEntity);
            
            return Ok(new { 
                message = "Token refreshed successfully",
                token = newToken,
                member = member
            });
        }

        /// <summary>
        /// Get current user info from JWT token
        /// </summary>
        [HttpGet("me")]
        [RequireAuth]
        public IActionResult GetCurrentUser()
        {
            return Ok(new
            {
                memberId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                email = User.FindFirst(ClaimTypes.Email)?.Value,
                name = User.FindFirst(ClaimTypes.Name)?.Value,
                role = User.FindFirst(ClaimTypes.Role)?.Value,
                isActive = User.FindFirst("IsActive")?.Value
            });
        }

        /// <summary>
        /// Revoke token (logout)
        /// </summary>
        [HttpPost("revoke")]
        [RequireAuth]
        public IActionResult RevokeToken()
        {
            return Ok(new { message = "Token revoked successfully. Please remove token from client storage." });
        }

        /// <summary>
        /// Check if current user has specific role
        /// </summary>
        [HttpGet("check-role/{role}")]
        [RequireAuth]
        public IActionResult CheckRole(string role)
        {
            var currentRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var hasRole = string.Equals(currentRole, role, StringComparison.OrdinalIgnoreCase);
            return Ok(new { 
                role = role,
                hasRole = hasRole,
                currentRole = currentRole
            });
        }

        /// <summary>
        /// Admin only endpoint for testing
        /// </summary>
        [HttpGet("admin-only")]
        [RequireAdmin]
        public IActionResult AdminOnly()
        {
            return Ok(new { 
                message = "This is admin only content",
                user = User.FindFirst(ClaimTypes.Name)?.Value,
                role = User.FindFirst(ClaimTypes.Role)?.Value
            });
        }

        /// <summary>
        /// Seller only endpoint for testing
        /// </summary>
        [HttpGet("seller-only")]
        [RequireSeller]
        public IActionResult SellerOnly()
        {
            return Ok(new { 
                message = "This is seller only content",
                user = User.FindFirst(ClaimTypes.Name)?.Value,
                role = User.FindFirst(ClaimTypes.Role)?.Value
            });
        }

        /// <summary>
        /// Seller or Admin endpoint for testing
        /// </summary>
        [HttpGet("seller-or-admin")]
        [RequireSellerOrAdmin]
        public IActionResult SellerOrAdmin()
        {
            return Ok(new { 
                message = "This content is for sellers and admins",
                user = User.FindFirst(ClaimTypes.Name)?.Value,
                role = User.FindFirst(ClaimTypes.Role)?.Value
            });
        }
    }

    public class ValidateTokenDto
    {
        public string Token { get; set; } = string.Empty;
    }
}