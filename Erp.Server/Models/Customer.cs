using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    public class Customer
    {
        [Key]
        [Display(Name = "Id")]
        public int c_id { get; set; }

        [Display(Name = "Name")]
        public string? c_name { get; set; } = string.Empty;

        [Display(Name = "Email")]
        public string? c_email { get; set; } = string.Empty;
        
        [Display(Name = "Phone")]
        public string? c_phone { get; set; } = string.Empty;

        [Display(Name = "User Name")]
        public string? c_username { get; set; } = string.Empty;

        [Display(Name = "Password")]
        public string? c_password { get; set; } = string.Empty;

        [Display(Name = "Date of Birth")]
        [DataType(DataType.Date)]
        public DateTime? c_date_of_birth { get; set; }

        [Display(Name = "Get Updates")]
        public string? c_is_get_updates { get; set; } = "false";

        [Display(Name = "Agree Terms")]
        public string? c_agree_terms { get; set; } = "false";

        [Display(Name = "Active")]
        public string? c_active_yn { get; set; } = "Y";

        [Display(Name = "Image URL")]
        public string? c_image_url { get; set; } = string.Empty;

        [Display(Name = "Created By")]
        public int? c_cre_by { get; set; }

        [Display(Name = "Created By Name")]
        public string? c_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.Date)]
        public DateTime c_cre_date { get; set; } = DateTime.Now;
    }
}
