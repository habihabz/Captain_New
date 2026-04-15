using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IPromocode
    {
        DbResult CreateOrUpdatePromocode(Promocode promocode);
        DbResult DeletePromocode(int id);
        Promocode GetPromocode(int id);
        Promocode GetPromocodeByCode(string code);
        List<Promocode> GetPromocodes(RequestParams requestParams);
    }
}
