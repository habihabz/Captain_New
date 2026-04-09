import { Product } from "./product.model";

export class Cart extends Product {
  c_id: number;
  c_product: number;
  c_size: number;
  c_size_name: string;
  c_color: number;
  c_color_name: string;
  c_qty: number;
  c_price: number;
  c_cre_by: number;
  c_cre_by_name: string;
  c_cre_date: string;

  constructor() {
    super();
    this.c_id = 0;
    this.c_product = 0;
    this.c_size = 0;
    this.c_size_name='';
    this.c_color = 0;
    this.c_color_name = '';
    this.c_qty = 0;
    this.c_price = this.calculatePrice(); 
    this.c_cre_by = 0;
    this.c_cre_by_name = '';
    this.c_cre_date = '';
  }

  private calculatePrice(): number {
    return this.c_qty > 0 && this.p_price ? this.c_qty * this.p_price : 0;
  }

  toCartOnly() {
  return {
    c_id: this.c_id,
    c_product: this.c_product,
    c_size: this.c_size,
    c_size_name: this.c_size_name,
    c_color: this.c_color,
    c_color_name: this.c_color_name,
    c_qty: this.c_qty,
    c_price: this.c_price,
    c_cre_by: this.c_cre_by
  };
}
}
