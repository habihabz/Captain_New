export class OrderMovementHistory {
  omh_id: number;
  omh_order_no: number;
  omh_status: number;
  omh_status_name: string;
  omh_cre_by: number;
  omh_cre_by_name: string;
  omh_cre_date: string;

  constructor() {
    this.omh_id = 0;
    this.omh_order_no = 0;
    this.omh_status = 0;
    this.omh_status_name = '';
    this.omh_cre_by = 0;
    this.omh_cre_by_name = '';
    this.omh_cre_date = '';
  }
}