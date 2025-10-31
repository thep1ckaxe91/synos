var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "AllowFrontend",
                      policy  =>
                      {
                          policy.WithOrigins(builder.Configuration["FrontendUrl"])
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
app.UseCors("AllowFrontend");

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/", () => "Hello from ASP.NET Backend!");
app.MapHealthChecks("/api/health");
app.MapGet("/api/randomstring", () => GetRandomSummary(summaries));

app.Run();

string GetRandomSummary(string[] summaries)
{
    return summaries[Random.Shared.Next(summaries.Length)];
}

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
