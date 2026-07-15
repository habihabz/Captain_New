using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IPackagingType
    {
        List<PackagingType> GetPackagingTypes();
        PackagingType GetPackagingType(int id);
        DbResult CreateOrUpdatePackagingType(PackagingType packagingType);
        DbResult DeletePackagingType(int id);
    }
}
