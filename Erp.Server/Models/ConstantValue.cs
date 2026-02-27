using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    public class ConstantValue
    {
        [Key]
        public int cv_id { get; set; }

        [Display(Name = "Constant Name")]
        public string? cv_name { get; set; } = string.Empty;

        [Display(Name = "Constant Value")]
        public string? cv_value { get; set; } = string.Empty;

        [Display(Name = "Active (Y/N)")]
        public string? cv_active_yn { get; set; } = "Y";

        [Display(Name = "Created By")]
        public int? cv_cre_by { get; set; }

        [Display(Name = "Created By")]
        public string? cv_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        public DateTime cv_cre_date { get; set; } = DateTime.Now;
    }
}