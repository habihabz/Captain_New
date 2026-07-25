using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    public class  Address
    { 
    
        [Key]
        [Display(Name = "Id")]
        public int ad_id { get; set; }

        [Display(Name = "User")]
        public string? ad_name { get; set; } = string.Empty;

        [Display(Name = "address")]
        public string? ad_address { get; set; } = string.Empty;

        [Display(Name = "phone")]
        public string? ad_phone { get; set; } = string.Empty;
   
        
        [Display(Name = "pin code")]
        public int? ad_pincode { get; set; } = 0;

        [Display(Name = "Default")]
        public string? ad_is_default_yn { get; set; } = string.Empty;

        [Display(Name = "Created By")]
        public int? ad_cre_by { get; set; }

        [Display(Name = "Created By")]
        public string? ad_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.Date)]
        public DateTime  ad_cre_date { get; set; } = DateTime.Now;

    }
}
