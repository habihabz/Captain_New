using Erp.Server.Models;
using System.Data;

namespace Erp.Server.Services
{
    public interface IReport
    {
      
        DataTable getOrderReport(ReportParms reportParms);
        DashboardStats getDashboardStats();
      
    }
}
