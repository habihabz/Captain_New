using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Erp.Server.Repository
{
    public class RefundRepository : IRefund
    {
        private readonly DBContext db;

        public RefundRepository(DBContext _db)
        {
            db = _db;
        }

        public List<CustomerOrder> GetRefundableOrders(RequestParams requestParams)
        {
            var id = new SqlParameter("id", requestParams.id == null ? (object)DBNull.Value : requestParams.id);
            var startDate = new SqlParameter("startDate", string.IsNullOrEmpty(requestParams.startDate) ? (object)DBNull.Value : requestParams.startDate);
            var endDate = new SqlParameter("endDate", string.IsNullOrEmpty(requestParams.endDate) ? (object)DBNull.Value : requestParams.endDate);

            return db.Set<CustomerOrder>().FromSqlRaw("EXEC dbo.getRefundableOrders @id, @startDate, @endDate", id, startDate, endDate).ToList();
        }

        public List<CustomerOrder> GetCompletedRefunds(RequestParams requestParams)
        {
            var id = new SqlParameter("id", requestParams.id == null ? (object)DBNull.Value : requestParams.id);
            var startDate = new SqlParameter("startDate", string.IsNullOrEmpty(requestParams.startDate) ? (object)DBNull.Value : requestParams.startDate);
            var endDate = new SqlParameter("endDate", string.IsNullOrEmpty(requestParams.endDate) ? (object)DBNull.Value : requestParams.endDate);

            return db.Set<CustomerOrder>().FromSqlRaw("EXEC dbo.getCompletedRefunds @id, @startDate, @endDate", id, startDate, endDate).ToList();
        }
    }
}
