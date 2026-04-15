using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Erp.Server.Models
{
    public class ReturnOrder
    {
        [Key]
        public int ro_id { get; set; }

        public int ro_order_no { get; set; }
        public string? ro_order_id_display { get; set; } = string.Empty;

        public int ro_status { get; set; }
        public string? ro_status_name { get; set; } = string.Empty;

        public string? ro_reason { get; set; } = string.Empty;
        public string? ro_comments { get; set; } = string.Empty;

        public int? ro_cre_by { get; set; }
        public string? ro_cre_by_name { get; set; } = string.Empty;

        public DateTime ro_cre_date { get; set; } = DateTime.Now;

        public string? ro_prod_name { get; set; } = string.Empty; 
        public string? ro_customer_name { get; set; } = string.Empty;
        public decimal? ro_net_amount { get; set; }
        public string? ro_payment_id { get; set; }
        public string? ro_completed_yn { get; set; } = "N";

    }
}
