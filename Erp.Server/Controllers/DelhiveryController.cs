using Erp.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Net.Http.Headers;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DelhiveryController : ControllerBase
    {
        private readonly ILogger<DelhiveryController> _logger;
        private readonly IConfiguration _config;
        private readonly DBContext _db;

        public DelhiveryController(ILogger<DelhiveryController> logger, IConfiguration config, DBContext db)
        {
            _logger = logger;
            _config = config;
            _db = db;
        }

        [HttpGet("checkPincodeServiceability/{pincode}")]
        public async Task<DbResult> checkPincodeServiceability(string pincode)
        {
            DbResult dbResult = new DbResult();
            try
            {
                var baseUrl = _config["DelhiverySettings:BaseUrl"];
                var token = _config["DelhiverySettings:Token"];

                if (string.IsNullOrEmpty(baseUrl) || string.IsNullOrEmpty(token))
                {
                    dbResult.message = "Delhivery configuration missing.";
                    return dbResult;
                }

                using (var client = new HttpClient())
                {
                    var requestUrl = $"{baseUrl.TrimEnd('/')}/c/api/pin-codes/json/?filter_codes={pincode}";
                    client.DefaultRequestHeaders.Clear();
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Token {token}");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    
                    var response = await client.GetAsync(requestUrl);
                    if (response.IsSuccessStatusCode)
                    {
                        var jsonString = await response.Content.ReadAsStringAsync();
                        using (JsonDocument doc = JsonDocument.Parse(jsonString))
                        {
                            var root = doc.RootElement;
                            if (root.TryGetProperty("delivery_codes", out JsonElement deliveryCodes) && deliveryCodes.GetArrayLength() > 0)
                            {
                                dbResult.message = "Success";
                            }
                            else
                            {
                                dbResult.message = "Pincode is not serviceable.";
                            }
                        }
                    }
                    else
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        var debugInfo = new { StatusCode = response.StatusCode, ReasonPhrase = response.ReasonPhrase, Content = errorContent };
                        dbResult.message = "Failed to verify pincode. Please try again later. " + System.Text.Json.JsonSerializer.Serialize(debugInfo);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking pincode serviceability");
                dbResult.message = "Error checking pincode serviceability: " + ex.Message + " | StackTrace: " + ex.StackTrace;
            }

            return dbResult;
        }

        [HttpGet("calculateShippingCost/{userId}")]
        public async Task<IActionResult> CalculateShippingCost(int userId)
        {
            try
            {
                var countryParam = new SqlParameter("country", "0");
                var userParam = new SqlParameter("user", userId.ToString());
                var cartItems = _db.Cart.FromSqlRaw("EXEC dbo.getCarts @country,@user;", countryParam, userParam).ToList();
                
                if (!cartItems.Any())
                {
                    return Ok(new { success = true, cost = 0.0, message = "success" });
                }

                var addresses = _db.Address.FromSqlRaw("EXEC dbo.getMyAddresses {0};", userId).ToList();

                var defaultAddress = addresses.FirstOrDefault(ad => ad.ad_is_default_yn != null && ad.ad_is_default_yn.ToUpper() == "Y")
                                     ?? addresses.FirstOrDefault();
                
                if (defaultAddress == null || !defaultAddress.ad_pincode.HasValue)
                {
                    var fallbackDb = _db.ConstantValues.FirstOrDefault(cv => cv.cv_name == "Delivery Charge");
                    double fallbackCost = 100.0;
                    if (fallbackDb != null && double.TryParse(fallbackDb.cv_value, out double dbCost))
                    {
                        fallbackCost = dbCost;
                    }
                    return Ok(new { success = false, cost = fallbackCost, message = "No address found. Using default delivery charge." });
                }

                string destinationPincode = defaultAddress.ad_pincode.Value.ToString();

                double totalWeightInGrams = 0;
                double maxLength = 0;
                double maxBreadth = 0;
                double maxHeight = 0;
                string lpkgType = "box";

                foreach (var item in cartItems)
                {
                    double itemWeight = 500; // default 500g
                    if (item.c_product.HasValue)
                    {
                        var product = _db.Products.FromSqlRaw("EXEC dbo.getProductByCountry {0}, {1};", item.c_product.Value, 0).ToList().FirstOrDefault();
                        if (product != null && product.p_packaging_type.HasValue && product.p_packaging_type.Value > 0)
                        {
                            var pt = _db.PackagingTypes.FromSqlRaw("EXEC dbo.getPackagingType {0};", product.p_packaging_type.Value).ToList().FirstOrDefault();
                            if (pt != null)
                            {
                                 if (pt.pt_weight > 0)
                                 {
                                     itemWeight = pt.pt_weight;
                                 }
                                 else
                                 {
                                     double volWeight = (pt.pt_length * pt.pt_breadth * pt.pt_height) / 5.0;
                                     if (volWeight > 0)
                                     {
                                         itemWeight = volWeight;
                                     }
                                 }

                                // Keep max dimensions of items in cart
                                if (pt.pt_length > maxLength) maxLength = pt.pt_length;
                                if (pt.pt_breadth > maxBreadth) maxBreadth = pt.pt_breadth;
                                if (pt.pt_height > maxHeight) maxHeight = pt.pt_height;
                                if (!string.IsNullOrEmpty(pt.pt_pkg_type))
                                {
                                    lpkgType = pt.pt_pkg_type;
                                }
                            }
                        }
                    }
                    totalWeightInGrams += itemWeight * (item.c_qty ?? 1);
                }

                var baseUrl = _config["DelhiverySettings:BaseUrl"] ?? "https://staging-express.delhivery.com";
                var token = _config["DelhiverySettings:Token"];
                var originPin = _config["DelhiverySettings:OriginPincode"] ?? "110042";
                var billingMode = _config["DelhiverySettings:DefaultBillingMode"] ?? "E";

                using (var client = new HttpClient())
                {
                    var requestUrl = $"{baseUrl.TrimEnd('/')}/api/kinko/v1/invoice/charges/.json?md={billingMode}&cgm={Math.Round(totalWeightInGrams)}&ss=Delivered&o_pin={originPin}&d_pin={destinationPincode}&pt=Pre-paid";
                    
                    if (maxLength > 0) requestUrl += $"&l={Math.Round(maxLength)}";
                    if (maxBreadth > 0) requestUrl += $"&b={Math.Round(maxBreadth)}";
                    if (maxHeight > 0) requestUrl += $"&h={Math.Round(maxHeight)}";
                    if (!string.IsNullOrEmpty(lpkgType)) requestUrl += $"&lpkg_type={lpkgType.ToLower()}";

                    client.DefaultRequestHeaders.Clear();
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Token {token}");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var response = await client.GetAsync(requestUrl);
                  
                    if (response.IsSuccessStatusCode)
                    {
                        var jsonString = await response.Content.ReadAsStringAsync();
                        using (JsonDocument doc = JsonDocument.Parse(jsonString))
                        {
                            Trace.WriteLine(JsonSerializer.Serialize(jsonString));
                            var root = doc.RootElement;
                            double totalAmount = 0;
                            bool isSuccessfullyParsed = false;
                            if (TryFindTotalAmount(root, out double foundAmount) && foundAmount > 0)
                            {
                                totalAmount = foundAmount;
                                isSuccessfullyParsed = true;
                            }
                            else
                            {
                                var fallbackDb = _db.ConstantValues.FirstOrDefault(cv => cv.cv_name == "Delivery Charge");
                                if (fallbackDb != null && double.TryParse(fallbackDb.cv_value, out double dbCost))
                                {
                                    totalAmount = dbCost;
                                }
                                else
                                {
                                    totalAmount = 100.0;
                                }
                            }

                            string? expectedDeliveryDate = null;
                            try
                            {
                                var pickupDate = GetExpectedPickupDate(DateTime.Now, 2);
                                var expectedPickupDate = pickupDate.ToString("yyyy-MM-dd HH:mm");
                                var tatRequestUrl = $"{baseUrl.TrimEnd('/')}/api/dc/expected_tat/?origin_pin={originPin}&destination_pin={destinationPincode}&mot={billingMode}&pdt=B2C&expected_pickup_date={Uri.EscapeDataString(expectedPickupDate)}";
                                
                                var tatRequest = new HttpRequestMessage(HttpMethod.Get, tatRequestUrl);
                                tatRequest.Headers.TryAddWithoutValidation("Authorization", $"Token {token}");
                                tatRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                                
                                var tatResponse = await client.SendAsync(tatRequest);
                                if (tatResponse.IsSuccessStatusCode)
                                {
                                    var tatJson = await tatResponse.Content.ReadAsStringAsync();
                                    using (JsonDocument tatDoc = JsonDocument.Parse(tatJson))
                                    {
                                        var tatRoot = tatDoc.RootElement;
                                        if (tatRoot.TryGetProperty("data", out JsonElement tatData))
                                        {
                                            string? eddStr = null;
                                            if (tatData.TryGetProperty("expected_delivery_date", out JsonElement eddVal) && eddVal.ValueKind == JsonValueKind.String)
                                            {
                                                eddStr = eddVal.GetString();
                                            }
                                            
                                            if (!string.IsNullOrEmpty(eddStr) && DateTime.TryParse(eddStr, out DateTime parsedDate))
                                            {
                                                expectedDeliveryDate = parsedDate.ToString("ddd, MMM dd");
                                            }
                                            else if (tatData.TryGetProperty("tat", out JsonElement tatVal))
                                            {
                                                int tatDays = 0;
                                                if (tatVal.ValueKind == JsonValueKind.Number && tatVal.TryGetInt32(out int daysNum))
                                                {
                                                    tatDays = daysNum;
                                                }
                                                else if (tatVal.ValueKind == JsonValueKind.String && int.TryParse(tatVal.GetString(), out int daysStr))
                                                {
                                                    tatDays = daysStr;
                                                }
                                                
                                                if (tatDays > 0)
                                                {
                                                    var deliveryDate = pickupDate.AddDays(tatDays);
                                                    expectedDeliveryDate = deliveryDate.ToString("ddd, MMM dd");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Error fetching expected TAT from Delhivery API");
                            }

                            if (isSuccessfullyParsed)
                            {
                                return Ok(new { success = true, cost = totalAmount, expectedDeliveryDate = expectedDeliveryDate, message = "success" });
                            }
                            else
                            {
                                return Ok(new { success = false, cost = totalAmount, expectedDeliveryDate = expectedDeliveryDate, message = "Failed to parse delivery charge from Delhivery. Using default charge." });
                            }
                        }
                    }
                    else
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        _logger.LogError($"Delhivery API error: {response.StatusCode} - {response.ReasonPhrase} - {errorContent}");
                        
                        var fallbackDb = _db.ConstantValues.FirstOrDefault(cv => cv.cv_name == "Delivery Charge");
                        double fallbackCost = 100.0;
                        if (fallbackDb != null && double.TryParse(fallbackDb.cv_value, out double dbCost))
                        {
                            fallbackCost = dbCost;
                        }
                        
                        return Ok(new { success = false, cost = fallbackCost, expectedDeliveryDate = (string?)null, message = "Failed to fetch delivery charge from Delhivery. Using default charge." });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating shipping cost via Delhivery");
                
                var fallbackDb = _db.ConstantValues.FirstOrDefault(cv => cv.cv_name == "Delivery Charge");
                double fallbackCost = 100.0;
                if (fallbackDb != null && double.TryParse(fallbackDb.cv_value, out double dbCost))
                {
                    fallbackCost = dbCost;
                }
                
                return Ok(new { success = false, cost = fallbackCost, message = "Error: " + ex.Message + ". Using default charge." });
            }
        }

        [HttpGet("waybills")]
        public async Task<ActionResult<List<Waybill>>> GetWaybills()
        {
            var waybills = _db.Waybills.OrderByDescending(w => w.wb_id).ToList();
            return Ok(waybills);
        }

        [HttpGet("warehouses")]
        public async Task<ActionResult<List<DelhiveryWarehouse>>> GetWarehouses()
        {
            try
            {
                var list = _db.DelhiveryWarehouses.OrderByDescending(w => w.dw_id).ToList();
                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Delhivery warehouses");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("warehouses")]
        public async Task<IActionResult> CreateWarehouse([FromBody] DelhiveryWarehouse warehouse)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _db.DelhiveryWarehouses.Add(warehouse);
                await _db.SaveChangesAsync();

                // Automatically try to register with Delhivery (isEdit = false)
                var (isRegistered, errorMsg) = await RegisterWarehouseWithDelhivery(warehouse, false);
                warehouse.dw_registered_yn = isRegistered ? "Y" : "N";
                _db.Entry(warehouse).State = EntityState.Modified;
                await _db.SaveChangesAsync();

                return Ok(warehouse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Delhivery warehouse");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("warehouses/{id}")]
        public async Task<IActionResult> UpdateWarehouse(int id, [FromBody] DelhiveryWarehouse warehouse)
        {
            if (id != warehouse.dw_id)
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existing = _db.DelhiveryWarehouses.FirstOrDefault(w => w.dw_id == id);
                if (existing == null)
                {
                    return NotFound();
                }

                bool wasRegistered = existing.dw_registered_yn == "Y";

                existing.dw_name = warehouse.dw_name;
                existing.dw_address = warehouse.dw_address;
                existing.dw_city = warehouse.dw_city;
                existing.dw_state = warehouse.dw_state;
                existing.dw_country = warehouse.dw_country;
                existing.dw_pincode = warehouse.dw_pincode;
                existing.dw_phone = warehouse.dw_phone;
                existing.dw_email = warehouse.dw_email;

                _db.Entry(existing).State = EntityState.Modified;
                await _db.SaveChangesAsync();

                // If not registered yet or if details changed, try registering (using wasRegistered to route to edit/create)
                var (isRegistered, errorMsg) = await RegisterWarehouseWithDelhivery(existing, wasRegistered);
                existing.dw_registered_yn = isRegistered ? "Y" : "N";
                _db.Entry(existing).State = EntityState.Modified;
                await _db.SaveChangesAsync();

                return Ok(existing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Delhivery warehouse");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpDelete("warehouses/{id}")]
        public async Task<IActionResult> DeleteWarehouse(int id)
        {
            try
            {
                var existing = _db.DelhiveryWarehouses.FirstOrDefault(w => w.dw_id == id);
                if (existing == null)
                {
                    return NotFound();
                }

                _db.DelhiveryWarehouses.Remove(existing);
                await _db.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting Delhivery warehouse");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("warehouses/register/{id}")]
        public async Task<IActionResult> RegisterWarehouse(int id)
        {
            try
            {
                var existing = _db.DelhiveryWarehouses.FirstOrDefault(w => w.dw_id == id);
                if (existing == null)
                {
                    return NotFound();
                }

                bool wasRegistered = existing.dw_registered_yn == "Y";

                var (isRegistered, errorMsg) = await RegisterWarehouseWithDelhivery(existing, wasRegistered);
                existing.dw_registered_yn = isRegistered ? "Y" : "N";
                _db.Entry(existing).State = EntityState.Modified;
                await _db.SaveChangesAsync();

                if (isRegistered)
                {
                    return Ok(new { success = true, message = "Registered successfully with Delhivery." });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Failed to register with Delhivery: " + errorMsg });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering Delhivery warehouse");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        private async Task<(bool success, string message)> RegisterWarehouseWithDelhivery(DelhiveryWarehouse warehouse, bool isEdit = false)
        {
            try
            {
                var baseUrl = _config["DelhiverySettings:BaseUrl"] ?? "https://staging-express.delhivery.com";
                var token = _config["DelhiverySettings:Token"];

                if (string.IsNullOrEmpty(baseUrl) || string.IsNullOrEmpty(token))
                {
                    return (false, "Delhivery API credentials not configured in settings.");
                }

                using (var client = new HttpClient())
                {
                    var endpoint = isEdit ? "edit" : "create";
                    var requestUrl = $"{baseUrl.TrimEnd('/')}/api/backend/clientwarehouse/{endpoint}/";
                    
                    client.DefaultRequestHeaders.Clear();
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Token {token}");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var warehouseData = new
                    {
                        name = warehouse.dw_name,
                        address = warehouse.dw_address,
                        city = warehouse.dw_city,
                        state = warehouse.dw_state,
                        country = warehouse.dw_country,
                        pin = warehouse.dw_pincode,
                        phone = warehouse.dw_phone,
                        email = warehouse.dw_email,
                        registered_name = _config["DelhiverySettings:ClientName"] ?? "YOUR_CLIENT_NAME",
                        contact_person = warehouse.dw_name,
                        return_address = warehouse.dw_address,
                        return_pin = warehouse.dw_pincode
                    };

                    var jsonString = System.Text.Json.JsonSerializer.Serialize(warehouseData);
                    var requestContent = new StringContent(jsonString, System.Text.Encoding.UTF8, "application/json");
                    
                    var response = await client.PostAsync(requestUrl, requestContent);
                    var responseContent = await response.Content.ReadAsStringAsync();

                    if (response.IsSuccessStatusCode)
                    {
                        using (JsonDocument doc = JsonDocument.Parse(responseContent))
                        {
                            var root = doc.RootElement;
                            if (root.TryGetProperty("success", out JsonElement successProp))
                            {
                                if (successProp.ValueKind == JsonValueKind.True || 
                                    (successProp.ValueKind == JsonValueKind.String && successProp.GetString()?.ToLower() == "true"))
                                {
                                    return (true, "Success");
                                }
                            }
                            
                            string errorMsg = "API returned success as false.";
                            if (root.TryGetProperty("error", out JsonElement errProp))
                            {
                                if (errProp.ValueKind == JsonValueKind.Array)
                                {
                                    var errList = new List<string>();
                                    foreach (var errItem in errProp.EnumerateArray())
                                    {
                                        errList.Add(errItem.ValueKind == JsonValueKind.String ? (errItem.GetString() ?? "") : errItem.GetRawText());
                                    }
                                    errorMsg = string.Join("; ", errList);
                                }
                                else if (errProp.ValueKind == JsonValueKind.String)
                                {
                                    errorMsg = errProp.GetString() ?? errorMsg;
                                }
                                else
                                {
                                    errorMsg = errProp.GetRawText();
                                }
                            }
                            else if (root.TryGetProperty("message", out JsonElement msgProp))
                            {
                                if (msgProp.ValueKind == JsonValueKind.String)
                                {
                                    errorMsg = msgProp.GetString() ?? errorMsg;
                                }
                                else
                                {
                                    errorMsg = msgProp.GetRawText();
                                }
                            }
                            return (false, errorMsg);
                        }
                    }
                    else
                    {
                        _logger.LogError($"Delhivery warehouse creation error: {response.StatusCode} - {response.ReasonPhrase} - {responseContent}");
                        return (false, $"Delhivery returned {(int)response.StatusCode} ({response.ReasonPhrase}). Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering warehouse with Delhivery");
                return (false, "Connection error: " + ex.Message);
            }
        }

        [HttpPost("pickup-request")]
        public async Task<IActionResult> CreatePickupRequest([FromBody] DelhiveryPickupRequest requestData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var baseUrl = _config["DelhiverySettings:BaseUrl"] ?? "https://staging-express.delhivery.com";
                var token = _config["DelhiverySettings:Token"];

                if (string.IsNullOrEmpty(baseUrl) || string.IsNullOrEmpty(token))
                {
                    return BadRequest(new { success = false, message = "Delhivery API credentials not configured in settings." });
                }

                using (var client = new HttpClient())
                {
                    var requestUrl = $"{baseUrl.TrimEnd('/')}/fm/request/new/";
                    
                    client.DefaultRequestHeaders.Clear();
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Token {token}");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Only send required fields to Delhivery
                    var payload = new
                    {
                        pickup_time = requestData.pickup_time,
                        pickup_date = requestData.pickup_date,
                        pickup_location = requestData.pickup_location != null ? requestData.pickup_location.Trim() : "",
                        expected_package_count = requestData.expected_package_count
                    };

                    var jsonString = System.Text.Json.JsonSerializer.Serialize(payload);
                    var requestContent = new StringContent(jsonString, System.Text.Encoding.UTF8, "application/json");

                    var response = await client.PostAsync(requestUrl, requestContent);
                    var responseContent = await response.Content.ReadAsStringAsync();

                    bool isSuccess = false;
                    string message = "";
                    string? pickupId = null;

                    try
                    {
                        using (JsonDocument doc = JsonDocument.Parse(responseContent))
                        {
                            var root = doc.RootElement;
                            
                            isSuccess = response.IsSuccessStatusCode;
                            if (root.TryGetProperty("success", out JsonElement successProp))
                            {
                                isSuccess = successProp.ValueKind == JsonValueKind.True || 
                                            (successProp.ValueKind == JsonValueKind.String && successProp.GetString()?.ToLower() == "true");
                            }

                            if (root.TryGetProperty("message", out JsonElement msgProp))
                            {
                                if (msgProp.ValueKind == JsonValueKind.String)
                                {
                                    message = msgProp.GetString() ?? message;
                                }
                                else
                                {
                                    message = msgProp.GetRawText();
                                }
                            }

                            if (root.TryGetProperty("pickup_id", out JsonElement pickupIdProp))
                            {
                                if (pickupIdProp.ValueKind == JsonValueKind.Number)
                                {
                                    pickupId = pickupIdProp.GetInt64().ToString();
                                }
                                else if (pickupIdProp.ValueKind == JsonValueKind.String)
                                {
                                    pickupId = pickupIdProp.GetString();
                                }
                            }

                            if (!isSuccess && root.TryGetProperty("error", out JsonElement errProp))
                            {
                                if (errProp.ValueKind == JsonValueKind.Array)
                                {
                                    var errList = new List<string>();
                                    foreach (var errItem in errProp.EnumerateArray())
                                    {
                                        errList.Add(errItem.ValueKind == JsonValueKind.String ? (errItem.GetString() ?? "") : errItem.GetRawText());
                                    }
                                    message = string.Join("; ", errList);
                                }
                                else if (errProp.ValueKind == JsonValueKind.String)
                                {
                                    message = errProp.GetString() ?? message;
                                }
                                else
                                {
                                    message = errProp.GetRawText();
                                }
                            }
                        }
                    }
                    catch (Exception)
                    {
                        isSuccess = response.IsSuccessStatusCode;
                        message = responseContent;
                    }

                    if (string.IsNullOrEmpty(message))
                    {
                        message = isSuccess ? "Pickup request created successfully." : $"Delhivery returned status {(int)response.StatusCode}";
                    }

                    if (!isSuccess)
                    {
                        _logger.LogError($"Delhivery pickup request error: {response.StatusCode} - {response.ReasonPhrase} - {responseContent}");
                    }

                    if (isSuccess)
                    {
                        // Save history record
                        var historyEntry = new DelhiveryPickupRequestHistory
                        {
                            dpr_location = requestData.pickup_location != null ? requestData.pickup_location.Trim() : "",
                            dpr_date = DateTime.Parse(requestData.pickup_date),
                            dpr_time = requestData.pickup_time,
                            dpr_package_count = requestData.expected_package_count,
                            dpr_status = "Success",
                            dpr_response = responseContent,
                            dpr_pickup_id = pickupId,
                            dpr_cre_by = requestData.cre_by,
                            dpr_cre_date = DateTime.Now
                        };

                        _db.DelhiveryPickupRequests.Add(historyEntry);
                        await _db.SaveChangesAsync();

                        return Ok(new { success = true, message = message, data = responseContent });
                    }
                    else
                    {
                        return BadRequest(new { success = false, message = message, data = responseContent });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Delhivery pickup request");
                return StatusCode(500, new { success = false, message = "Internal server error: " + ex.Message });
            }
        }

        [HttpGet("pickup-requests")]
        public async Task<IActionResult> GetPickupRequestsHistory()
        {
            try
            {
                var historyList = await (from p in _db.DelhiveryPickupRequests
                                         join u in _db.Users on p.dpr_cre_by equals u.u_id into userJoin
                                         from uj in userJoin.DefaultIfEmpty()
                                         orderby p.dpr_cre_date descending
                                         select new DelhiveryPickupRequestHistory
                                         {
                                             dpr_id = p.dpr_id,
                                             dpr_location = p.dpr_location,
                                             dpr_date = p.dpr_date,
                                             dpr_time = p.dpr_time,
                                             dpr_package_count = p.dpr_package_count,
                                             dpr_status = p.dpr_status,
                                             dpr_response = p.dpr_response,
                                             dpr_pickup_id = p.dpr_pickup_id,
                                             dpr_cre_by = p.dpr_cre_by,
                                             dpr_cre_date = p.dpr_cre_date,
                                             dpr_cre_by_name = (uj != null && uj.u_name != null) ? uj.u_name : "System"
                                         }).ToListAsync();

                return Ok(historyList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching Delhivery pickup requests history");
                return StatusCode(500, new { success = false, message = "Internal server error: " + ex.Message });
            }
        }

        [HttpPost("fetchWaybills")]
        public async Task<IActionResult> FetchWaybills([FromBody] int count)
        {
            if (count <= 0 || count > 100) count = 25;

            var baseUrl = _config["DelhiverySettings:BaseUrl"] ?? "https://staging-express.delhivery.com";
            var token = _config["DelhiverySettings:Token"];

            try
            {
                using var client = new HttpClient();
                var clientName = _config["DelhiverySettings:ClientName"];
                var requestUri = $"{baseUrl.TrimEnd('/')}/waybill/api/bulk/json/?count={count}&token={token}";
                if (!string.IsNullOrEmpty(clientName) && clientName != "YOUR_CLIENT_NAME")
                {
                    requestUri += $"&cl={clientName}";
                }
                var requestMsg = new HttpRequestMessage(HttpMethod.Get, requestUri);
                requestMsg.Headers.TryAddWithoutValidation("Authorization", $"Token {token}");
                requestMsg.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
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

                        _db.Waybills.AddRange(waybillEntities);
                        await _db.SaveChangesAsync();

                        return Ok(new { success = true, message = $"Successfully fetched and saved {fetchedList.Count} waybills." });
                    }
                    
                    return Ok(new { success = false, message = "Delhivery returned no waybills." });
                }
                else
                {
                    var err = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Failed to fetch waybills from Delhivery: {response.StatusCode} - {response.ReasonPhrase} - {err}");
                    return BadRequest(new { success = false, message = $"Delhivery error: {response.ReasonPhrase} - {err}" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching bulk waybills from Delhivery API.");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private bool TryFindTotalAmount(JsonElement element, out double amount)
        {
            amount = 0;
            if (element.ValueKind == JsonValueKind.Object)
            {
                foreach (var property in element.EnumerateObject())
                {
                    var name = property.Name.ToLower();
                    if (name == "total_amount")
                    {
                        if (property.Value.ValueKind == JsonValueKind.Number && property.Value.TryGetDouble(out double val))
                        {
                            amount = val;
                            return true;
                        }
                        if (property.Value.ValueKind == JsonValueKind.String && double.TryParse(property.Value.GetString(), out double parsedVal))
                        {
                            amount = parsedVal;
                            return true;
                        }
                    }
                    if (TryFindTotalAmount(property.Value, out double nestedVal))
                    {
                        amount = nestedVal;
                        return true;
                    }
                }
            }
            else if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    if (TryFindTotalAmount(item, out double arrayVal))
                    {
                        amount = arrayVal;
                        return true;
                    }
                }
            }
            return false;
        }

        private DateTime GetExpectedPickupDate(DateTime startDate, int daysToAdd)
        {
            DateTime pickupDate = startDate;
            int addedDays = 0;
            while (addedDays < daysToAdd)
            {
                pickupDate = pickupDate.AddDays(3);
                if (pickupDate.DayOfWeek != DayOfWeek.Sunday)
                {
                    addedDays++;
                }
            }
            return pickupDate;
        }
        [HttpPost("create-shipment")]
        public async Task<IActionResult> CreateShipment([FromBody] DelhiveryCreateShipmentRequest requestData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var orderIdParam = new Microsoft.Data.SqlClient.SqlParameter("id", requestData.order_id);
                var order = _db.Set<CustomerOrder>()
                               .FromSqlRaw("EXEC dbo.getCustomerOrder @id;", orderIdParam)
                               .AsNoTracking()
                               .AsEnumerable()
                               .FirstOrDefault();

                if (order == null)
                {
                    return BadRequest(new { success = false, message = "Order not found." });
                }

                if (!string.IsNullOrEmpty(order.co_waybill))
                {
                    return BadRequest(new { success = false, message = $"Order already has waybill {order.co_waybill} assigned." });
                }

                var unusedWaybill = await _db.Waybills.AsNoTracking().FirstOrDefaultAsync(w => w.wb_status == "Unused");
                if (unusedWaybill == null)
                {
                    return BadRequest(new { success = false, message = "No unused waybills available. Please fetch bulk waybills first." });
                }

                string pin = "";
                string addressText = order.co_c_address_details ?? "";
                string phone = order.co_customer_phone ?? "";
                string name = order.co_customer_name ?? "";
                string city = "";
                string state = "";

                if (order.co_c_address.HasValue)
                {
                    var addrIdParam = new Microsoft.Data.SqlClient.SqlParameter("id", order.co_c_address.Value);
                    var addr = _db.Set<Address>()
                                  .FromSqlRaw("EXEC dbo.getAddress @id;", addrIdParam)
                                  .AsEnumerable()
                                  .FirstOrDefault();
                    if (addr != null)
                    {
                        pin = addr.ad_pincode?.ToString() ?? "";
                        addressText = addr.ad_address ?? addressText;
                        phone = addr.ad_phone ?? phone;
                        name = addr.ad_name ?? name;
                    }
                }

                if (string.IsNullOrEmpty(pin) && !string.IsNullOrEmpty(addressText))
                {
                    var match = System.Text.RegularExpressions.Regex.Match(addressText, @"\b\d{6}\b");
                    if (match.Success)
                    {
                        pin = match.Value;
                    }
                }

                if (string.IsNullOrEmpty(pin) || pin.Length < 6)
                {
                    return BadRequest(new { success = false, message = "Valid 6-digit destination pincode is required. Please check order address." });
                }

                var baseUrl = _config["DelhiverySettings:BaseUrl"] ?? "https://staging-express.delhivery.com";
                var token = _config["DelhiverySettings:Token"];

                if (string.IsNullOrEmpty(baseUrl) || string.IsNullOrEmpty(token))
                {
                    return BadRequest(new { success = false, message = "Delhivery API credentials not configured in settings." });
                }

                using (var client = new HttpClient())
                {
                    var requestUrl = $"{baseUrl.TrimEnd('/')}/api/cmu/create.json";
                    client.DefaultRequestHeaders.Clear();
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Token {token}");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var payload = new
                    {
                        pickup_location = new { name = requestData.pickup_location.Trim() },
                        shipments = new[]
                        {
                            new
                            {
                                order = order.co_id.ToString(),
                                weight = requestData.weight.ToString(),
                                pin = pin,
                                products_desc = order.co_product_name ?? "Items",
                                add = addressText,
                                city = city,
                                state = state,
                                waybill = unusedWaybill.wb_number,
                                phone = phone,
                                payment_mode = requestData.payment_mode,
                                name = name,
                                total_amount = order.co_net_amount?.ToString() ?? "0",
                                cod_amount = requestData.payment_mode == "COD" ? (order.co_net_amount?.ToString() ?? "0") : "0",
                                quantity = order.co_qty?.ToString() ?? "1",
                                country = "India"
                            }
                        }
                    };

                    var jsonString = System.Text.Json.JsonSerializer.Serialize(payload);
                    var postParams = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("format", "json"),
                        new KeyValuePair<string, string>("data", jsonString)
                    };
                    var requestContent = new FormUrlEncodedContent(postParams);

                    var response = await client.PostAsync(requestUrl, requestContent);
                    var responseContent = await response.Content.ReadAsStringAsync();

                    bool isSuccess = false;
                    string message = "";
                    string? waybillNumber = null;

                    try
                    {
                        using (JsonDocument doc = JsonDocument.Parse(responseContent))
                        {
                            var root = doc.RootElement;
                            isSuccess = response.IsSuccessStatusCode;
                            if (root.TryGetProperty("success", out JsonElement successProp))
                            {
                                isSuccess = successProp.ValueKind == JsonValueKind.True || 
                                            (successProp.ValueKind == JsonValueKind.String && successProp.GetString()?.ToLower() == "true");
                            }

                            if (root.TryGetProperty("rmk", out JsonElement rmkProp) && rmkProp.ValueKind == JsonValueKind.String)
                            {
                                message = rmkProp.GetString() ?? "";
                            }

                            if (root.TryGetProperty("packages", out JsonElement pkgsProp) && pkgsProp.ValueKind == JsonValueKind.Array)
                            {
                                var pkgRemarks = new List<string>();
                                foreach (var pkg in pkgsProp.EnumerateArray())
                                {
                                    if (pkg.TryGetProperty("waybill", out JsonElement wbProp) && wbProp.ValueKind == JsonValueKind.String)
                                    {
                                        waybillNumber = wbProp.GetString();
                                    }
                                    if (pkg.TryGetProperty("remarks", out JsonElement rmkArray) && rmkArray.ValueKind == JsonValueKind.Array)
                                    {
                                        foreach (var r in rmkArray.EnumerateArray())
                                        {
                                            var rText = r.ValueKind == JsonValueKind.String ? r.GetString() : r.GetRawText();
                                            if (!string.IsNullOrEmpty(rText)) pkgRemarks.Add(rText);
                                        }
                                    }
                                    if (pkg.TryGetProperty("status", out JsonElement stProp) && stProp.ValueKind == JsonValueKind.String)
                                    {
                                        if (string.Equals(stProp.GetString(), "Success", StringComparison.OrdinalIgnoreCase))
                                        {
                                            isSuccess = true;
                                        }
                                    }
                                }
                                if (pkgRemarks.Any())
                                {
                                    message = string.Join("; ", pkgRemarks);
                                }
                            }

                            if (!isSuccess && root.TryGetProperty("error", out JsonElement errProp))
                            {
                                if (errProp.ValueKind == JsonValueKind.Array)
                                {
                                    var errList = new List<string>();
                                    foreach (var errItem in errProp.EnumerateArray())
                                    {
                                        errList.Add(errItem.ValueKind == JsonValueKind.String ? (errItem.GetString() ?? "") : errItem.GetRawText());
                                    }
                                    message = string.Join("; ", errList);
                                }
                                else if (errProp.ValueKind == JsonValueKind.String)
                                {
                                    message = errProp.GetString() ?? message;
                                }
                                else
                                {
                                    message = errProp.GetRawText();
                                }
                            }
                        }
                    }
                    catch (Exception)
                    {
                        isSuccess = response.IsSuccessStatusCode;
                        message = "Delhivery API returned an invalid response.";
                    }

                    if (string.IsNullOrEmpty(message))
                    {
                        message = isSuccess ? "Shipment created successfully." : $"Delhivery error status {(int)response.StatusCode}";
                    }

                    if (isSuccess || message.Contains("Duplicate waybill", StringComparison.OrdinalIgnoreCase) || responseContent.Contains("Duplicate waybill", StringComparison.OrdinalIgnoreCase))
                    {
                        // 1. Mark waybill as used via stored procedure and check DbResult model
                        var wbRes = (await _db.Set<DbResult>().FromSqlRaw("EXEC dbo.updateWaybillStatus @p0, @p1, @p2;", unusedWaybill.wb_number, "Used", order.co_id).ToListAsync()).FirstOrDefault() ?? new DbResult();
                        if (!string.Equals(wbRes.message, "Success", StringComparison.OrdinalIgnoreCase) && !wbRes.message.Contains("success", StringComparison.OrdinalIgnoreCase))
                        {
                            return BadRequest(new { success = false, message = $"Waybill update error: {wbRes.message}" });
                        }

                        // 2. Update order via stored procedure and check DbResult model
                        var ordRes = (await _db.Set<DbResult>().FromSqlRaw("EXEC dbo.updateCustomerOrderWaybill @p0, @p1, @p2;", order.co_id, unusedWaybill.wb_number, 2).ToListAsync()).FirstOrDefault() ?? new DbResult();
                        if (!string.Equals(ordRes.message, "Success", StringComparison.OrdinalIgnoreCase) && !ordRes.message.Contains("success", StringComparison.OrdinalIgnoreCase))
                        {
                            return BadRequest(new { success = false, message = $"Order update error: {ordRes.message}" });
                        }

                        // 3. Write Order movement history via stored procedure and check DbResult model
                        var histRes = (await _db.Set<DbResult>().FromSqlRaw("EXEC dbo.createOrUpdateOrderMovementHistory @p0, @p1, @p2, @p3;", 0, order.co_id, 2, requestData.cre_by).ToListAsync()).FirstOrDefault() ?? new DbResult();
                        if (!string.Equals(histRes.message, "Success", StringComparison.OrdinalIgnoreCase) && !histRes.message.Contains("success", StringComparison.OrdinalIgnoreCase))
                        {
                            return BadRequest(new { success = false, message = $"Movement history error: {histRes.message}" });
                        }

                        string successMsg = isSuccess
                            ? $"Shipment manifested successfully with Waybill: {unusedWaybill.wb_number}"
                            : $"Recovered manifested shipment with Waybill: {unusedWaybill.wb_number}";

                        return Ok(new { success = true, message = successMsg, waybill = unusedWaybill.wb_number });
                    }
                    else
                    {
                        _logger.LogError($"Delhivery shipment creation failed: {response.StatusCode} - {responseContent}");
                        return BadRequest(new { success = false, message = message });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error manifesting shipment with Delhivery API.");
                return StatusCode(500, new { success = false, message = "Internal server error: " + ex.Message });
            }
        }

        [HttpGet("calculate-order-weight/{orderId}")]
        public async Task<IActionResult> CalculateOrderWeight(int orderId)
        {
            try
            {
                var orderIdParam = new Microsoft.Data.SqlClient.SqlParameter("id", orderId);
                var order = _db.Set<CustomerOrder>()
                               .FromSqlRaw("EXEC dbo.getCustomerOrder @id;", orderIdParam)
                               .AsNoTracking()
                               .AsEnumerable()
                               .FirstOrDefault();

                if (order == null)
                {
                    return NotFound(new { success = false, message = "Order not found." });
                }

                double weight = 100; // default 100g fallback
                if (order.co_product.HasValue)
                {
                    var product = await _db.Products.FirstOrDefaultAsync(p => p.p_id == order.co_product.Value);
                    if (product != null && product.p_packaging_type.HasValue)
                    {
                        var pt = await _db.PackagingTypes.FirstOrDefaultAsync(p => p.pt_id == product.p_packaging_type.Value);
                        if (pt != null)
                        {
                            weight = pt.pt_weight;
                        }
                    }
                }

                // Multiply weight by quantity
                int qty = order.co_qty ?? 1;
                double totalWeight = weight * qty;

                return Ok(new { success = true, weight = totalWeight });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating order packaging weight.");
                return StatusCode(500, new { success = false, message = "Internal server error: " + ex.Message });
            }
        }
    }

    public class DelhiveryPickupRequest
    {
        public string pickup_time { get; set; } = string.Empty;
        public string pickup_date { get; set; } = string.Empty;
        public string pickup_location { get; set; } = string.Empty;
        public int expected_package_count { get; set; } = 1;
        public int cre_by { get; set; }
    }

    public class DelhiveryCreateShipmentRequest
    {
        public int order_id { get; set; }
        public string pickup_location { get; set; } = string.Empty;
        public string payment_mode { get; set; } = "Prepaid";
        public double weight { get; set; } = 100;
        public int cre_by { get; set; }
    }
}
