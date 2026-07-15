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
                    var requestUrl = $"{baseUrl}{pincode}";
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
                dbResult.message = "Error checking pincode serviceability.";
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
                                double volWeight = (pt.pt_length * pt.pt_breadth * pt.pt_height) / 5.0;
                                if (volWeight > 0)
                                {
                                    itemWeight = volWeight;
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

                var token = _config["DelhiverySettings:Token"];
                var originPin = _config["DelhiverySettings:OriginPincode"] ?? "110042";
                var shippingUrl = _config["DelhiverySettings:ShippingCostUrl"] ?? "https://track.delhivery.com/api/kinko/v1/invoice/charges/.json";
                var billingMode = _config["DelhiverySettings:DefaultBillingMode"] ?? "E";

                using (var client = new HttpClient())
                {
                    var requestUrl = $"{shippingUrl}?md={billingMode}&cgm={Math.Round(totalWeightInGrams)}&ss=Delivered&o_pin={originPin}&d_pin={destinationPincode}&pt=Pre-paid";
                    
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
                            if (TryFindTotalAmount(root, out double foundAmount))
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

                            if (isSuccessfullyParsed)
                            {
                                return Ok(new { success = true, cost = totalAmount, message = "success" });
                            }
                            else
                            {
                                return Ok(new { success = false, cost = totalAmount, message = "Failed to parse delivery charge from Delhivery. Using default charge." });
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
                        
                        return Ok(new { success = false, cost = fallbackCost, message = "Failed to fetch delivery charge from Delhivery. Using default charge." });
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

        [HttpPost("fetchWaybills")]
        public async Task<IActionResult> FetchWaybills([FromBody] int count)
        {
            if (count <= 0 || count > 100) count = 25;

            var token = _config["DelhiverySettings:Token"];
            var fetchUrl = _config["DelhiverySettings:FetchWaybillUrl"] ?? "https://staging-express.delhivery.com/waybill/api/bulk/json/";

            try
            {
                using (var client = new HttpClient())
                {
                    var requestUri = $"{fetchUrl.TrimEnd('/')}/?count={count}";
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
    }
}
