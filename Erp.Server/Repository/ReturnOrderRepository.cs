using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Erp.Server.Repository
{
    public class ReturnOrderRepository : IReturnOrder
    {
        private DBContext db;
        public ReturnOrderRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult raiseReturnRequest(ReturnOrder returnOrder)
        {
            var _order_no = new SqlParameter("order_no", returnOrder.ro_order_no + "");
            var _reason = new SqlParameter("reason", returnOrder.ro_reason ?? "");
            var _comments = new SqlParameter("comments", returnOrder.ro_comments ?? "");
            var _bank = new SqlParameter("bank", returnOrder.ro_bank_name ?? "");
            var _account = new SqlParameter("account", returnOrder.ro_account_no ?? "");
            var _ifsc = new SqlParameter("ifsc", returnOrder.ro_ifsc_code ?? "");
            var _cre_by = new SqlParameter("cre_by", returnOrder.ro_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.raiseReturnRequest @order_no, @reason, @comments, @bank, @account, @ifsc, @cre_by;", 
                _order_no, _reason, _comments, _bank, _account, _ifsc, _cre_by).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult updateReturnStatus(ReturnOrder returnOrder)
        {
            var _id = new SqlParameter("id", returnOrder.ro_id + "");
            var _status = new SqlParameter("status", returnOrder.ro_status + "");
            var _user = new SqlParameter("user", returnOrder.ro_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.updateReturnStatus @id, @status, @user;", 
                _id, _status, _user).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public List<ReturnOrder> getReturnRequests(RequestParams requestParams)
        {
            var _id = new SqlParameter("id", requestParams.id + "");
            var _user = new SqlParameter("user", requestParams.user + "");
            var _status = new SqlParameter("status", requestParams.status + "");

            var returnOrders = db.Set<ReturnOrder>().FromSqlRaw("EXEC dbo.getReturnRequests @id, @user, @status;", 
                _id, _user, _status).ToList();
            return returnOrders;
        }

        public ReturnOrder getReturnRequestById(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var returnOrder = db.Set<ReturnOrder>().FromSqlRaw("EXEC dbo.getReturnRequestById @id;", 
                _id).ToList().FirstOrDefault() ?? new ReturnOrder();
            return returnOrder;
        }
    }
}
