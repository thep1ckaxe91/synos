using Microsoft.AspNetCore.Authorization;
using Synos.Api.Services;

namespace Synos.Api.Middlewares
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IJwtService jwtService)
        {
            var token = ExtractTokenFromHeader(context.Request);

            if (!string.IsNullOrEmpty(token))
            {
                var principal = jwtService.ValidateToken(token);
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