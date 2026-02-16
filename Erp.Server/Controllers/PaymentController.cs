using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Razorpay.Api;
using System.Collections.Generic;


namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {

        private readonly string key = "rzp_test_qKiDdOgRFuLrJj";
        private readonly string secret = "BESqvp0LNCUAbiYJZVqnUnaS";
        private readonly ILogger<PaymentController> logger;
        private readonly IUser iusers;
    
        public PaymentController(ILogger<PaymentController> _logger,IUser _iusers)
        {
            logger = _logger;
            iusers = _iusers;
         
        }

        [HttpPost("create-order")]
        public IActionResult CreateOrder([FromBody] PaymentRequest request)
        {
            try
            {
                RazorpayClient client = new RazorpayClient(key, secret);

                int amountInPaise = Convert.ToInt32(request.Amount * 100);

                Dictionary<string, object> options = new Dictionary<string, object>
        {
            { "amount", amountInPaise },   // MUST be int
            { "currency", "INR" },
            { "receipt", $"ERP_{DateTime.Now.Ticks}" },
            { "payment_capture", 1 }
        };

                Order order = client.Order.Create(options);

                return Ok(new
                {
                    orderId = order["id"].ToString(),
                    amount = request.Amount,
                    currency = "INR",
                    key = key
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        public class PaymentRequest
        {
            public decimal Amount { get; set; }
        }
    }
}
