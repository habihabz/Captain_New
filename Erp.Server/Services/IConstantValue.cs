using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IConstantValue
    {
        DbResult createOrUpdateConstantValue(ConstantValue constant);
        DbResult deleteConstantValue(int id);
        ConstantValue getConstantValue(int id);
        List<ConstantValue> getConstantValues();
        ConstantValue getConstantValueByName(RequestParams requestParams);


    }
}