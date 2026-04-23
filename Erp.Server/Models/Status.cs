using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    [Table("Statuses")]
    public class Status
    {
        [Key]
        [Display(Name = "Id")]
        public int s_id { get; set; }

        [Display(Name = "Status Name")]
        public string s_name { get; set; } = string.Empty;

        [Display(Name = "Created By")]
        public int? s_cre_by { get; set; }

        [Display(Name = "Created By Name")]
        public string? s_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.Date)]
        public DateTime s_cre_date { get; set; } = DateTime.Now;

        public int? s_workflow_id { get; set; }
        public int? cos_priority { get; set; }
        public string? s_active_yn { get; set; } = "Y";
    }
}
