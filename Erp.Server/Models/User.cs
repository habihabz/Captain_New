using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    public class User
    {
        [Key]
        [Display(Name = "Id")]
        public int u_id { get; set; }

        [Display(Name = "Full Name")]
        public string? u_name { get; set; } = string.Empty;

        [Display(Name = "Username")]
        public string? u_username { get; set; } = string.Empty;

        [Display(Name = "Password")]
        public string? u_password { get; set; } = string.Empty;

        [Display(Name = "Phone")]
        public string? u_phone { get; set; } = string.Empty;

        [Display(Name = "Email")]
        public string? u_email { get; set; } = string.Empty;

        [Display(Name = "Role Id")]
        public int? u_role_id { get; set; }

        [Display(Name = "Role Name")]
        public string? u_role_name { get; set; } = string.Empty;

        [Display(Name = "Date of Birth")]
        public DateTime? u_date_of_birth { get; set; } 

        [Display(Name = "Gets Updates")]
        public string? u_is_get_updates { get; set; } = "N";

        [Display(Name = "Agree to Terms")]
        public string? u_agree_terms { get; set; } = "N";

        [Display(Name = "Is Admin")]
        public string? u_is_admin { get; set; } = "N";

        [Display(Name = "Active")]
        public string? u_active_yn { get; set; } = "Y";

        [Display(Name = "Image URL")]
        public string? u_image_url { get; set; } = string.Empty;

        [Display(Name = "Created By")]
        public int? u_cre_by { get; set; }

        [Display(Name = "Created By Name")]
        public string? u_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.Date)]
        public DateTime u_cre_date { get; set; } = DateTime.Now;
    }
}
