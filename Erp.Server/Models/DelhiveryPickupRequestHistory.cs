using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Erp.Server.Models
{
    [Table("DelhiveryPickupRequests")]
    public class DelhiveryPickupRequestHistory
    {
        [Key]
        public int dpr_id { get; set; }

        [Required]
        [MaxLength(200)]
        public string dpr_location { get; set; } = string.Empty;

        [Required]
        public DateTime dpr_date { get; set; }

        [Required]
        [MaxLength(50)]
        public string dpr_time { get; set; } = string.Empty;

        [Required]
        public int dpr_package_count { get; set; }

        [Required]
        [MaxLength(100)]
        public string dpr_status { get; set; } = string.Empty;

        public string dpr_response { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? dpr_pickup_id { get; set; }

        [Required]
        public int dpr_cre_by { get; set; }

        [Required]
        public DateTime dpr_cre_date { get; set; } = DateTime.Now;

        [NotMapped]
        public string dpr_cre_by_name { get; set; } = string.Empty;
    }
}
