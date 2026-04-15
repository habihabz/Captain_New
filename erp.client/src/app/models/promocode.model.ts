export class Promocode {
    pc_id: number;
    pc_code: string;
    pc_discount_perc: number;
    pc_max_discount_amount: number;
    pc_min_order_amount: number;
    pc_expiry_date: string | null;
    pc_active_yn: string;
    pc_cre_by: number | null;
    pc_cre_by_name: string;
    pc_cre_date: string;

    constructor() {
        this.pc_id = 0;
        this.pc_code = '';
        this.pc_discount_perc = 0;
        this.pc_max_discount_amount = 0;
        this.pc_min_order_amount = 0;
        this.pc_expiry_date = null;
        this.pc_active_yn = 'Y';
        this.pc_cre_by = null;
        this.pc_cre_by_name = '';
        this.pc_cre_date = '';
    }
}
