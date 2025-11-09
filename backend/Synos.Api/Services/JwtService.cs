using Microsoft.IdentityModel.Tokens;
using Synos.Api.Models;
using Synos.Api.Utils;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Synos.Api.Services
{
    public interface IJwtService
    {
        string GenerateToken(Member member);
        string GenerateAdminToken(Admin admin);
        ClaimsPrincipal? ValidateToken(string token);
        long? GetMemberIdFromToken(string token);
        string? GetEmailFromToken(string token);
        string? GetRoleFromToken(string token);
        bool IsTokenExpired(string token);
        bool IsAdminToken(string token);
        TokenInfoDto GetTokenInfo(string token);
    }

    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expirationMinutes;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
            _secretKey = _configuration["JwtSettings:SecretKey"] ?? "SynosSecretKeyForJWT2025VietnamUTC+7DefaultKey123456789";
            _issuer = _configuration["JwtSettings:Issuer"] ?? "SynosApi";
            _audience = _configuration["JwtSettings:Audience"] ?? "SynosClients";
            _expirationMinutes = int.Parse(_configuration["JwtSettings:ExpirationMinutes"] ?? "1440"); // 24 hours default
        }

        public string GenerateToken(Member member)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, member.Id.ToString()),
                new Claim(ClaimTypes.Email, member.Email),
                new Claim(ClaimTypes.Name, member.FullName),
                new Claim(ClaimTypes.Role, member.Role.ToString()),
                new Claim("IsActive", member.IsActive.ToString()),
                new Claim("UserType", "Member"), // Distinguish from Admin
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            // Add phone if available
            if (!string.IsNullOrEmpty(member.Phone))
            {
                claims.Add(new Claim("Phone", member.Phone));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = TimeUtils.GetCurrentTime().AddMinutes(_expirationMinutes),
                Issuer = _issuer,
                Audience = _audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateAdminToken(Admin admin)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                new Claim(ClaimTypes.Email, admin.Email),
                new Claim(ClaimTypes.Name, admin.FullName),
                new Claim(ClaimTypes.Role, "Admin"),
                new Claim("IsActive", admin.IsActive.ToString()),
                new Claim("UserType", "Admin"), // Distinguish from Member
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            // Add phone if available
            if (!string.IsNullOrEmpty(admin.Phone))
            {
                claims.Add(new Claim("Phone", admin.Phone));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = TimeUtils.GetCurrentTime().AddMinutes(_expirationMinutes),
                Issuer = _issuer,
                Audience = _audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_secretKey);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,
                    ValidateAudience = true,
                    ValidAudience = _audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch
            {
                return null;
            }
        }

        public long? GetMemberIdFromToken(string token)
        {
            var principal = ValidateToken(token);
            if (principal == null) return null;

            var memberIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (memberIdClaim != null && long.TryParse(memberIdClaim.Value, out long memberId))
            {
                return memberId;
            }

            return null;
        }

        public string? GetEmailFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst(ClaimTypes.Email)?.Value;
        }

        public string? GetRoleFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst(ClaimTypes.Role)?.Value;
        }

        public bool IsTokenExpired(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                return jwtToken.ValidTo < TimeUtils.GetCurrentTime();
            }
            catch
            {
                return true;
            }
        }

        public bool IsAdminToken(string token)
        {
            var principal = ValidateToken(token);
            var userType = principal?.FindFirst("UserType")?.Value;
            return userType == "Admin";
        }

        public TokenInfoDto GetTokenInfo(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var principal = ValidateToken(token);

                if (principal == null)
                {
                    return new TokenInfoDto
                    {
                        IsValid = false,
                        IsExpired = true
                    };
                }

                return new TokenInfoDto
                {
                    IsValid = true,
                    IsExpired = jwtToken.ValidTo < TimeUtils.GetCurrentTime(),
                    MemberId = GetMemberIdFromToken(token),
                    Email = GetEmailFromToken(token),
                    Role = GetRoleFromToken(token),
                    ExpiresAt = jwtToken.ValidTo,
                    IssuedAt = jwtToken.ValidFrom,
                    Issuer = jwtToken.Issuer,
                    Audience = jwtToken.Audiences.FirstOrDefault()
                };
            }
            catch
            {
                return new TokenInfoDto
                {
                    IsValid = false,
                    IsExpired = true
                };
            }
        }
    }

    public class TokenInfoDto
    {
        public bool IsValid { get; set; }
        public bool IsExpired { get; set; }
        public long? MemberId { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? IssuedAt { get; set; }
        public string? Issuer { get; set; }
        public string? Audience { get; set; }
    }
}