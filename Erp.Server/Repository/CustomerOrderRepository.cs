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

       

        public DbResult createOrUpdateCustomerOrder(RequestParams requestParams)
        {
            var user = new SqlParameter("user", requestParams.user + "");
            var details = new SqlParameter("details", requestParams.details + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.createOrUpdateCustomerOrder @details, @user;",
                details,user ).ToList().FirstOrDefault() ?? new DbResult();
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

        public List<CustomerOrderDetail> getCustomerOrderDetails(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var customerOrderDetails = db.Set<CustomerOrderDetail>().FromSqlRaw("EXEC dbo.getCustomerOrderDetails @id;", _id).ToList();
            return customerOrderDetails;
        }

        public List<CustomerOrder> getCustomerOrders(RequestParams requestParms)
        {
            var _id = new SqlParameter("id", requestParms.id + "");
            var _user = new SqlParameter("user", requestParms.user + "");
            var customerorders = db.Set<CustomerOrder>().FromSqlRaw("EXEC dbo.getCustomerOrders @id,@user;", _id, _user).ToList();
            return customerorders;
        }

        public List<CustomerOrder> getMyOrders(RequestParams requestParms)
        {
            var _user = new SqlParameter("user", requestParms.user + "");
            var customerorders = db.Set<CustomerOrder>().FromSqlRaw("EXEC dbo.getMyOrders @user;",  _user).ToList();
            return customerorders;
        }
    }
}
