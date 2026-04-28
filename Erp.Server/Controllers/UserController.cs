using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<User> logger;
        private readonly IUser iusers;
    
        public UserController(ILogger<User> _logger,IUser _iusers)
        {
            logger = _logger;
            iusers = _iusers;
         
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
    }
}
