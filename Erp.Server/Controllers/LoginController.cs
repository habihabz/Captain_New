using Erp.Server.Models;
using Erp.Server.Repository;
using Erp.Server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Runtime.CompilerServices;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly ILogger<LoginController> _logger;
        private readonly IUser _iusers;
        private readonly ILogin _ilogin;
        private readonly IJwtAuthManager _jwtAuthManager;

        public LoginController(ILogger<LoginController> logger, IUser iusers, ILogin ilogin, IJwtAuthManager jwtAuthManager)
        {
            _logger = logger;
            _iusers = iusers;
            _ilogin = ilogin;
            _jwtAuthManager = jwtAuthManager;
        }

        [HttpPost("getlogin")]
        public ActionResult<Credentials> GetLogin([FromBody] Login Login)
        {
            if (string.IsNullOrEmpty(Login.username)  || string.IsNullOrEmpty(Login.password))
            {
                return BadRequest(new Credentials { message = "Please Enter All Data !!" });
            }

            try
            {
                var dbResult = _ilogin.getlogin(Login.username, Login.password);
                if (dbResult.message == "Success")
                {
                    User user = _iusers.getUserByUsername(Login.username);
                    user.u_password = "";
                    var token = _jwtAuthManager.GenerateToken(  Login.username);
                    var credentials = new Credentials
                    {
                        username = Login.username,
                        token = token,
                        message = dbResult.message,
                        user = user

                    };
                    return Ok(credentials);
                }
                else
                {
                    return Unauthorized(new Credentials { username = Login.username, message = dbResult.message,user=null });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the login request.");
                string errorMessage = ex.Message + (ex.InnerException != null ? " | Inner: " + ex.InnerException.Message : "");
                return StatusCode(StatusCodes.Status500InternalServerError, new Credentials 
                { 
                    username = Login.username, 
                    message = errorMessage, 
                    user = null 
                });
            }
        }
        [HttpPost("google-login")]
        public async Task<ActionResult<Credentials>> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.idToken))
            {
                return BadRequest(new Credentials { message = "Invalid Google token" });
            }

            try
            {
                // Validate Google token
                var settings = new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings();
                // Optionally specify Client ID: settings.Audience = new[] { "YOUR_CLIENT_ID" };
                
                var payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(request.idToken, settings);

                // Check if user exists by email
                User user = _iusers.getUserByEmail(payload.Email);
                
                bool isNew = false;
                if (user == null || user.u_id == 0)
                {
                    isNew = true;
                    // User doesn't exist, create them
                    User newUser = new User
                    {
                        u_email = payload.Email,
                        u_username = payload.Email, // Use email as username
                        u_name = payload.Name,
                        u_password = "GoogleUser!@#" + Guid.NewGuid().ToString().Substring(0, 8),
                        u_phone = "0000000000", // Dummy phone, since Google doesn't provide it by default
                        u_date_of_birth = new DateTime(2000, 1, 1), // Dummy DOB
                        u_agree_terms = "Y",
                        u_is_get_updates = "Y",
                        u_email_verified = "Y",
                        u_active_yn = "Y",
                        u_is_admin = "N",
                        u_cre_by = 0,
                        u_role_id = 4 // Frontend uses 4 for standard users
                    };
                    
                    var registerResult = _iusers.registerUser(newUser);
                    if (registerResult.message != "Success" && !registerResult.message.Contains("Successfully"))
                    {
                        // In case of error registering
                        return StatusCode(StatusCodes.Status500InternalServerError, new Credentials { message = "Failed to create user from Google profile: " + registerResult.message });
                    }
                    
                    user = _iusers.getUserByEmail(payload.Email);

                    // Update profile picture since registerUser SP doesn't handle it
                    if (user != null && user.u_id > 0 && !string.IsNullOrEmpty(payload.Picture))
                    {
                        _iusers.updateProfileImage(user.u_id, payload.Picture);
                        user.u_image_url = payload.Picture;
                    }

                    // Since they authenticated via Google, their email is inherently verified
                    if (user != null && user.u_id > 0 && user.u_email_verified != "Y")
                    {
                        _iusers.updateUserVerification(user.u_id, "Email");
                        user.u_email_verified = "Y";
                    }
                }

                user.u_password = ""; // Hide password
                
                // Generate JWT token
                var token = _jwtAuthManager.GenerateToken(user.u_username);
                var credentials = new Credentials
                {
                    username = user.u_username,
                    token = token,
                    message = "Success",
                    user = user,
                    isNewUser = isNew
                };
                return Ok(credentials);
            }
            catch (Google.Apis.Auth.InvalidJwtException ex)
            {
                _logger.LogError(ex, "Invalid Google JWT token.");
                return Unauthorized(new Credentials { message = "Invalid Google token" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the Google login request.");
                return StatusCode(StatusCodes.Status500InternalServerError, new Credentials 
                { 
                    message = "An error occurred: " + ex.Message
                });
            }
        }
    }
}
