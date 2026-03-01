using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;

namespace Erp.Server.Models
{
    public class ReportParms
    {
        public string? rp_serial_no { get; set; } = string.Empty;
        public string? rp_report_type { get; set; } = string.Empty;
        public string? rp_date_range { get; set; } = string.Empty;
        public int? rp_order_status { get; set; } = 0;
        public int rp_invoice_status { get; set; } = 0;
        public string? rp_invoice_no { get; set; } = string.Empty;
        public string? rp_sku { get; set; } = string.Empty;
        public decimal? rp_price { get; set; } = 0;
        public int? rp_user { get; set; } = 0;
        public string? rp_flag { get; set; } = string.Empty;
        public int? rp_category { get; set; } = 0;
    }

}
