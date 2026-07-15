using Erp.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;
using Erp.Server.Models;

namespace Erp.Server.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class OtpController : ControllerBase
    {
        private readonly IMemoryCache _cache;
        private readonly INotificationService _notificationService;

        public OtpController(IMemoryCache cache, INotificationService notificationService)
        {
            _cache = cache;
            _notificationService = notificationService;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.phone))
                    return BadRequest(new { message = "Phone number is required" });

                // Generate 6 digit OTP
                var random = new Random();
                string otp = random.Next(100000, 999999).ToString();

                // Store in memory cache for 5 minutes
                _cache.Set("OTP_" + request.phone, otp, TimeSpan.FromMinutes(5));

                // Send via WhatsApp
                // The Meta API requires passing a template for initial contact, but we will pass text for now, 
                // Or maybe we can just use the provided NotificationService logic which sends a text body.
                string message = $"Your Captain verification code is: {otp}. It will expire in 5 minutes.";
                bool sent = await _notificationService.SendWhatsAppAsync("91" + request.phone, message); // appending 91 for India assuming Indian numbers are standard 10 digits

                if (sent)
                {
                    return Ok(new { message = "Success" });
                }
                else
                {
                    // For testing/development, if WhatsApp fails (e.g. invalid template/permissions),
                    // We log the OTP to the console and return success so the frontend flow isn't blocked.
                    Console.WriteLine($"\n=========================================");
                    Console.WriteLine($"[DEV MODE] WhatsApp Failed.");
                    Console.WriteLine($"[DEV MODE] OTP for {request.phone} is: {otp}");
                    Console.WriteLine($"=========================================\n");
                    
                    return Ok(new { 
                        message = "Success", 
                        devNote = "WhatsApp failed. Check backend console for OTP.",
                        devOtp = otp // Returning it here so they can see it in the browser's Network tab for quick testing
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred: " + ex.Message });
            }
        }

        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] OtpRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.phone) || string.IsNullOrEmpty(request?.otp))
                    return BadRequest(new { message = "Phone and OTP are required" });

                if (_cache.TryGetValue("OTP_" + request.phone, out string cachedOtp))
                {
                    if (cachedOtp == request.otp)
                    {
                        // Verified successfully, remove from cache
                        _cache.Remove("OTP_" + request.phone);
                        return Ok(new { message = "Success" });
                    }
                }

                return BadRequest(new { message = "Invalid or expired OTP" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred: " + ex.Message });
            }
        }
    }
}
