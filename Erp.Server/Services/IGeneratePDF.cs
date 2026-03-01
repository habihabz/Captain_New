using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IGeneratePDF
    {
        byte[] Invoice(CustomerOrder order, List<ConstantValue> constantValues);
    }
}