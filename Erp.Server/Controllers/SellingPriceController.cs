using Erp.Server.Models;
using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SellingPriceController : ControllerBase
    {
        private readonly ILogger<SellingPriceController> logger;
        private readonly IUser iuser;
        private readonly ISellingPrice isellingprice;

        public SellingPriceController(ILogger<SellingPriceController> _logger,IUser _iuser,ISellingPrice _isellingprice)
        {
            logger = _logger;
            iuser = _iuser;
            isellingprice = _isellingprice;

        }
        [HttpPost("getSellingPrices")]
        [Authorize]
        public List<SellingPrice> getSellingPrices(SellingPrice sellingPrice)
        {
            List<SellingPrice> sellingprices =new List<SellingPrice>();
            sellingprices = isellingprice.getSellingPrices(sellingPrice);
            return sellingprices;
        }
        [HttpPost("deleteSellingPrice")]
        [Authorize]
        public DbResult deleteSellingPrice([FromBody] int id)
        {
            DbResult dbResult=new DbResult();
            dbResult = isellingprice.deleteSellingPrice(id);
            return dbResult;
        }

        [HttpPost("getSellingPrice")]
        [Authorize]
        public SellingPrice getSellingPrice([FromBody] int id)
        {
            SellingPrice sellingprice = new SellingPrice();
            sellingprice = isellingprice.getSellingPrice(id);
            return sellingprice;
        }
        [HttpPost("changePrice")]
        [Authorize]
        public DbResult changePrice([FromBody] SellingPrice sellingprice)
        {
            DbResult dbResult = new DbResult();
            dbResult = isellingprice.changePrice(sellingprice);
            return dbResult;
        }


    }
}
