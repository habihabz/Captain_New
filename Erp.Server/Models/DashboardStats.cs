using System;

namespace Erp.Server.Models
{
    public class DashboardStats
    {
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public int ActiveCustomers { get; set; }
        public int ActiveProducts { get; set; }
        public int PendingShipments { get; set; }
        public int NewCustomersWeek { get; set; }
        public int MonthlyOrders { get; set; }
    }
}
