using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Erp.Server.Models
{
    public class OrderMovementHistory
    {
        [Key]
        [Display(Name = "Id")]
        public int omh_id { get; set; }

        [Display(Name = "Order No")]
        public int? omh_order_no { get; set; }

        [Display(Name = "Status")]
        public int? omh_status { get; set; }

       
        [Display(Name = "Status Name")]
        public string? omh_status_name { get; set; } = string.Empty;

        [Display(Name = "Created By")]
        public int? omh_cre_by { get; set; }

       
        [Display(Name = "Created By Name")]
        public string? omh_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.DateTime)]
        public DateTime? omh_cre_date { get; set; } = DateTime.Now;
    }
}