using Erp.Server.Models;
using System.Collections.Generic;

namespace Erp.Server.Services
{
    public interface IRefund
    {
        List<CustomerOrder> GetRefundableOrders(RequestParams requestParams);
        List<CustomerOrder> GetCompletedRefunds(RequestParams requestParams);
    }
}
