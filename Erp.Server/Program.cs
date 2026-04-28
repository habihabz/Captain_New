using Erp.Server.Models;
using Erp.Server.Repository;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =======================
// CORS
// =======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", p =>
        p.WithOrigins("http://localhost:65448", "http://localhost:65449", "http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .SetIsOriginAllowed(origin => true)
    );
});

// Force lowercase routing (Linux safe)
builder.Services.AddRouting(o => o.LowercaseUrls = true);

// =======================
// JWT
// =======================
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

// =======================
// Database
// =======================
builder.Services.AddDbContext<DBContext>(options =>
{
    var conn = builder.Environment.IsDevelopment()
        ? builder.Configuration.GetConnectionString("DevelopmentConnectionStr")
        : builder.Configuration.GetConnectionString("ConnectionStr");

    options.UseSqlServer(conn);
});

// DI Services
builder.Services.AddTransient<IUser, UserRepository>();
builder.Services.AddTransient<IRole, RoleRepository>();
builder.Services.AddTransient<ILogin, LoginRepository>();
builder.Services.AddTransient<IPurchaseOrder, PurchaseOrderRepository>();
builder.Services.AddTransient<IMenu, MenuRepository>();
builder.Services.AddTransient<IRoleMenu, RoleMenuRepository>();
builder.Services.AddTransient<ISupplier, SupplierRepository>();
builder.Services.AddTransient<IExpense, ExpenseRepository>();
builder.Services.AddTransient<IIncome, IncomeRepository>();
builder.Services.AddTransient<ICategory, CategoryRepository>();
builder.Services.AddTransient<IMasterData, MasterDataRepository>();
builder.Services.AddTransient<IProduct, ProductRepository>();
builder.Services.AddTransient<IFeedback, FeedbackRepository>();
builder.Services.AddTransient<IProductReview, ProductReviewRepository>();
builder.Services.AddTransient<ISellingPrice, sellingPriceRepository>();
builder.Services.AddTransient<ICart, CartRepository>();
builder.Services.AddTransient<ICustomerOrder, CustomerOrderRepository>();
builder.Services.AddTransient<IStatus, StatusRepository>();
builder.Services.AddTransient<IAddress, AddressRepository>();
builder.Services.AddTransient<ISlider, SliderRepository>();
builder.Services.AddTransient<IBlog, BlogRepository>();
builder.Services.AddTransient<IOrderMovementHistory, OrderMovementHistoryRepository>();
builder.Services.AddTransient<IFavourite, FavouriteRepository>();
builder.Services.AddTransient<IConstantValue, ConstantValueRepository>();
builder.Services.AddTransient<IReport, ReportRepository>();
builder.Services.AddTransient<IReturnOrder, ReturnOrderRepository>();
builder.Services.AddTransient<IGeneratePDF, GenetatePDFRepository>();
builder.Services.AddTransient<IPromocode, PromocodeRepository>();
builder.Services.AddTransient<IRefund, RefundRepository>();

builder.WebHost.CaptureStartupErrors(true);
builder.WebHost.UseSetting(WebHostDefaults.DetailedErrorsKey, "true");
QuestPDF.Settings.License = LicenseType.Community;
var app = builder.Build();

// ----------------------------------------------------
// TRUST FORWARDED HEADERS (REQUIRED FOR NGINX)
// ----------------------------------------------------
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    c.RoutePrefix = "swagger";
});

app.UseDeveloperExceptionPage();

app.UseRouting();

app.UseCors("AllowSpecificOrigin");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// API Controller Endpoints
app.MapControllers();

// ----------------------------------------------------
// ANGULAR FALLBACK (ONLY for FRONTEND ROUTES)
// ----------------------------------------------------
// IMPORTANT: Do NOT block /api/ here. Let NGINX route it.
app.MapFallbackToFile("index.html");

// ----------------------------------------------------
app.Run();
