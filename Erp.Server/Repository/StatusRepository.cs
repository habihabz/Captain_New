using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Erp.Server.Repository
{
    public class StatusRepository : IStatus
    {
        private DBContext db;

        public StatusRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult CreateOrUpdateStatus(Status status)
        {
            var s_id = new SqlParameter("s_id", status.s_id + "");
            var s_name = new SqlParameter("s_name", status.s_name + "");
            var s_cre_by = new SqlParameter("s_cre_by", status.s_cre_by + "");
            var s_workflow_id = new SqlParameter("s_workflow_id", status.s_workflow_id + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.CreateOrUpdateStatus @s_id, @s_name, @s_cre_by, @s_workflow_id;",
                s_id, s_name, s_cre_by, s_workflow_id
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public DbResult DeleteStatus(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.DeleteStatus @id;", _id)
                .ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public Status GetStatus(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var status = db.Set<Status>().FromSqlRaw("EXEC dbo.GetStatus @id;", _id)
                .ToList().FirstOrDefault() ?? new Status();

            return status;
        }

        public List<Status> GetStatuses(int workflow)
        {
            var _workflow = new SqlParameter("workflow", workflow + "");
            var statuses = db.Set<Status>().FromSqlRaw("EXEC dbo.GetStatuses @workflow;", _workflow).AsNoTracking().ToList();
            return statuses;
        }
    }
}
