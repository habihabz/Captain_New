using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Erp.Server.Models
{
    public class PackagingType
    {
        [Key]
        [Display(Name = "Id")]
        public int pt_id { get; set; }

        [Display(Name = "Type Name")]
        public string? pt_name { get; set; } = string.Empty;

        [Display(Name = "Length")]
        public int pt_length { get; set; }

        [Display(Name = "Breadth")]
        public int pt_breadth { get; set; }

        [Display(Name = "Height")]
        public int pt_height { get; set; }

        [Display(Name = "Package Type")]
        public string? pt_pkg_type { get; set; } = "box";

        [Display(Name = "Weight (Grams)")]
        public int pt_weight { get; set; } = 100;

        [Display(Name = "Active")]
        public string? pt_active_yn { get; set; } = "Y";

        [Display(Name = "Created By")]
        public int? pt_cre_by { get; set; }

        [Display(Name = "Created By Name")]
        public string? pt_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.Date)]
        public DateTime pt_cre_date { get; set; } = DateTime.Now;
    }
}
