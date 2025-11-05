using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Synos.Api.Attributes;
using Synos.Api.Extensions;
using Synos.Api.Services;

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

            var tokenInfo = ((JwtService)_jwtService).GetTokenInfo(tokenDto.Token);
            return Ok(tokenInfo);
        }

        /// <summary>
        /// Refresh JWT token (extend expiration)
        /// </summary>
        [HttpPost("refresh")]
        [RequireAuth]
        public async Task<IActionResult> RefreshToken()
        {
            var memberId = HttpContext.GetCurrentMemberId();
            if (memberId == null)
                return Unauthorized(new { message = "Invalid token" });

            var member = await _memberService.GetMemberProfileAsync(memberId.Value);
            if (member == null)
                return NotFound(new { message = "Member not found" });

            // Get member entity for token generation
            var memberRepository = HttpContext.RequestServices.GetRequiredService<Repositories.IMemberRepository>();
            var memberEntity = await memberRepository.GetMemberByIdAsync(memberId.Value);
            
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
                memberId = HttpContext.GetCurrentMemberId(),
                email = HttpContext.GetCurrentMemberEmail(),
                name = HttpContext.GetCurrentMemberName(),
                role = HttpContext.GetCurrentMemberRole(),
                isActive = HttpContext.IsCurrentMemberActive()
            });
        }

        /// <summary>
        /// Revoke token (logout)
        /// </summary>
        [HttpPost("revoke")]
        [RequireAuth]
        public IActionResult RevokeToken()
        {
            // In a production system, you would add the token to a blacklist
            // For now, just return success as logout is handled client-side
            return Ok(new { message = "Token revoked successfully. Please remove token from client storage." });
        }

        /// <summary>
        /// Check if current user has specific role
        /// </summary>
        [HttpGet("check-role/{role}")]
        [RequireAuth]
        public IActionResult CheckRole(string role)
        {
            var hasRole = HttpContext.IsCurrentMemberInRole(role);
            return Ok(new { 
                role = role,
                hasRole = hasRole,
                currentRole = HttpContext.GetCurrentMemberRole()
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
                user = HttpContext.GetCurrentMemberName(),
                role = HttpContext.GetCurrentMemberRole()
            });
        }

        /// <summary>
        /// Artist only endpoint for testing
        /// </summary>
        [HttpGet("artist-only")]
        [RequireArtist]
        public IActionResult ArtistOnly()
        {
            return Ok(new { 
                message = "This is artist only content",
                user = HttpContext.GetCurrentMemberName(),
                role = HttpContext.GetCurrentMemberRole()
            });
        }

        /// <summary>
        /// Artist or Admin endpoint for testing
        /// </summary>
        [HttpGet("artist-or-admin")]
        [RequireArtistOrAdmin]
        public IActionResult ArtistOrAdmin()
        {
            return Ok(new { 
                message = "This content is for artists and admins",
                user = HttpContext.GetCurrentMemberName(),
                role = HttpContext.GetCurrentMemberRole()
            });
        }
    }

    public class ValidateTokenDto
    {
        public string Token { get; set; } = string.Empty;
    }
}