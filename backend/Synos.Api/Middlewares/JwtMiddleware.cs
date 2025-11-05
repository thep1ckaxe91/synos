using Microsoft.AspNetCore.Authorization;
using Synos.Api.Services;

namespace Synos.Api.Middlewares
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IJwtService _jwtService;

        public JwtMiddleware(RequestDelegate next, IJwtService jwtService)
        {
            _next = next;
            _jwtService = jwtService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = ExtractTokenFromHeader(context.Request);

            if (!string.IsNullOrEmpty(token))
            {
                var principal = _jwtService.ValidateToken(token);
                if (principal != null)
                {
                    context.User = principal;
                }
            }

            await _next(context);
        }

        private string? ExtractTokenFromHeader(HttpRequest request)
        {
            var authHeader = request.Headers["Authorization"].FirstOrDefault();
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                return authHeader.Substring("Bearer ".Length).Trim();
            }
            return null;
        }
    }

    public static class JwtMiddlewareExtensions
    {
        public static IApplicationBuilder UseJwtMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<JwtMiddleware>();
        }
    }
}