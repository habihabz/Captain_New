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

        public ReturnOrderController(IReturnOrder _ireturnOrder)
        {
            ireturnOrder = _ireturnOrder;
        }

        [HttpPost("raiseReturnRequest")]
        [Authorize]
        public DbResult raiseReturnRequest([FromBody] ReturnOrder returnOrder)
        {
            return ireturnOrder.raiseReturnRequest(returnOrder);
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
