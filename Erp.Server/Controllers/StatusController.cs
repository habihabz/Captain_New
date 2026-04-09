using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        private readonly ILogger<StatusController> logger;
        private readonly IUser iuser;
        private readonly IStatus istatus;

        public StatusController(ILogger<StatusController> _logger, IUser _iuser, IStatus _istatus)
        {
            logger = _logger;
            iuser = _iuser;
            istatus = _istatus;
        }

        [HttpPost("getStatuses")]
        [Authorize]
        public List<Status> GetStatuses([FromBody] int workflow)
        {
            return istatus.GetStatuses(workflow);
        }

        [HttpPost("deleteStatus")]
        [Authorize]
        public DbResult DeleteStatus([FromBody] int id)
        {
            return istatus.DeleteStatus(id);
        }

        [HttpPost("getStatus")]
        [Authorize]
        public Status GetStatus([FromBody] int id)
        {
            return istatus.GetStatus(id);
        }

        [HttpPost("createOrUpdateStatus")]
        [Authorize]
        public DbResult CreateOrUpdateStatus([FromBody] Status status)
        {
            return istatus.CreateOrUpdateStatus(status);
        }
    }
}
