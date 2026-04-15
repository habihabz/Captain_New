using Erp.Server.Models;
using Erp.Server.Repository;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ILogger<CustomerController> logger;
        private readonly IUser iuser;
        private readonly ICustomer icustomer;
        private readonly IJwtAuthManager ijwtAuthManager;
        private readonly ILogin ilogin;

        public CustomerController(ILogger<CustomerController> _logger, IUser _iuser, ICustomer _icustomer, IJwtAuthManager _ijwtAuthManager, ILogin _ilogin)
        {
            logger = _logger;
            iuser = _iuser;
            icustomer = _icustomer;
            ijwtAuthManager = _ijwtAuthManager;
            ilogin = _ilogin;

        }
        [HttpPost("getCustomers")]
        [Authorize]
        public IEnumerable<Customer> getCustomers()
        {
            IEnumerable<Customer> customers = Enumerable.Empty<Customer>();
            customers = icustomer.getCustomers();
            return customers;
        }
        [HttpPost("deleteCustomer")]
        [Authorize]
        public DbResult deleteCustomer([FromBody] int id)
        {
            DbResult dbResult = new DbResult();
            dbResult = icustomer.deleteCustomer(id);
            return dbResult;
        }

        [HttpPost("getCustomer")]
        [Authorize]
        public Customer getCustomer([FromBody] int id)
        {
            Customer customer = new Customer();
            customer = icustomer.getCustomer(id);
            return customer;
        }
        [HttpPost("createOrUpdateCustomer")]
        [Authorize]
        public DbResult createOrUpdateCustomer([FromBody] Customer customer)
        {
            DbResult dbResult = new DbResult();
            dbResult = icustomer.createOrUpdateCustomer(customer);
            return dbResult;
        }

        [HttpPost("registerCustomer")]
        public DbResult registerCustomer([FromBody] Customer customer)
        {
            DbResult dbResult = new DbResult();
            dbResult = icustomer.registerCustomer(customer);
            return dbResult;
        }

        [HttpPost("getCustomerLogin")]
        public ActionResult<CustomerCredentials> getCustomerLogin([FromBody] Login Login)
        {
            if (string.IsNullOrEmpty(Login.username) || string.IsNullOrEmpty(Login.password))
            {
                return BadRequest(new CustomerCredentials { message = "Please Enter All Data !!" });
            }

            try
            {
                // 1. Try Customer Login
                var dbResult = icustomer.getCustomerLogin(Login.username, Login.password);
                if (dbResult.message == "Success")
                {
                    Customer customer = icustomer.getCustomerByUsername(Login.username);
                    customer.c_password = "";
                    var token = ijwtAuthManager.GenerateToken(Login.username);
                    var credentials = new CustomerCredentials
                    {
                        username = Login.username,
                        token = token,
                        message = dbResult.message,
                        customer = customer

                    };
                    return Ok(credentials);
                }
                
                // 2. Fallback to Admin/User Login if Customer not found
                var adminLoginResult = ilogin.getlogin(Login.username, Login.password);
                if (adminLoginResult.message == "Success")
                {
                    User user = iuser.getUserByUsername(Login.username);
                    
                    // Map User to a Customer-like object for the Flutter app
                    Customer tempCustomer = new Customer
                    {
                        c_id = user.u_id,
                        c_name = user.u_name,
                        c_username = user.u_username,
                        c_email = user.u_email,
                        c_phone = user.u_phone ?? ""
                    };
                    
                    var token = ijwtAuthManager.GenerateToken(Login.username);
                    return Ok(new CustomerCredentials
                    {
                        username = Login.username,
                        token = token,
                        message = "Success",
                        customer = tempCustomer
                    });
                }

                return Unauthorized(new CustomerCredentials { username = Login.username, message = dbResult.message, customer = null });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Credentials { message = "An error occurred while processing the request." });
            }
        }

        [HttpPost("updatePassword")]
        [Authorize]
        public DbResult updatePassword([FromBody] PasswordUpdateRequest request)
        {
            DbResult dbResult = new DbResult();
            dbResult = icustomer.updatePassword(request.userId, request.newPassword);
            return dbResult;
        }

    }

    public class PasswordUpdateRequest
    {
        public int userId { get; set; }
        public string newPassword { get; set; }
    }
}
