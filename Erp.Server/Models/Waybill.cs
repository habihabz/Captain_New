using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Erp.Server.Models
{
    [Table("Waybills")]
    public class Waybill
    {
        [Key]
        public int wb_id { get; set; }

        [Required]
        [MaxLength(50)]
        public string wb_number { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string wb_status { get; set; } = "Unused";

        public int? wb_order_id { get; set; }

        public DateTime? wb_used_date { get; set; }

        public DateTime wb_created_date { get; set; } = DateTime.Now;

        [MaxLength(1)]
        public string wb_is_pickup_scheduled { get; set; } = "N";

        public int? wb_pickup_id { get; set; }
    }
}
