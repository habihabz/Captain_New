export class CustomerOrder {
    co_id: number;
    co_customer_id: number;
    co_customer_name: string;
    co_c_address_id:number;
    co_c_address_details:string;
    co_qty:number;
    co_amount:number;
    co_status :number;
    co_status_name :string;
    co_cre_by: number;
    co_cre_by_name: string;
    co_cre_date: string;

    constructor() {

        this.co_id = 0;
        this.co_customer_id = 0;
        this.co_customer_name='';
        this.co_c_address_id=0;
        this.co_c_address_details='';
        this.co_qty=0;
        this.co_amount=0;
        this.co_status = 0;
        this.co_status_name='';
        this.co_cre_by = 0;
        this.co_cre_by_name = '';
        this.co_cre_date = '';

    }
  }
  