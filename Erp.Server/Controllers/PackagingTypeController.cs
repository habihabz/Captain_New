using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackagingTypeController : ControllerBase
    {
        private readonly IPackagingType _packagingTypeService;

        public PackagingTypeController(IPackagingType packagingTypeService)
        {
            _packagingTypeService = packagingTypeService;
        }

        [HttpGet("getPackagingTypes")]
        public List<PackagingType> GetPackagingTypes()
        {
            return _packagingTypeService.GetPackagingTypes();
        }

        [HttpGet("getPackagingType/{id}")]
        public PackagingType GetPackagingType(int id)
        {
            return _packagingTypeService.GetPackagingType(id);
        }

        [HttpPost("createOrUpdatePackagingType")]
        [Authorize]
        public DbResult CreateOrUpdatePackagingType([FromBody] PackagingType packagingType)
        {
            return _packagingTypeService.CreateOrUpdatePackagingType(packagingType);
        }

        [HttpDelete("deletePackagingType/{id}")]
        [Authorize]
        public DbResult DeletePackagingType(int id)
        {
            return _packagingTypeService.DeletePackagingType(id);
        }
    }
}
