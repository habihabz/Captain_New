export class ReportParm {
  rp_serial_no:string;
  rp_report_type :string ;
  rp_date_range : string;
  rp_order_status :number;
  rp_invoice_status:number;
  rp_invoice_no='';
  rp_sku:string;
  rp_price:number;
  rp_user:number;
  rp_flag:string;
  rp_category:number;
  constructor() {
    this.rp_report_type='';
    this.rp_date_range='';
    this.rp_serial_no='';
    this.rp_order_status=0;
    this.rp_invoice_status=0;
    this.rp_invoice_no='';
    this.rp_sku='';
    this.rp_price=0;
    this.rp_user=0;
    this.rp_flag='true';
    this.rp_category=0;
  }

}
