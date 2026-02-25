using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavouriteController : ControllerBase
    {
        private readonly ILogger<FavouriteController> logger;
        private readonly IUser iuser;
        private readonly IFavourite ifavourite;

        public FavouriteController(
            ILogger<FavouriteController> _logger,
            IUser _iuser,
            IFavourite _ifavourite)
        {
            logger = _logger;
            iuser = _iuser;
            ifavourite = _ifavourite;
        }

        // ✅ Get favourites
        [HttpPost("getFavourites")]
        [Authorize]
        public List<Favourite> getFavourites(RequestParams requestParams)
        {
            return ifavourite.getFavourites(requestParams);
        }

        // ✅ Delete favourite
        [HttpPost("deleteFavourite")]
        [Authorize]
        public DbResult deleteFavourite([FromBody] int id)
        {
            return ifavourite.deleteFavourite(id);
        }

        // ✅ Get single favourite
        [HttpPost("getFavourite")]
        [Authorize]
        public Favourite getFavourite([FromBody] int id)
        {
            return ifavourite.getFavourite(id);
        }

        // ✅ Create / Update favourite
        [HttpPost("createOrUpdateFavourite")]
        [Authorize]
        public DbResult createOrUpdateFavourite([FromBody] Favourite favourite)
        {
            return ifavourite.createOrUpdateFavourite(favourite);
        }
    }
}