using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Erp.Server.Models
{
    public class Blog
    {
        [Key]
        [Display(Name = "Id")]
        public int b_id { get; set; }

        [Display(Name = "Title")]
        public string? b_title { get; set; } = string.Empty;

        [Display(Name = "Description")]
        public string? b_description { get; set; } = string.Empty;

        [Display(Name = "Content")]
        public string? b_content { get; set; } = string.Empty;

        [Display(Name = "Image URL")]
        public string? b_image_url { get; set; } = string.Empty;

        [Display(Name = "Active (Y/N)")]
        public string? b_active_yn { get; set; } = "Y";

        [Display(Name = "Created By")]
        public int? b_cre_by { get; set; }

        [Display(Name = "Created By")]
        public string? b_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.Date)]
        public DateTime b_cre_date { get; set; } = DateTime.Now;
    }
}