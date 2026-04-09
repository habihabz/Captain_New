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

        public string? ro_bank_name { get; set; } = string.Empty;
        public string? ro_account_no { get; set; } = string.Empty;
        public string? ro_ifsc_code { get; set; } = string.Empty;

        public string? ro_reason { get; set; } = string.Empty;
        public string? ro_comments { get; set; } = string.Empty;

        public int? ro_cre_by { get; set; }
        public string? ro_cre_by_name { get; set; } = string.Empty;

        public DateTime ro_cre_date { get; set; } = DateTime.Now;

        // Joined Data for List View
        public string? p_name { get; set; } = string.Empty; 
        public string? co_customer_name { get; set; } = string.Empty;
        public decimal? co_net_amount { get; set; }
    }
}
