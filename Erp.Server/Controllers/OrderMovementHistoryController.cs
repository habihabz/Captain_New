using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderMovementHistoryController : ControllerBase
    {
        private readonly ILogger<OrderMovementHistoryController> logger;
        private readonly IUser iuser;
        private readonly IOrderMovementHistory ihistory;

        public OrderMovementHistoryController(
            ILogger<OrderMovementHistoryController> _logger,
            IUser _iuser,
            IOrderMovementHistory _ihistory)
        {
            logger = _logger;
            iuser = _iuser;
            ihistory = _ihistory;
        }

        [HttpPost("getOrderMovementHistories")]
        [Authorize]
        public List<OrderMovementHistory> getOrderMovementHistories()
        {
            return ihistory.getOrderMovementHistories();
        }

        [HttpPost("getOrderMovementHistoriesByOrder")]
        [Authorize]
        public List<OrderMovementHistory> getOrderMovementHistoriesByOrder([FromBody] int orderNo)
        {
            return ihistory.getOrderMovementHistoriesByOrder(orderNo);
        }

        [HttpPost("getOrderMovementHistoriesByReturn")]
        [Authorize]
        public List<OrderMovementHistory> getOrderMovementHistoriesByReturn([FromBody] int returnNo)
        {
            return ihistory.getOrderMovementHistoriesByReturn(returnNo);
        }

        [HttpPost("getOrderMovementHistory")]
        [Authorize]
        public OrderMovementHistory getOrderMovementHistory([FromBody] int id)
        {
            return ihistory.getOrderMovementHistory(id);
        }

        [HttpPost("deleteOrderMovementHistory")]
        [Authorize]
        public DbResult deleteOrderMovementHistory([FromBody] int id)
        {
            return ihistory.deleteOrderMovementHistory(id);
        }

        [HttpPost("createOrUpdateOrderMovementHistory")]
        [Authorize]
        public DbResult createOrUpdateOrderMovementHistory([FromBody] OrderMovementHistory history)
        {
            return ihistory.createOrUpdateOrderMovementHistory(history);
        }
    }
}