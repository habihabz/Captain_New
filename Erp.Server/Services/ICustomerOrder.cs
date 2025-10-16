using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface ICustomerOrder
    {
        DbResult createOrUpdateCustomerOrder(RequestParams requestParams);
        DbResult deleteCustomerOrder(int id);
        CustomerOrder getCustomerOrder(int id);
        List<CustomerOrderDetail> getCustomerOrderDetails(int id);
        List<CustomerOrder> getCustomerOrders(RequestParams requestParms);
        List<CustomerOrder> getMyOrders(RequestParams requestParms);
    }
}
