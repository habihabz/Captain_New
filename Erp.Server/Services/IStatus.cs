using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IStatus
    {
        DbResult CreateOrUpdateStatus(Status status);
        DbResult DeleteStatus(int id);
        Status GetStatus(int id);
        List<Status> GetStatuses(int workflow);
    }
}
