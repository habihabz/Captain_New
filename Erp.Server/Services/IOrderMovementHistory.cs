using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IOrderMovementHistory
    {
        DbResult createOrUpdateOrderMovementHistory(OrderMovementHistory history);
        DbResult deleteOrderMovementHistory(int id);
        OrderMovementHistory getOrderMovementHistory(int id);
        List<OrderMovementHistory> getOrderMovementHistories();
        List<OrderMovementHistory> getOrderMovementHistoriesByOrder(int orderNo);
    }
}