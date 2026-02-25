using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IFavourite
    {
        DbResult createOrUpdateFavourite(Favourite favourite);
        DbResult deleteFavourite(int id);
        Favourite getFavourite(int id);
        List<Favourite> getFavourites(RequestParams requestParams);
    }
}