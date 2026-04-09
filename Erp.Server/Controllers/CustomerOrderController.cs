using Erp.Server.Models;
using Erp.Server.Repository;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerOrderController : ControllerBase
    {
        private readonly ILogger<CustomerOrderController> logger;
        private readonly IUser iuser;
        private readonly ICustomer icustomer;
        private readonly ICustomerOrder icustomerOrder;
        private readonly IJwtAuthManager ijwtAuthManager;
        private readonly IGeneratePDF igeneratePDF;
        private readonly IConstantValue iconstantValue;

        public CustomerOrderController(ILogger<CustomerOrderController> _logger,
            IUser _iuser,ICustomerOrder _icustomerorder, IJwtAuthManager _ijwtAuthManager, ICustomer _icustomer,IGeneratePDF _igeneratePDF, IConstantValue _iconstantValue)
        {
            logger = _logger;
            iuser = _iuser;
            icustomerOrder = _icustomerorder;
            ijwtAuthManager = _ijwtAuthManager;
            icustomer = _icustomer;
            igeneratePDF = _igeneratePDF;
            iconstantValue = _iconstantValue;

        }
        [HttpPost("getCustomerOrders")]
        [Authorize]
        public List<CustomerOrder> getCustomerOrders([FromBody] RequestParams requestParms)
        {
            List<CustomerOrder> customerorders =new List<CustomerOrder>();
            customerorders = icustomerOrder.getCustomerOrders(requestParms);
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
        public DbResult createOrUpdateCustomerOrder([FromBody] RequestParams requestParams)
        {
            DbResult dbResult = new DbResult();
            dbResult = icustomerOrder.createOrUpdateCustomerOrder(requestParams);
            return dbResult;
        }

        
        [HttpPost("getCustomerOrderDetails")]
        [Authorize]
        public List<CustomerOrderDetail> getCustomerOrderDetails([FromBody] int id)
        {
            List<CustomerOrderDetail> customerOrderDetails = new List<CustomerOrderDetail>();
            customerOrderDetails = icustomerOrder.getCustomerOrderDetails(id);
            return customerOrderDetails;
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
        public DbResult updateStatusForCustomerOrder([FromBody] RequestParams requestParams)
        {
            DbResult dbResult = new DbResult();
            dbResult = icustomerOrder.updateStatusForCustomerOrder(requestParams);
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
        public DbResult cancelCustomerOrder([FromBody] RequestParams requestParams)
        {
            DbResult dbResult = new DbResult();
            dbResult = icustomerOrder.cancelCustomerOrder(requestParams);
            return dbResult;
        }
    }
}
