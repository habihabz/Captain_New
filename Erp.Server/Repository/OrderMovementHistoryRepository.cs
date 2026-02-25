using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Erp.Server.Repository
{
    public class OrderMovementHistoryRepository : IOrderMovementHistory
    {
        private readonly DBContext db;

        public OrderMovementHistoryRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult createOrUpdateOrderMovementHistory(OrderMovementHistory history)
        {
            var omh_id = new SqlParameter("omh_id", history.omh_id + "");
            var omh_order_no = new SqlParameter("omh_order_no", history.omh_order_no + "");
            var omh_status = new SqlParameter("omh_status", history.omh_status + "");
            var omh_cre_by = new SqlParameter("omh_cre_by", history.omh_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.createOrUpdateOrderMovementHistory @omh_id, @omh_order_no, @omh_status, @omh_cre_by;",
                omh_id, omh_order_no, omh_status, omh_cre_by
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public DbResult deleteOrderMovementHistory(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.deleteOrderMovementHistory @id;",
                _id
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public OrderMovementHistory getOrderMovementHistory(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var history = db.Set<OrderMovementHistory>().FromSqlRaw(
                "EXEC dbo.getOrderMovementHistory @id;",
                _id
            ).ToList().FirstOrDefault() ?? new OrderMovementHistory();

            return history;
        }

        public List<OrderMovementHistory> getOrderMovementHistories()
        {
            var list = db.Set<OrderMovementHistory>().FromSqlRaw(
                "EXEC dbo.getOrderMovementHistories;"
            ).ToList();

            return list;
        }

        public List<OrderMovementHistory> getOrderMovementHistoriesByOrder(int orderNo)
        {
            var _orderNo = new SqlParameter("orderNo", orderNo + "");

            var list = db.Set<OrderMovementHistory>().FromSqlRaw(
                "EXEC dbo.getOrderMovementHistoriesByOrder @orderNo;",
                _orderNo
            ).ToList();

            return list;
        }
    }
}