using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Erp.Server.Models
{
    [Table("DelhiveryWarehouses")]
    public class DelhiveryWarehouse
    {
        [Key]
        public int dw_id { get; set; }

        [Required]
        [MaxLength(100)]
        public string dw_name { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string dw_address { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string dw_city { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string dw_state { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string dw_country { get; set; } = "India";

        [Required]
        [MaxLength(20)]
        public string dw_pincode { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string dw_phone { get; set; } = string.Empty;

        [MaxLength(100)]
        public string dw_email { get; set; } = string.Empty;

        [Required]
        [MaxLength(1)]
        public string dw_registered_yn { get; set; } = "Y";

        public DateTime dw_created_date { get; set; } = DateTime.Now;
    }
}
