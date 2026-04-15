using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Erp.Server.Repository
{
    public class PromocodeRepository : IPromocode
    {
        private readonly DBContext db;

        public PromocodeRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult CreateOrUpdatePromocode(Promocode promocode)
        {
            var pc_id = new SqlParameter("pc_id", promocode.pc_id + "");
            var pc_code = new SqlParameter("pc_code", promocode.pc_code ?? "");
            var pc_discount_perc = new SqlParameter("pc_discount_perc", promocode.pc_discount_perc + "");
            var pc_max_discount_amount = new SqlParameter("pc_max_discount_amount", promocode.pc_max_discount_amount + "");
            var pc_min_order_amount = new SqlParameter("pc_min_order_amount", promocode.pc_min_order_amount + "");
            var pc_expiry_date = new SqlParameter("pc_expiry_date", (object)promocode.pc_expiry_date ?? DBNull.Value);
            var pc_active_yn = new SqlParameter("pc_active_yn", promocode.pc_active_yn ?? "Y");
            var pc_cre_by = new SqlParameter("pc_cre_by", promocode.pc_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.CreateOrUpdatePromocode @pc_id, @pc_code, @pc_discount_perc, @pc_max_discount_amount, @pc_min_order_amount, @pc_expiry_date, @pc_active_yn, @pc_cre_by;",
                pc_id, pc_code, pc_discount_perc, pc_max_discount_amount, pc_min_order_amount, pc_expiry_date, pc_active_yn, pc_cre_by
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public DbResult DeletePromocode(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.DeletePromocode @id;", _id)
                .ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public Promocode GetPromocode(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var promocode = db.Set<Promocode>().FromSqlRaw("EXEC dbo.GetPromocode @id;", _id)
                .ToList().FirstOrDefault() ?? new Promocode();

            return promocode;
        }

        public Promocode GetPromocodeByCode(string code)
        {
            var _code = new SqlParameter("code", code ?? "");
            var promocode = db.Set<Promocode>().FromSqlRaw("EXEC dbo.GetPromocodeByCode @code;", _code)
                .ToList().FirstOrDefault();

            return promocode;
        }

        public List<Promocode> GetPromocodes(RequestParams requestParams)
        {
            var list = db.Set<Promocode>().FromSqlRaw(
                "EXEC dbo.GetPromocodes "
            ).ToList();

            return list;
        }
    }
}
