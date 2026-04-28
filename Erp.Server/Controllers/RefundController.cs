using Erp.Server.Models;
using Erp.Server.Services;
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
        private readonly IRefund _refund;

        public RefundController(IRefund refund)
        {
            _refund = refund;
        }

        [HttpPost("getRefundableOrders")]
        [Authorize]
        public IActionResult GetRefundableOrders(RequestParams requestParams)
        {
            try
            {
                var refundableOrders = _refund.GetRefundableOrders(requestParams);
                return Ok(refundableOrders);
            }
            catch (Exception ex)
            {
                return BadRequest("Error fetching refundable orders: " + ex.Message);
            }
        }

        [HttpPost("getCompletedRefunds")]
        [Authorize]
        public IActionResult GetCompletedRefunds(RequestParams requestParams)
        {
            try
            {
                var completedOrders = _refund.GetCompletedRefunds(requestParams);
                return Ok(completedOrders);
            }
            catch (Exception ex)
            {
                return BadRequest("Error fetching completed refunds: " + ex.Message);
            }
        }
    }
}
