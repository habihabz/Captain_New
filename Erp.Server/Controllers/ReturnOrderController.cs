using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReturnOrderController : ControllerBase
    {
        private readonly IReturnOrder ireturnOrder;
        private readonly IUser iuser;
        private readonly INotificationService inotificationService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ReturnOrderController> _logger;
        private readonly ICustomerOrder icustomerOrder;

        public ReturnOrderController(IReturnOrder _ireturnOrder, IUser _iuser, INotificationService _inotificationService, IConfiguration configuration, ILogger<ReturnOrderController> logger, ICustomerOrder _icustomerOrder)
        {
            ireturnOrder = _ireturnOrder;
            iuser = _iuser;
            inotificationService = _inotificationService;
            _configuration = configuration;
            _logger = logger;
            icustomerOrder = _icustomerOrder;
        }

        [HttpPost("raiseReturnRequest")]
        [Authorize]
        public async Task<DbResult> raiseReturnRequest([FromBody] ReturnOrder returnOrder)
        {
            var dbResult = ireturnOrder.raiseReturnRequest(returnOrder);
            
            try
            {
                if (returnOrder.ro_order_no > 0 && (dbResult.message == "Success" || dbResult.message.Contains("successfully", StringComparison.OrdinalIgnoreCase)))
                {
                    var order = icustomerOrder.getCustomerOrder(returnOrder.ro_order_no);
                    var userProfile = iuser.getUser(returnOrder.ro_cre_by ?? 0);
                    string targetEmail = userProfile?.u_email ?? "";
                    string targetPhone = userProfile?.u_phone ?? "";
                    
                    if (!string.IsNullOrEmpty(targetEmail) || !string.IsNullOrEmpty(targetPhone))
                    {
                        string frontendUrl = _configuration["FrontendUrl"]?.TrimEnd('/') ?? "http://localhost:4200";
                        string orderLink = $"{frontendUrl}/#/order-details/{order?.co_id}";
                        string subject = "Return Request Submitted";
                        
                        if (!string.IsNullOrEmpty(targetEmail))
                        {
                            string emailBody = $"Dear {userProfile?.u_name ?? order?.co_customer_name},<br><br>" +
                                $"Your return request for order <b>#{order?.co_id}</b> has been successfully submitted.<br><br>" +
                                $"Our team will review your request and get back to you shortly.<br><br>" +
                                $"<a href='{orderLink}'>Click here to view your order details</a><br><br>" +
                                $"<small>Please do not reply to this email, as this inbox is not monitored.</small>";
                            await inotificationService.SendEmailAsync(targetEmail, subject, emailBody);
                        }
                            
                        if (!string.IsNullOrEmpty(targetPhone))
                        {
                            string whatsappBody = $"Dear {userProfile?.u_name ?? order?.co_customer_name},\n" +
                                $"Your return request for order #{order?.co_id} has been successfully submitted.\n\n" +
                                $"Our team will review your request and get back to you shortly.\n\n" +
                                $"View your order details here: {orderLink}\n\n" +
                                $"_(Please do not reply to this message)_";
                            await inotificationService.SendWhatsAppAsync(targetPhone, whatsappBody);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending return notification.");
            }

            return dbResult;
        }

        [HttpPost("updateReturnStatus")]
        [Authorize]
        public DbResult updateReturnStatus([FromBody] ReturnOrder returnOrder)
        {
            return ireturnOrder.updateReturnStatus(returnOrder);
        }

        [HttpPost("getReturnRequests")]
        [Authorize]
        public List<ReturnOrder> getReturnRequests([FromBody] RequestParams requestParams)
        {
            return ireturnOrder.getReturnRequests(requestParams);
        }

        [HttpPost("getReturnRequestById")]
        [Authorize]
        public ReturnOrder getReturnRequestById([FromBody] int id)
        {
            return ireturnOrder.getReturnRequestById(id);
        }
    }
}
