using Erp.Server.Models;
using Erp.Server.Repository;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerOrderController : ControllerBase
    {
        private readonly ILogger<CustomerOrderController> logger;
        private readonly IUser iuser;
        private readonly ICustomerOrder icustomerOrder;
        private readonly IJwtAuthManager ijwtAuthManager;
        private readonly IGeneratePDF igeneratePDF;
        private readonly IConstantValue iconstantValue;
        private readonly INotificationService inotificationService;
        private readonly IConfiguration _configuration;
        private readonly DBContext _dbContext;

        public CustomerOrderController(ILogger<CustomerOrderController> _logger,
            IUser _iuser,ICustomerOrder _icustomerorder, IJwtAuthManager _ijwtAuthManager, IGeneratePDF _igeneratePDF, IConstantValue _iconstantValue, INotificationService _inotificationService, IConfiguration configuration, DBContext dbContext)
        {
            logger = _logger;
            iuser = _iuser;
            icustomerOrder = _icustomerorder;
            ijwtAuthManager = _ijwtAuthManager;
            igeneratePDF = _igeneratePDF;
            iconstantValue = _iconstantValue;
            inotificationService = _inotificationService;
            _configuration = configuration;
            _dbContext = dbContext;
        }
        [HttpPost("getCustomerOrders")]
        [Authorize]
        public List<CustomerOrder> getCustomerOrders([FromBody] RequestParams requestParms)
        {
            List<CustomerOrder> customerorders =new List<CustomerOrder>();
            customerorders = icustomerOrder.getCustomerOrders(requestParms);
            return customerorders;
        }

        [HttpPost("getCreatedShipments")]
        [Authorize]
        public List<CustomerOrder> getCreatedShipments([FromBody] RequestParams requestParms)
        {
            List<CustomerOrder> customerorders = new List<CustomerOrder>();
            customerorders = icustomerOrder.getCreatedShipments(requestParms);
            return customerorders;
        }

        [HttpPost("getOrdersForShipment")]
        [Authorize]
        public List<CustomerOrder> getOrdersForShipment([FromBody] RequestParams requestParms)
        {
            List<CustomerOrder> customerorders = new List<CustomerOrder>();
            customerorders = icustomerOrder.getOrdersForShipment(requestParms);
            return customerorders;
        }
        [HttpPost("deleteCustomerOrder")]
        [Authorize]
        public DbResult deleteCustomerOrder([FromBody] int id)
        {
            DbResult dbResult=new DbResult();
            dbResult = icustomerOrder.deleteCustomerOrder(id);
            return dbResult;
        }

        [HttpPost("getCustomerOrder")]
        [Authorize]
        public CustomerOrder getCustomerOrder([FromBody] int id)
        {
            CustomerOrder customerorder = new CustomerOrder();
            customerorder = icustomerOrder.getCustomerOrder(id);
            return customerorder;
        }
        [HttpPost("createOrUpdateCustomerOrder")]
        [Authorize]
        public async Task<DbResult> createOrUpdateCustomerOrder([FromBody] RequestParams requestParams)
        {
            DbResult dbResult = new DbResult();
            dbResult = icustomerOrder.createOrUpdateCustomerOrder(requestParams);
            
            try
            {
                logger.LogInformation($"createOrUpdateCustomerOrder finished. dbResult.id: {dbResult.id}, dbResult.message: {dbResult.message}, requestParams.id: {requestParams.id}");
                int orderId = requestParams.id;
                
                // If creating a new order, find the latest order ID for this user because the SP might always return 1
                if (orderId == 0)
                {
                    var myOrders = icustomerOrder.getMyOrders(new RequestParams { user = requestParams.user });
                    orderId = myOrders?.OrderByDescending(o => o.co_id).FirstOrDefault()?.co_id ?? dbResult.id;
                }
                
                if (orderId > 0 && (dbResult.message == "Success" || dbResult.message.Contains("successfully", StringComparison.OrdinalIgnoreCase)))
                {
                    if (requestParams.id == 0)
                    {
                        var newOrders = _dbContext.Set<CustomerOrder>()
                            .FromSqlRaw("EXEC dbo.getCustomerOrders @id=0, @user={0}, @completedYn=NULL, @startDate=NULL, @endDate=NULL, @status=0;", requestParams.user)
                            .AsEnumerable()
                            .Where(o => o.co_cre_by == requestParams.user && string.IsNullOrEmpty(o.co_waybill) && o.co_cre_date >= DateTime.Now.AddSeconds(-15))
                            .ToList();
                        if (newOrders.Any())
                        {
                            string waybillNumber = await GetUnusedWaybillAsync();
                            if (!string.IsNullOrEmpty(waybillNumber))
                            {
                                foreach (var orderLine in newOrders)
                                {
                                    orderLine.co_waybill = waybillNumber;
                                }

                                var wbEntity = _dbContext.Waybills.FirstOrDefault(w => w.wb_number == waybillNumber);
                                if (wbEntity != null)
                                {
                                    wbEntity.wb_status = "Used";
                                    wbEntity.wb_order_id = newOrders.First().co_id;
                                    wbEntity.wb_used_date = DateTime.Now;
                                }

                                await _dbContext.SaveChangesAsync();
                                logger.LogInformation($"Assigned waybill '{waybillNumber}' to {newOrders.Count} order lines.");
                            }
                        }
                    }

                    var order = icustomerOrder.getCustomerOrder(orderId);
                    
                    // ALWAYS take the email and phone from the User Profile, ignoring the order
                    var userProfile = iuser.getUser(requestParams.user);
                    string targetEmail = userProfile?.u_email ?? "";
                    string targetPhone = userProfile?.u_phone ?? "";
                    
                    logger.LogInformation($"Fetched order {orderId}. Target Email: '{targetEmail}', Target Phone: '{targetPhone}'");
                    
                    if (!string.IsNullOrEmpty(targetEmail) || !string.IsNullOrEmpty(targetPhone))
                    {
                        string frontendUrl = _configuration["FrontendUrl"]?.TrimEnd('/') ?? "http://localhost:4200";
                        string orderLink = $"{frontendUrl}/#/order-details/{order?.co_id}";
                        
                        // Build order items details
                        string itemsHtml = "<ul>";
                        string itemsText = "";
                        try 
                        {
                            if (!string.IsNullOrEmpty(requestParams.details))
                            {
                                var detailsArray = System.Text.Json.JsonDocument.Parse(requestParams.details).RootElement.EnumerateArray();
                                foreach (var item in detailsArray)
                                {
                                    if (item.TryGetProperty("c_product", out var prodProp) && item.TryGetProperty("c_qty", out var qtyProp))
                                    {
                                        int pId = prodProp.GetInt32();
                                        int qty = qtyProp.GetInt32();
                                        var prodIdParam = new Microsoft.Data.SqlClient.SqlParameter("id", pId);
                                        var prod = _dbContext.Set<Product>().FromSqlRaw("EXEC dbo.getProduct @id;", prodIdParam).AsEnumerable().FirstOrDefault();
                                        string pName = prod?.p_name ?? $"Product #{pId}";

                                        int colorId = 0;
                                        try { if (item.TryGetProperty("c_color", out var colorProp) && colorProp.ValueKind == System.Text.Json.JsonValueKind.Number) colorId = colorProp.GetInt32(); } catch {}
                                        
                                        string colorName = "";
                                        if (colorId > 0) {
                                            var color = _dbContext.ProdColors.FirstOrDefault(c => c.pc_color == colorId);
                                            colorName = color?.pc_color_name ?? "";
                                        }

                                        string sizeName = "";
                                        try { if (item.TryGetProperty("c_size_name", out var sizeNameProp) && sizeNameProp.ValueKind == System.Text.Json.JsonValueKind.String) sizeName = sizeNameProp.GetString() ?? ""; } catch {}
                                        
                                        if (string.IsNullOrEmpty(sizeName)) {
                                            int sizeId = 0;
                                            try { if (item.TryGetProperty("c_size", out var sizeIdProp) && sizeIdProp.ValueKind == System.Text.Json.JsonValueKind.Number) sizeId = sizeIdProp.GetInt32(); } catch {}
                                            if (sizeId > 0) {
                                                var size = _dbContext.ProdSizes.FirstOrDefault(s => s.ps_id == sizeId);
                                                sizeName = size?.ps_size_name ?? "";
                                            }
                                        }

                                        var extraDetails = new List<string>();
                                        if (!string.IsNullOrEmpty(sizeName)) extraDetails.Add($"Size: {sizeName}");
                                        if (!string.IsNullOrEmpty(colorName)) extraDetails.Add($"Color: {colorName}");
                                        string extraStr = extraDetails.Count > 0 ? $" ({string.Join(", ", extraDetails)})" : "";

                                        itemsHtml += $"<li>{qty}x {pName}{extraStr}</li>";
                                        itemsText += $"- {qty}x {pName}{extraStr}\n";
                                    }
                                }
                            }
                        } catch { }
                        itemsHtml += "</ul>";
                        
                        string subject = "Order Placed Successfully";
                        
                        if (!string.IsNullOrEmpty(targetEmail))
                        {
                            string emailBody = $"Dear {userProfile?.u_name ?? order?.co_customer_name},<br><br>" +
                                $"Your order <b>#{order?.co_id}</b> has been placed successfully on {DateTime.Now:dd MMM yyyy}.<br><br>" +
                                $"<b>Order Details:</b><br>{itemsHtml}<br>" +
                                $"<b>Total Amount:</b> ₹{order?.co_net_amount}<br><br>" +
                                $"<i>Your invoice will be generated and provided once the item is delivered.</i><br><br>" +
                                $"<a href='{orderLink}'>Click here to view your full order details</a><br><br>" +
                                $"<small>Please do not reply to this email, as this inbox is not monitored.</small>";
                            logger.LogInformation($"Sending order email to {targetEmail}");
                            await inotificationService.SendEmailAsync(targetEmail, subject, emailBody);
                        }
                            
                        if (!string.IsNullOrEmpty(targetPhone))
                        {
                            string whatsappBody = $"Dear {userProfile?.u_name ?? order?.co_customer_name},\n" +
                                $"Your order #{order?.co_id} has been placed successfully on {DateTime.Now:dd MMM yyyy}.\n\n" +
                                $"*Order Details:*\n{itemsText}\n" +
                                $"*Total Amount:* ₹{order?.co_net_amount}\n\n" +
                                $"_Your invoice will be generated once the item is delivered._\n\n" +
                                $"View your order details here: {orderLink}\n\n" +
                                $"_(Please do not reply to this message)_";
                            logger.LogInformation($"Sending order WhatsApp to {targetPhone}");
                            await inotificationService.SendWhatsAppAsync(targetPhone, whatsappBody);
                        }
                    }
                    else
                    {
                        logger.LogWarning($"Order {orderId} has no email or phone number attached! Skipping notifications.");
                    }
                }
                else
                {
                    logger.LogWarning($"Skipping notifications because orderId is {orderId} or message is '{dbResult.message}'");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error triggering notifications for createOrUpdateCustomerOrder.");
            }

            return dbResult;
        }

        


        [HttpPost("getMyOrders")]
        [Authorize]
        public List<CustomerOrder> getMyOrders([FromBody] RequestParams requestParms)
        {
            List<CustomerOrder> customerorders = new List<CustomerOrder>();
            customerorders = icustomerOrder.getMyOrders(requestParms);
            return customerorders;
        }

        [HttpPost("updateStatusForCustomerOrder")]
        [Authorize]
        public async Task<DbResult> updateStatusForCustomerOrder([FromBody] RequestParams requestParams)
        {
            DbResult dbResult = new DbResult();
            dbResult = icustomerOrder.updateStatusForCustomerOrder(requestParams);

            try
            {
                if (requestParams.id > 0 && (dbResult.message == "Success" || dbResult.message.Contains("successfully", StringComparison.OrdinalIgnoreCase)))
                {
                    var order = icustomerOrder.getCustomerOrder(requestParams.id);
                    
                    // ALWAYS take the email and phone from the User Profile, ignoring the order
                    var userProfile = iuser.getUser(requestParams.user);
                    string targetEmail = userProfile?.u_email ?? "";
                    string targetPhone = userProfile?.u_phone ?? "";
                    
                    if (!string.IsNullOrEmpty(targetEmail) || !string.IsNullOrEmpty(targetPhone))
                    {
                        string frontendUrl = _configuration["FrontendUrl"]?.TrimEnd('/') ?? "http://localhost:4200";
                        string orderLink = $"{frontendUrl}/#/order-details/{order?.co_id}";
                        string subject = "Order Status Updated";
                        
                        if (!string.IsNullOrEmpty(targetEmail))
                        {
                            string emailBody = $"Dear {userProfile?.u_name ?? order?.co_customer_name},<br><br>" +
                                $"Your order #{order?.co_id} status has been updated to: <b>{order?.co_status_name}</b>.<br><br>" +
                                $"<a href='{orderLink}'>Click here to view your order details</a><br><br>" +
                                $"<small>Please do not reply to this email, as this inbox is not monitored.</small>";
                            await inotificationService.SendEmailAsync(targetEmail, subject, emailBody);
                        }
                            
                        if (!string.IsNullOrEmpty(targetPhone))
                        {
                            string whatsappBody = $"Dear {userProfile?.u_name ?? order?.co_customer_name},\n" +
                                $"Your order #{order?.co_id} status has been updated to: {order?.co_status_name}.\n\n" +
                                $"View your order details here: {orderLink}\n\n" +
                                $"_(Please do not reply to this message)_";
                            await inotificationService.SendWhatsAppAsync(targetPhone, whatsappBody);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error triggering notifications for updateStatusForCustomerOrder.");
            }

            return dbResult;
        }

        [HttpGet("invoice/{id}")]
        public IActionResult Invoice(int id)
        {


            CustomerOrder order =icustomerOrder.getCustomerOrder(id);
            List<ConstantValue> constantValues = iconstantValue.getConstantValues();

            if (order == null) return NotFound();

            var pdf = igeneratePDF.Invoice(order, constantValues);

            return File(pdf, "application/pdf",$"Invoice_CO_{order.co_id}.pdf");
        }


        [HttpPost("cancelCustomerOrder")]
        [Authorize]
        public async Task<DbResult> cancelCustomerOrder([FromBody] RequestParams requestParams)
        {
            DbResult dbResult = new DbResult();

            // Fetch order prior to cancellation to get waybill and payment details
            var order = requestParams.id > 0 ? icustomerOrder.getCustomerOrder(requestParams.id) : null;

            dbResult = icustomerOrder.cancelCustomerOrder(requestParams);
            
            try
            {
                if (requestParams.id > 0 && (dbResult.message == "Success" || dbResult.message.Contains("successfully", StringComparison.OrdinalIgnoreCase)))
                {
                    // 1. Cancel Delhivery shipment if waybill exists
                    if (order != null && !string.IsNullOrWhiteSpace(order.co_waybill))
                    {
                        try
                        {
                            var baseUrl = _configuration["DelhiverySettings:BaseUrl"] ?? "https://staging-express.delhivery.com";
                            var token = _configuration["DelhiverySettings:Token"];
                            using var client = new HttpClient();
                            await DelhiveryController.CancelDelhiveryShipmentApi(client, baseUrl, token, order.co_waybill, logger);
                        }
                        catch (Exception exDel)
                        {
                            logger.LogError(exDel, $"Failed to cancel Delhivery shipment for order #{order.co_id}");
                        }
                    }

                    // 2. Check if order was Prepaid & not delivered -> Notify about automatic payback
                    bool isPrepaid = order != null && 
                                     !string.IsNullOrEmpty(order.co_payment_method_name) && 
                                     !order.co_payment_method_name.ToLower().Contains("cash") && 
                                     order.co_payment_method != 39;

                    var userProfile = iuser.getUser(requestParams.user);
                    string targetEmail = userProfile?.u_email ?? "";
                    string targetPhone = userProfile?.u_phone ?? "";
                    
                    if (!string.IsNullOrEmpty(targetEmail) || !string.IsNullOrEmpty(targetPhone))
                    {
                        string frontendUrl = _configuration["FrontendUrl"]?.TrimEnd('/') ?? "http://localhost:4200";
                        string orderLink = $"{frontendUrl}/#/order-details/{order?.co_id}";
                        string subject = "Order Cancelled Successfully";

                        string refundHtml = isPrepaid 
                            ? $" As your order was <b>Prepaid</b> (₹{order?.co_net_amount}), your refund has been automatically initiated and will be credited back to your original payment account."
                            : "";

                        string refundWaText = isPrepaid 
                            ? $" As your order was Prepaid (₹{order?.co_net_amount}), your refund has been automatically initiated to your original payment account."
                            : "";
                        
                        if (!string.IsNullOrEmpty(targetEmail))
                        {
                            string emailBody = $"Dear {userProfile?.u_name ?? order?.co_customer_name},<br><br>" +
                                $"Your order #{order?.co_id} has been successfully <b>Cancelled</b>.{refundHtml}<br><br>" +
                                $"<a href='{orderLink}'>Click here to view your order details</a><br><br>" +
                                $"<small>Please do not reply to this email, as this inbox is not monitored.</small>";
                            await inotificationService.SendEmailAsync(targetEmail, subject, emailBody);
                        }
                            
                        if (!string.IsNullOrEmpty(targetPhone))
                        {
                            string whatsappBody = $"Dear {userProfile?.u_name ?? order?.co_customer_name},\n" +
                                $"Your order #{order?.co_id} has been successfully Cancelled.{refundWaText}\n\n" +
                                $"View your order details here: {orderLink}\n\n" +
                                $"_(Please do not reply to this message)_";
                            await inotificationService.SendWhatsAppAsync(targetPhone, whatsappBody);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in post-cancellation operations.");
            }

            return dbResult;
        }

        private async Task<string> GetUnusedWaybillAsync()
        {
            var unusedWb = _dbContext.Waybills.FirstOrDefault(w => w.wb_status == "Unused");
            if (unusedWb != null)
            {
                return unusedWb.wb_number;
            }

            var baseUrl = _configuration["DelhiverySettings:BaseUrl"] ?? "https://staging-express.delhivery.com";
            var token = _configuration["DelhiverySettings:Token"];

            try
            {
                using var client = new HttpClient();
                client.Timeout = TimeSpan.FromSeconds(3); // 3-second timeout limit
                var clientName = _configuration["DelhiverySettings:ClientName"];
                var requestUri = $"{baseUrl.TrimEnd('/')}/waybill/api/bulk/json/?count=25&token={token}";
                if (!string.IsNullOrEmpty(clientName) && clientName != "YOUR_CLIENT_NAME")
                {
                    requestUri += $"&cl={clientName}";
                }
                var requestMsg = new HttpRequestMessage(HttpMethod.Get, requestUri);
                requestMsg.Headers.TryAddWithoutValidation("Authorization", $"Token {token}");
                requestMsg.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                requestMsg.Content = new StringContent("", System.Text.Encoding.UTF8, "application/json");

                var response = await client.SendAsync(requestMsg);
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var cleaned = responseContent.Replace("\"", "").Replace("[", "").Replace("]", "").Trim();
                    var fetchedList = cleaned.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                                             .Select(w => w.Trim())
                                             .Where(w => !string.IsNullOrEmpty(w))
                                             .ToList();

                    if (fetchedList.Any())
                    {
                        var waybillEntities = fetchedList.Select(w => new Waybill
                        {
                            wb_number = w,
                            wb_status = "Unused",
                            wb_created_date = DateTime.Now
                        }).ToList();

                        _dbContext.Waybills.AddRange(waybillEntities);
                        await _dbContext.SaveChangesAsync();

                        var firstWb = _dbContext.Waybills.FirstOrDefault(w => w.wb_number == fetchedList.First() && w.wb_status == "Unused");
                        return firstWb?.wb_number ?? fetchedList.First();
                    }
                }
                else
                {
                    var err = await response.Content.ReadAsStringAsync();
                    logger.LogError($"Failed to fetch waybills from Delhivery during checkout: {response.StatusCode} - {response.ReasonPhrase} - {err}");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching bulk waybills from Delhivery API during checkout.");
            }

            // Fallback: Generate a unique temporary fallback waybill so user checkout never fails
            string fallbackNumber = "PENDING-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
            try
            {
                var fallbackWb = new Waybill
                {
                    wb_number = fallbackNumber,
                    wb_status = "Unused",
                    wb_created_date = DateTime.Now
                };
                _dbContext.Waybills.Add(fallbackWb);
                await _dbContext.SaveChangesAsync();
                return fallbackNumber;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to save fallback waybill to database.");
                return fallbackNumber;
            }
        }
    }
}
