using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Erp.Server.Models
{
    [Table("Promocodes")]
    public class Promocode
    {
        [Key]
        public int pc_id { get; set; }

        [Required]
        [StringLength(50)]
        public string pc_code { get; set; } = string.Empty;

        public decimal pc_discount_perc { get; set; }
        
        public decimal pc_max_discount_amount { get; set; }
        
        public decimal pc_min_order_amount { get; set; }

        public DateTime? pc_expiry_date { get; set; }

        [StringLength(1)]
        public string pc_active_yn { get; set; } = "Y";

        public int? pc_cre_by { get; set; }
        
        public string? pc_cre_by_name { get; set; } = string.Empty;

        public DateTime pc_cre_date { get; set; } = DateTime.Now;
    }
}
