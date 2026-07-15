using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Erp.Server.Repository
{
    public class PackagingTypeRepository : IPackagingType
    {
        private DBContext db;
        
        public PackagingTypeRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult CreateOrUpdatePackagingType(PackagingType packagingType)
        {
            var pt_id = new SqlParameter("pt_id", packagingType.pt_id + "");
            var pt_name = new SqlParameter("pt_name", packagingType.pt_name + "");
            var pt_length = new SqlParameter("pt_length", packagingType.pt_length + "");
            var pt_breadth = new SqlParameter("pt_breadth", packagingType.pt_breadth + "");
            var pt_height = new SqlParameter("pt_height", packagingType.pt_height + "");
            var pt_pkg_type = new SqlParameter("pt_pkg_type", packagingType.pt_pkg_type + "");
            var pt_active_yn = new SqlParameter("pt_active_yn", packagingType.pt_active_yn + "");
            var pt_cre_by = new SqlParameter("pt_cre_by", packagingType.pt_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.createOrUpdatePackagingType @pt_id,@pt_name,@pt_length,@pt_breadth,@pt_height,@pt_pkg_type,@pt_active_yn,@pt_cre_by;",
                pt_id, pt_name, pt_length, pt_breadth, pt_height, pt_pkg_type, pt_active_yn, pt_cre_by).ToList().FirstOrDefault() ?? new DbResult();
            
            return dbresult;
        }

        public DbResult DeletePackagingType(int id)
        {
            var _id = new SqlParameter("pt_id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.deletePackagingType @pt_id;", _id).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public PackagingType GetPackagingType(int id)
        {
            var _id = new SqlParameter("pt_id", id + "");
            var pt = db.Set<PackagingType>().FromSqlRaw("EXEC dbo.getPackagingType @pt_id;", _id).ToList().FirstOrDefault() ?? new PackagingType();
            return pt;
        }

        public List<PackagingType> GetPackagingTypes()
        {
            var pts = db.Set<PackagingType>().FromSqlRaw("EXEC dbo.getPackagingTypes;").ToList();
            return pts;
        }
    }
}
