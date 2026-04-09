using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IReturnOrder
    {
        DbResult raiseReturnRequest(ReturnOrder returnOrder);
        DbResult updateReturnStatus(ReturnOrder returnOrder);
        List<ReturnOrder> getReturnRequests(RequestParams requestParams);
        ReturnOrder getReturnRequestById(int id);
    }
}
