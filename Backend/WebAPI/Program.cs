using Microsoft.EntityFrameworkCore;
using WebAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<BoardDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Board")));

var app = builder.Build();

// Apply pending migrations on startup, in every environment. Fine for a small app with
// one instance; with several instances they would race, and migrations should run separately.
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<BoardDbContext>().Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// No UseHttpsRedirection: in production the hosting platform terminates HTTPS in front of
// the container, which only receives plain HTTP. Locally, calls go through the Vite proxy.

// Serve the built frontend (copied into wwwroot by the Dockerfile) from the same address as the API.
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Any other path is a client-side route: return the frontend's index.html.
app.MapFallbackToFile("index.html");

app.Run();
