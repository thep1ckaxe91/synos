using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Synos.Api.Attributes;
using Synos.Api.DTOs;
using Synos.Api.Extensions;
using Synos.Api.Services;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MembersController : ControllerBase
    {
        private readonly IMemberService _memberService;

        public MembersController(IMemberService memberService)
        {
            _memberService = memberService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResultDto>> Login([FromBody] MemberLoginDto loginDto)
        {
            var result = await _memberService.LoginAsync(loginDto);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResultDto>> Register([FromBody] MemberRegisterDto registerDto)
        {
            var result = await _memberService.RegisterAsync(registerDto);
            
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetProfile), new { id = result.Member!.Id }, result);
        }

        [HttpGet("profile/{id}")]
        [RequireOwnerOrAdmin]
        public async Task<ActionResult<MemberDto>> GetProfile(long id)
        {
            var member = await _memberService.GetMemberProfileAsync(id);
            
            if (member == null)
                return NotFound(new { message = "Member not found" });

            return Ok(member);
        }

        [HttpPut("profile/{id}")]
        [RequireOwnerOrAdmin]
        public async Task<ActionResult<MemberDto>> UpdateProfile(long id, [FromBody] UpdateMemberProfileDto updateDto)
        {
            var updatedMember = await _memberService.UpdateProfileAsync(id, updateDto);
            
            if (updatedMember == null)
                return NotFound(new { message = "Member not found" });

            return Ok(updatedMember);
        }

        [HttpPost("change-password/{id}")]
        [RequireOwnerOrAdmin]
        public async Task<IActionResult> ChangePassword(long id, [FromBody] ChangePasswordDto changePasswordDto)
        {
            var success = await _memberService.ChangePasswordAsync(id, changePasswordDto);
            
            if (!success)
                return BadRequest(new { message = "Failed to change password. Please check your current password." });

            return Ok(new { message = "Password changed successfully" });
        }

        [HttpGet("gallery/{id}")]
        [RequireOwnerOrAdmin]
        public async Task<ActionResult<IEnumerable<PersonalGalleryDto>>> ViewPersonalGallery(long id)
        {
            var gallery = await _memberService.GetPersonalGalleryAsync(id);
            return Ok(gallery);
        }

        [HttpPost("gallery/{id}/add")]
        [RequireOwnerOrAdmin]
        public async Task<IActionResult> AddArtworkToPersonalGallery(long id, [FromBody] AddToGalleryDto addDto)
        {
            var success = await _memberService.AddArtworkToGalleryAsync(id, addDto);
            
            if (!success)
                return BadRequest(new { message = "Failed to add artwork to gallery. It might already be in your favorites." });

            return Ok(new { message = "Artwork added to your personal gallery successfully" });
        }

        [HttpDelete("gallery/{id}/remove/{artworkId}")]
        [RequireOwnerOrAdmin]
        public async Task<IActionResult> RemoveArtworkFromPersonalGallery(long id, long artworkId)
        {
            var success = await _memberService.RemoveArtworkFromGalleryAsync(id, artworkId);
            
            if (!success)
                return NotFound(new { message = "Artwork not found in your gallery" });

            return Ok(new { message = "Artwork removed from your personal gallery successfully" });
        }

        [HttpPost("logout/{id}")]
        [RequireOwnerOrAdmin]
        public async Task<IActionResult> Logout(long id)
        {
            var success = await _memberService.LogoutAsync(id);
            
            if (!success)
                return BadRequest(new { message = "Logout failed" });

            return Ok(new { message = "Logged out successfully" });
        }

        /// <summary>
        /// Get current user profile from JWT token
        /// </summary>
        [HttpGet("me")]
        [RequireAuth]
        public async Task<ActionResult<MemberDto>> GetMyProfile()
        {
            var memberId = HttpContext.GetCurrentMemberId();
            if (memberId == null)
                return Unauthorized(new { message = "Invalid token" });

            var member = await _memberService.GetMemberProfileAsync(memberId.Value);
            if (member == null)
                return NotFound(new { message = "Member not found" });

            return Ok(member);
        }

        /// <summary>
        /// Update current user profile
        /// </summary>
        [HttpPut("me")]
        [RequireAuth]
        public async Task<ActionResult<MemberDto>> UpdateMyProfile([FromBody] UpdateMemberProfileDto updateDto)
        {
            var memberId = HttpContext.GetCurrentMemberId();
            if (memberId == null)
                return Unauthorized(new { message = "Invalid token" });

            var updatedMember = await _memberService.UpdateProfileAsync(memberId.Value, updateDto);
            if (updatedMember == null)
                return NotFound(new { message = "Member not found" });

            return Ok(updatedMember);
        }

        /// <summary>
        /// Get my personal gallery
        /// </summary>
        [HttpGet("me/gallery")]
        [RequireAuth]
        public async Task<ActionResult<IEnumerable<PersonalGalleryDto>>> GetMyGallery()
        {
            var memberId = HttpContext.GetCurrentMemberId();
            if (memberId == null)
                return Unauthorized(new { message = "Invalid token" });

            var gallery = await _memberService.GetPersonalGalleryAsync(memberId.Value);
            return Ok(gallery);
        }

        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult HealthCheck()
        {
            return Ok(new { 
                status = "healthy", 
                timestamp = DateTime.UtcNow,
                features = new[]
                {
                    "JWT Authentication",
                    "Role-based Authorization",
                    "Login/Logout",
                    "Registration", 
                    "View Profile",
                    "Update Profile",
                    "Change Password",
                    "Personal Gallery Management"
                }
            });
        }
    }
}