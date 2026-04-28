using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;


namespace Erp.Server.Repository
{
    public class CustomerOrderRepository : ICustomerOrder
    {
        private DBContext db;
        public CustomerOrderRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult cancelCustomerOrder(RequestParams requestParams)
        {
            var _id = new SqlParameter("id", requestParams.id + "");
            var _user = new SqlParameter("user", requestParams.user + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.cancelCustomerOrder @id,@user;", _id,_user).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult createOrUpdateCustomerOrder(RequestParams requestParams)
        {
            var user = new SqlParameter("user", requestParams.user + "");
            var details = new SqlParameter("details", requestParams.details + "");
            var promo = new SqlParameter("promo", requestParams.others + "");
            var paymentId = new SqlParameter("paymentId", requestParams.paymentId + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.createOrUpdateCustomerOrder @details, @user ,@promo, @paymentId;",
                details, user, promo, paymentId).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult deleteCustomerOrder(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.deleteCustomerOrder @id;", _id).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public CustomerOrder getCustomerOrder(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var customerorder = db.Set<CustomerOrder>().FromSqlRaw("EXEC dbo.getCustomerOrder @id;", _id).ToList().FirstOrDefault() ?? new CustomerOrder();
            
            return customerorder;
        }


    

        public List<CustomerOrder> getCustomerOrders(RequestParams requestParms)
        {
            var _id = new SqlParameter("id", requestParms.id == 0 ? (object)DBNull.Value : requestParms.id);
            var _user = new SqlParameter("user", requestParms.user == 0 ? (object)DBNull.Value : requestParms.user);
            var _completedYn = new SqlParameter("completedYn", string.IsNullOrEmpty(requestParms.completedYn) ? (object)DBNull.Value : requestParms.completedYn);
            var _startDate = new SqlParameter("startDate", string.IsNullOrEmpty(requestParms.startDate) ? (object)DBNull.Value : requestParms.startDate);
            var _endDate = new SqlParameter("endDate", string.IsNullOrEmpty(requestParms.endDate) ? (object)DBNull.Value : requestParms.endDate);
            var _status = new SqlParameter("status", requestParms.status == 0 ? (object)DBNull.Value : requestParms.status);

            var customerorders = db.Set<CustomerOrder>().FromSqlRaw("EXEC dbo.getCustomerOrders @id, @user, @completedYn, @startDate, @endDate, @status;", 
                _id, _user, _completedYn, _startDate, _endDate, _status).ToList();

            return customerorders;
        }



        public List<CustomerOrder> getMyOrders(RequestParams requestParms)
        {
            var _user = new SqlParameter("user", requestParms.user + "");
            var customerorders = db.Set<CustomerOrder>().FromSqlRaw("EXEC dbo.getMyOrders @user;",  _user).ToList();
            return customerorders;
        }

        public DbResult updateStatusForCustomerOrder(RequestParams requestParms)
        {
            var _id = new SqlParameter("id", requestParms.id + "");
            var _status = new SqlParameter("status", requestParms.status + "");
            var _user = new SqlParameter("user", requestParms.user + "");
            var _refund = new SqlParameter("refund", requestParms.refundId ?? "");

            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.updateStatusForCustomerOrder @id,@status,@user,@refund;", _id, _status, _user, _refund).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }
    }
}
