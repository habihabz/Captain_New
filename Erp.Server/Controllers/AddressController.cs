using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddressController : ControllerBase
    {
        private readonly ILogger<AddressController> logger;
        private readonly IUser iuser;
        private readonly IAddress iaddress;

        public AddressController(ILogger<AddressController> _logger,IUser _iuser,IAddress _iaddress)
        {
            logger = _logger;
            iuser = _iuser;
            iaddress = _iaddress;

        }
        [HttpPost("getAddresses")]
        [Authorize]
        public List<Address> getAddresses(RequestParams requestParams)
        {
            List<Address> addresss =new List<Address>();
            addresss = iaddress.getAddresses(requestParams);
            return addresss;
        }
        [HttpPost("deleteAddress")]
        [Authorize]
        public DbResult deleteAddress([FromBody] int id)
        {
            DbResult dbResult=new DbResult();
            dbResult = iaddress.deleteAddress(id);
            return dbResult;
        }

        [HttpPost("getAddress")]
        [Authorize]
        public Address getAddress([FromBody] int id)
        {
            Address address = new Address();
            address = iaddress.getAddress(id);
            return address;
        }
        [HttpPost("createOrUpdateAddress")]
        [Authorize]
        public DbResult createOrUpdateAddress([FromBody] Address address)
        {
            DbResult dbResult = new DbResult();
            dbResult = iaddress.createOrUpdateAddress(address);
            return dbResult;
        }
        [HttpPost("getMyAddresses")]
        [Authorize]
        public List<Address> getMyAddresses(RequestParams requestParams)
        {
            List<Address> addresss = new List<Address>();
            addresss = iaddress.getMyAddresses(requestParams);
            return addresss;
        }
    }
}
