using Erp.Server.Models;
using Erp.Server.Repository;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", p =>
        p.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "https://husicaptain.com",
                "http://72.61.226.117:443"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
    );
});

// Force lowercase routing (Linux safe)
builder.Services.AddRouting(o => o.LowercaseUrls = true);

// JWT
builder.Services.AddSingleton<IJwtAuthManager, JwtAuthManager>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("KDSFADSJFNFDGJASDFGADFNEJFWRWERdDSFHAKSD")
        ),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
    o.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });
});

// DB
builder.Services.AddDbContext<DBContext>(options =>
{
    var conn = builder.Environment.IsDevelopment()
        ? builder.Configuration.GetConnectionString("DevelopmentConnectionStr")
        : builder.Configuration.GetConnectionString("ConnectionStr");

    options.UseSqlServer(conn);
});

// DI Services
builder.Services.AddTransient<IUser, UserRepository>();
builder.Services.AddTransient<ILogin, LoginRepository>();
// ... your other services

var app = builder.Build();

// Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    c.RoutePrefix = "swagger";
});

app.UseRouting();
app.UseCors("AllowSpecificOrigin");
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// API first (critical)
app.MapControllers();

// ---------------- REAL FIX ----------------
// Prevent Angular fallback from hijacking /api/* AND /swagger/*
app.MapFallback(context =>
{
    var path = context.Request.Path.Value?.ToLower();

    if (path.StartsWith("/api") || path.StartsWith("/swagger"))
    {
        context.Response.StatusCode = 404;
        return context.Response.WriteAsync("API endpoint not found.");
    }

    return context.Response.SendFileAsync("wwwroot/index.html");
});
// ------------------------------------------

app.Run();
