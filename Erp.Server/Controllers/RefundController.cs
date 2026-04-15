using Erp.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RefundController : ControllerBase
    {
        private readonly DBContext _db;

        public RefundController(DBContext db)
        {
            _db = db;
        }

        [HttpPost("getRefundableOrders")]
        [Authorize]
        public IActionResult GetRefundableOrders()
        {
            try
            {
                
                var refundableOrders = _db.Set<CustomerOrder>().FromSqlRaw("EXEC dbo.getRefundableOrders").ToList();
                return Ok(refundableOrders);
            }
            catch (Exception ex)
            {
                return BadRequest("Error fetching refundable orders: " + ex.Message);
            }
        }

        [HttpPost("getCompletedRefunds")]
        [Authorize]
        public IActionResult GetCompletedRefunds()
        {
            try
            {
                var completedOrders = _db.Set<CustomerOrder>().FromSqlRaw("EXEC dbo.getCompletedRefunds").ToList();
                return Ok(completedOrders);
            }
            catch (Exception ex)
            {
                return BadRequest("Error fetching completed refunds: " + ex.Message);
            }
        }
    }
}
