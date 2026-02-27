using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConstantValueController : ControllerBase
    {
        private readonly ILogger<ConstantValue> logger;
        private readonly IConstantValue iconstants;

        public ConstantValueController(ILogger<ConstantValue> _logger, IConstantValue _iconstants)
        {
            logger = _logger;
            iconstants = _iconstants;
        }

        [HttpPost("getConstantValues")]
        public List<ConstantValue> getConstantValues()
        {
            return iconstants.getConstantValues();
        }

        [HttpPost("getConstantValue")]
        public ConstantValue getConstantValue([FromBody] int id)
        {
            return iconstants.getConstantValue(id);
        }

        [HttpPost("deleteConstantValue")]
        [Authorize]
        public DbResult deleteConstantValue([FromBody] int id)
        {
            return iconstants.deleteConstantValue(id);
        }

        [HttpPost("createOrUpdateConstantValue")]
        [Authorize]
        public DbResult createOrUpdateConstantValue([FromBody] ConstantValue constant)
        {
            return iconstants.createOrUpdateConstantValue(constant);
        }

        
        [HttpPost("getConstantValueByName")]
        public ConstantValue getConstantValueByName([FromBody] RequestParams requestParams)
        {
            return iconstants.getConstantValueByName(requestParams);
        }
    }
}