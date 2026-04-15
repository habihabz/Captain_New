using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromocodeController : ControllerBase
    {
        private readonly IPromocode _promocode;

        public PromocodeController(IPromocode promocode)
        {
            _promocode = promocode;
        }

        [HttpPost("getPromocodes")]
        public List<Promocode> GetPromocodes([FromBody] RequestParams requestParams)
        {
            return _promocode.GetPromocodes(requestParams);
        }

        [HttpPost("getPromocode")]
        public Promocode GetPromocode([FromBody] int id)
        {
            return _promocode.GetPromocode(id);
        }

        [HttpPost("getPromocodeByCode")]
        public Promocode GetPromocodeByCode([FromBody] string code)
        {
            return _promocode.GetPromocodeByCode(code);
        }

        [HttpPost("createOrUpdatePromocode")]
        [Authorize]
        public DbResult CreateOrUpdatePromocode([FromBody] Promocode promocode)
        {
            return _promocode.CreateOrUpdatePromocode(promocode);
        }

        [HttpPost("deletePromocode")]
        [Authorize]
        public DbResult DeletePromocode([FromBody] int id)
        {
            return _promocode.DeletePromocode(id);
        }

        [HttpPost("validatePromocode")]
        public DbResult ValidatePromocode([FromBody] string code)
        {
            var pc = _promocode.GetPromocodeByCode(code);
            if (pc == null)
            {
                return new DbResult { message = "Invalid promo code" };
            }

            if (pc.pc_active_yn != "Y")
            {
                return new DbResult { message = "Promo code is inactive" };
            }

            if (pc.pc_expiry_date.HasValue && pc.pc_expiry_date.Value < DateTime.Now)
            {
                return new DbResult { message = "Promo code has expired" };
            }

            return new DbResult { message = "Success" };
        }
    }
}
