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
    }

}
