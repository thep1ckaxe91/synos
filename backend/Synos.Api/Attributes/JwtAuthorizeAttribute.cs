using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Synos.Api.Services;
using System.Security.Claims;

namespace Synos.Api.Attributes
{
    /// <summary>
    /// Custom JWT Authorization Attribute
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class JwtAuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string[]? _allowedRoles;

        public JwtAuthorizeAttribute(params string[] allowedRoles)
        {
            _allowedRoles = allowedRoles?.Length > 0 ? allowedRoles : null;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Skip authorization for methods marked with [AllowAnonymous]
            if (context.ActionDescriptor.EndpointMetadata.Any(x => x.GetType() == typeof(Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute)))
            {
                return;
            }

            var user = context.HttpContext.User;

            // Check if user is authenticated
            if (user == null || !user.Identity!.IsAuthenticated)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Access denied. Authentication required." });
                return;
            }

            // Check if user is active
            var isActiveClaim = user.FindFirst("IsActive");
            if (isActiveClaim == null || !bool.Parse(isActiveClaim.Value))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Account is deactivated." });
                return;
            }

            // Check roles if specified
            if (_allowedRoles != null && _allowedRoles.Length > 0)
            {
                var userRole = user.FindFirst(ClaimTypes.Role)?.Value;
                if (string.IsNullOrEmpty(userRole) || !_allowedRoles.Contains(userRole))
                {
                    context.Result = new ForbiddenResult();
                    return;
                }
            }
        }
    }

    /// <summary>
    /// Require Customer role
    /// </summary>
    public class RequireCustomerAttribute : JwtAuthorizeAttribute
    {
        public RequireCustomerAttribute() : base("Customer") { }
    }

    /// <summary>
    /// Require Artist role
    /// </summary>
    public class RequireArtistAttribute : JwtAuthorizeAttribute
    {
        public RequireArtistAttribute() : base("Artist") { }
    }

    /// <summary>
    /// Require Admin role
    /// </summary>
    public class RequireAdminAttribute : JwtAuthorizeAttribute
    {
        public RequireAdminAttribute() : base("Admin") { }
    }

    /// <summary>
    /// Require Artist or Admin role
    /// </summary>
    public class RequireArtistOrAdminAttribute : JwtAuthorizeAttribute
    {
        public RequireArtistOrAdminAttribute() : base("Artist", "Admin") { }
    }

    /// <summary>
    /// Allow any authenticated user
    /// </summary>
    public class RequireAuthAttribute : JwtAuthorizeAttribute
    {
        public RequireAuthAttribute() : base() { }
    }
}

namespace Synos.Api.Extensions
{
    /// <summary>
    /// Extensions for HttpContext to easily access current user info
    /// </summary>
    public static class HttpContextExtensions
    {
        public static long? GetCurrentMemberId(this HttpContext context)
        {
            var memberIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (memberIdClaim != null && long.TryParse(memberIdClaim.Value, out long memberId))
            {
                return memberId;
            }
            return null;
        }

        public static string? GetCurrentMemberEmail(this HttpContext context)
        {
            return context.User?.FindFirst(ClaimTypes.Email)?.Value;
        }

        public static string? GetCurrentMemberRole(this HttpContext context)
        {
            return context.User?.FindFirst(ClaimTypes.Role)?.Value;
        }

        public static string? GetCurrentMemberName(this HttpContext context)
        {
            return context.User?.FindFirst(ClaimTypes.Name)?.Value;
        }

        public static bool IsCurrentMemberActive(this HttpContext context)
        {
            var isActiveClaim = context.User?.FindFirst("IsActive");
            return isActiveClaim != null && bool.Parse(isActiveClaim.Value);
        }

        public static bool IsCurrentMemberInRole(this HttpContext context, string role)
        {
            return context.GetCurrentMemberRole()?.Equals(role, StringComparison.OrdinalIgnoreCase) == true;
        }
    }
}