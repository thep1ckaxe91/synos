using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Synos.Api.Data;
using Synos.Api.Middlewares;
using Synos.Api.Repositories;
using Synos.Api.Services;
using Synos.Api.Services.AuctionServices;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), 
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

builder.Services.AddScoped<IMemberRepository, MemberRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IArtworkRepository, ArtworkRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IExhibitionRepository, ExhibitionRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IAuctionRepository, AuctionRepository>();
builder.Services.AddScoped<ICommissionRepository, CommissionRepository>();

builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ISellerService, SellerService>();
builder.Services.AddScoped<IBuyerService, BuyerService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IVnPayService, VnPayService>();
builder.Services.AddScoped<IGuestService, GuestService>();

builder.Services.AddHostedService<AuctionEndingService>();
builder.Services.AddHostedService<OrderExpirationService>();
builder.Services.AddHostedService<AuctionStartingService>();


var jwtSecretKey = builder.Configuration["JwtSettings:SecretKey"] ?? "SynosSecretKeyForJWT2025VietnamUTC+7DefaultKey123456789";
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "SynosApi";
var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "SynosApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "AllowFrontend",
                    policy  =>
                    {
                        policy.WithOrigins("*")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                    });
});
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowFrontend");

// Enable serving static files (uploaded images)
app.UseStaticFiles();

// Configure static file options for uploads directory
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions()
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Use authentication and authorization
app.UseAuthentication();
app.UseJwtMiddleware(); // Custom JWT middleware
app.UseAuthorization();

// Map controllers
app.MapControllers();

app.MapGet("/", () => "Hello from ASP.NET Backend!");
app.MapHealthChecks("/api/health");

app.Run();
