import { ProductForExtend } from "./product.for.extend.model";

export class CustomerOrder extends ProductForExtend {

    co_id: number;
    co_customer: number;
    co_customer_name: string;
    co_customer_phone: string;
    co_customer_email: string;
    co_c_address: number;
    co_c_address_details: string;

    co_qty: number;
    co_product: number;
    co_product_name: string;

    co_size: number;
    co_size_name: string;

    co_color: number;
    co_color_name: string;

    co_unit_price: number;

    co_discount_perc: number;
    co_discount_amount: number;

    co_promo_code: string;

    co_amount: number;
    co_gst_perc: number;
    co_gst_amount: number;
    co_delivery_charge: number;
    co_net_amount: number;

    co_status: number;
    co_status_name: string;

    co_cre_by: number;
    co_cre_by_name: string;
    co_cre_date: string;

    constructor() {
        super();

        this.co_id = 0;
        this.co_customer = 0;
        this.co_customer_name = '';
        this.co_customer_phone = '';
        this.co_customer_email = '';
        this.co_c_address = 0;
        this.co_c_address_details = '';

        this.co_qty = 0;
        this.co_product = 0;
        this.co_product_name = '';

        this.co_size = 0;
        this.co_size_name = '';

        this.co_color = 0;
        this.co_color_name = '';

        this.co_unit_price = 0;

        this.co_discount_perc = 0;
        this.co_discount_amount = 0;

        this.co_promo_code = '';

        this.co_amount = 0;
        this.co_gst_perc = 0;
        this.co_gst_amount = 0;
        this.co_delivery_charge = 0;
        this.co_net_amount = 0;

        this.co_status = 0;
        this.co_status_name = '';

        this.co_cre_by = 0;
        this.co_cre_by_name = '';
        this.co_cre_date = '';
    }
}