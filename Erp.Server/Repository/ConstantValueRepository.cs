using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;

namespace Erp.Server.Repository
{
    public class ConstantValueRepository : IConstantValue
    {
        private readonly DBContext db;

        public ConstantValueRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult createOrUpdateConstantValue(ConstantValue constant)
        {
            var cv_id = new SqlParameter("cv_id", constant.cv_id + "");
            var cv_name = new SqlParameter("cv_name", constant.cv_name + "");
            var cv_value = new SqlParameter("cv_value", constant.cv_value + "");
            var cv_active_yn = new SqlParameter("cv_active_yn", constant.cv_active_yn + "");
            var cv_cre_by = new SqlParameter("cv_cre_by", constant.cv_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.createOrUpdateConstantValue @cv_id, @cv_name, @cv_value, @cv_active_yn, @cv_cre_by;",
                cv_id, cv_name, cv_value, cv_active_yn, cv_cre_by
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public DbResult deleteConstantValue(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.deleteConstantValue @id;",
                _id
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public ConstantValue getConstantValue(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var constant = db.Set<ConstantValue>().FromSqlRaw(
                "EXEC dbo.getConstantValue @id;",
                _id
            ).ToList().FirstOrDefault() ?? new ConstantValue();

            return constant;
        }

        public List<ConstantValue> getConstantValues()
        {
            var constants = db.Set<ConstantValue>().FromSqlRaw(
                "EXEC dbo.getConstantValues;"
            ).ToList();

            return constants;
        }

        public ConstantValue getConstantValueByName(RequestParams    requestParams)
        {
            var _name = new SqlParameter("name", requestParams.name + "");

            var constant = db.Set<ConstantValue>().FromSqlRaw(
                "EXEC dbo.getConstantValueByName {0};", requestParams.name
            ).ToList().FirstOrDefault() ?? new ConstantValue();

            return constant;
        }
    }
}