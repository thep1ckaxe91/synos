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
                    context.Result = new StatusCodeResult(403);
                    return;
                }
            }
        }
    }

    /// <summary>
    /// Require Buyer role
    /// </summary>
    public class RequireBuyerAttribute : JwtAuthorizeAttribute
    {
        public RequireBuyerAttribute() : base("Buyer") { }
    }

    /// <summary>
    /// Require Seller role
    /// </summary>
    public class RequireSellerAttribute : JwtAuthorizeAttribute
    {
        public RequireSellerAttribute() : base("Seller") { }
    }

    /// <summary>
    /// Require Admin role (from Admin table, not Member role)
    /// </summary>
    public class RequireAdminAttribute : Attribute, IAuthorizationFilter
    {
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

            // Check if user is Admin type AND has Admin role
            var userRole = user.FindFirst(ClaimTypes.Role)?.Value;
            var userType = user.FindFirst("UserType")?.Value;

            if (userType != "Admin" || userRole != "Admin")
            {
                context.Result = new StatusCodeResult(403); // Forbidden
                return;
            }
        }
    }

    /// <summary>
    /// Require Seller (Member) or Admin role
    /// </summary>
    public class RequireSellerOrAdminAttribute : Attribute, IAuthorizationFilter
    {
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

            var userRole = user.FindFirst(ClaimTypes.Role)?.Value;
            var userType = user.FindFirst("UserType")?.Value;

            // Allow if Admin (from admin table) OR Seller (from member table)
            bool isAdmin = userType == "Admin" && userRole == "Admin";
            bool isSeller = userType == "Member" && userRole == "Seller";

            if (!isAdmin && !isSeller)
            {
                context.Result = new StatusCodeResult(403); // Forbidden
                return;
            }
        }
    }

    /// <summary>
    /// Allow any authenticated user
    /// </summary>
    public class RequireAuthAttribute : JwtAuthorizeAttribute
    {
        public RequireAuthAttribute() : base() { }
    }

    /// <summary>
    /// Ensures that users can only access their own resources.
    /// Checks if the member ID in the route matches the authenticated user's ID.
    /// Admins can access any resource.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class RequireOwnerOrAdminAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string _routeParameterName;

        /// <summary>
        /// Initialize the attribute
        /// </summary>
        /// <param name="routeParameterName">The name of the route parameter containing the member ID (default: "id")</param>
        public RequireOwnerOrAdminAttribute(string routeParameterName = "id")
        {
            _routeParameterName = routeParameterName;
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

            // Get current user ID from JWT token
            var currentMemberIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (currentMemberIdClaim == null || !long.TryParse(currentMemberIdClaim.Value, out long currentMemberId))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Invalid token. Member ID not found." });
                return;
            }

            // Get current user role and type
            var userRole = user.FindFirst(ClaimTypes.Role)?.Value;
            var userType = user.FindFirst("UserType")?.Value;

            // Admin can access any resource
            if (userType == "Admin" && userRole == "Admin")
            {
                return;
            }

            // Get the member ID from route parameters
            var routeData = context.RouteData.Values;
            if (!routeData.ContainsKey(_routeParameterName))
            {
                context.Result = new BadRequestObjectResult(new { message = $"Route parameter '{_routeParameterName}' not found." });
                return;
            }

            if (!long.TryParse(routeData[_routeParameterName]?.ToString(), out long requestedMemberId))
            {
                context.Result = new BadRequestObjectResult(new { message = $"Invalid {_routeParameterName} format." });
                return;
            }

            // Check if the user is trying to access their own resource
            if (currentMemberId != requestedMemberId)
            {
                context.Result = new StatusCodeResult(403); // Forbidden
                return;
            }
        }
    }
}

namespace Synos.Api.Extensions
{
    /// <summary>
    /// Extensions for HttpContext to easily access current user info
    /// </summary>
    public static class HttpContextExtensions
    {
        public static long? GetCurrentUserId(this HttpContext context)
        {
            var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && long.TryParse(userIdClaim.Value, out long userId))
            {
                return userId;
            }
            return null;
        }

        public static long? GetCurrentMemberId(this HttpContext context)
        {
            var userType = context.User?.FindFirst("UserType")?.Value;
            if (userType == "Member")
            {
                return context.GetCurrentUserId();
            }
            return null;
        }

        public static long? GetCurrentAdminId(this HttpContext context)
        {
            var userType = context.User?.FindFirst("UserType")?.Value;
            if (userType == "Admin")
            {
                return context.GetCurrentUserId();
            }
            return null;
        }

        public static string? GetCurrentUserEmail(this HttpContext context)
        {
            return context.User?.FindFirst(ClaimTypes.Email)?.Value;
        }

        public static string? GetCurrentUserRole(this HttpContext context)
        {
            return context.User?.FindFirst(ClaimTypes.Role)?.Value;
        }

        public static string? GetCurrentUserType(this HttpContext context)
        {
            return context.User?.FindFirst("UserType")?.Value;
        }

        public static string? GetCurrentUserName(this HttpContext context)
        {
            return context.User?.FindFirst(ClaimTypes.Name)?.Value;
        }

        public static bool IsCurrentUserActive(this HttpContext context)
        {
            var isActiveClaim = context.User?.FindFirst("IsActive");
            return isActiveClaim != null && bool.Parse(isActiveClaim.Value);
        }

        public static bool IsCurrentUserInRole(this HttpContext context, string role)
        {
            return context.GetCurrentUserRole()?.Equals(role, StringComparison.OrdinalIgnoreCase) == true;
        }

        public static bool IsCurrentUserAdmin(this HttpContext context)
        {
            var userType = context.GetCurrentUserType();
            var role = context.GetCurrentUserRole();
            return userType == "Admin" && role == "Admin";
        }

        public static bool IsCurrentUserMember(this HttpContext context)
        {
            return context.GetCurrentUserType() == "Member";
        }
    }
}