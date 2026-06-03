using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<User> logger;
        private readonly IUser iusers;
        private readonly INotificationService inotificationService;
        private readonly Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;
    
        public UserController(ILogger<User> _logger,IUser _iusers, INotificationService _inotificationService, Microsoft.Extensions.Caching.Memory.IMemoryCache cache)
        {
            logger = _logger;
            iusers = _iusers;
            inotificationService = _inotificationService;
            _cache = cache;
        }
           
        [HttpPost("getUsers")]
        [Authorize]
        public List<User> getUsers()
        {

            List<User> users = new List<User>();
            users = iusers.getUsers();
            return users;
        }


        [HttpPost("getUser")]
        [Authorize]
        public User getUser([FromBody] int id)
        {
            User user = new User();
            user = iusers.getUser(id);
            return user;
        }

        [HttpPost("deleteUser")]
        [Authorize]
        public DbResult deleteUser([FromBody] int id)
        {
            DbResult dbResult=new DbResult();
            dbResult = iusers.deleteUser(id);
            return dbResult;
        }

        [HttpPost("createOrUpdateUser")]
        [Authorize]
        public DbResult createOrUpdateUser([FromBody] User user)
        {
            DbResult dbResult = new DbResult();
            dbResult = iusers.createOrUpdateUser(user);
            return dbResult;
        }

        [HttpPost("registerUser")]
        public DbResult registerUser([FromBody] User user)
        {
            DbResult dbResult = new DbResult();
            dbResult = iusers.registerUser(user);
            return dbResult;
        }

        [HttpPost("updatePassword")]
        [Authorize]
        public DbResult updatePassword([FromBody] PasswordUpdateRequest request)
        {
            DbResult dbResult = new DbResult();
            dbResult = iusers.updatePassword(request.userId, request.newPassword);
            return dbResult;
        }

        [HttpPost("uploadProfileImage")]
        [Authorize]
        public async Task<DbResult> uploadProfileImage([FromForm] int id, IFormFile image)
        {
            if (image != null && image.Length > 0)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                var imageUrl = $"/uploads/profiles/{fileName}";
                var result = iusers.updateProfileImage(id, imageUrl);

                if (result.message == "Success")
                {
                    result.message = imageUrl; // Return the URL so the frontend can update immediately
                }

                return result;
            }
            return new DbResult { id = 0, message = "No image file provided" };
        }

        [HttpPost("sendVerificationCode")]
        [Authorize]
        public async Task<DbResult> sendVerificationCode([FromBody] VerificationRequest request)
        {
            string code = new Random().Next(100000, 999999).ToString();
            string cacheKey = $"Verification_{request.UserId}_{request.Type}";
            
            _cache.Set(cacheKey, code, TimeSpan.FromMinutes(5));

            bool success = false;
            if (request.Type.Equals("Email", StringComparison.OrdinalIgnoreCase))
            {
                success = await inotificationService.SendEmailAsync(request.Target, "Captain App Verification Code", $"Your verification code is: {code}");
            }
            else if (request.Type.Equals("Phone", StringComparison.OrdinalIgnoreCase))
            {
                success = await inotificationService.SendWhatsAppAsync(request.Target, $"Your Captain App verification code is: {code}");
            }

            if (success)
            {
                return new DbResult { message = "Success" };
            }

            return new DbResult { message = "Failed to send verification code." };
        }

        [HttpPost("verifyCode")]
        [Authorize]
        public DbResult verifyCode([FromBody] VerifyCodeRequest request)
        {
            string cacheKey = $"Verification_{request.UserId}_{request.Type}";
            if (_cache.TryGetValue(cacheKey, out string? storedCode))
            {
                if (storedCode == request.Code)
                {
                    _cache.Remove(cacheKey);
                    
                    // Call repository to update the flag in database
                    return iusers.updateUserVerification(request.UserId, request.Type);
                }
                return new DbResult { message = "Invalid code." };
            }
            
            return new DbResult { message = "Code expired or not found." };
        }
        [HttpPost("updateProfile")]
        [Authorize]
        public DbResult updateProfile([FromBody] User user)
        {
            DbResult dbResult = new DbResult();
            dbResult = iusers.updateProfileDetails(user);
            return dbResult;
        }
    }
}
