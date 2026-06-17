using System;

namespace BarcodePrinting.Models
{
    public class ConstantValue
    {
        public int cv_id { get; set; }
        public string cv_name { get; set; } = string.Empty;
        public string cv_value { get; set; } = string.Empty;
        public string cv_active_yn { get; set; } = "Y";
    }
}
