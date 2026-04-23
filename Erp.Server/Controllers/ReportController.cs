using Erp.Server.Models;
using Erp.Server.Repository;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Converters;
using System.Data;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly ILogger<ReportController> logger;
        private readonly IUser iuser;
        private readonly IRole irole;
        private readonly IReport ireport;

        public ReportController(ILogger<ReportController> _logger,IUser _iuser,IRole _irole, IReport _ireport)
        {
            logger = _logger;
            iuser = _iuser;
            irole = _irole;
            ireport = _ireport;

        }
 

        [HttpPost("getOrderReport")]
        [Authorize]
        public ActionResult getOrderReport([FromBody] ReportParms reportParms)
        {
            DataTableConvert dataTableConvert = new DataTableConvert();
            DataTable vatReport = ireport.getOrderReport(reportParms);
            var list = dataTableConvert.ConvertDataTableToList(vatReport);

            return Ok(list);
        }

        [HttpPost("getDashboardStats")]
        public ActionResult getDashboardStats()
        {
            var stats = ireport.getDashboardStats();
            return Ok(stats);
        }

    }
}
