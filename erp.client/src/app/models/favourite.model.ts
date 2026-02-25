import { Product } from "./product.model";

export class Favourite extends Product {
  f_id: number;
  f_product: number;
  f_cre_by: number;
  f_cre_by_name: string;
  f_cre_date: string;

  constructor() {
    super();
    this.f_id = 0;
    this.f_product = 0;
    this.f_cre_by = 0;
    this.f_cre_by_name = '';
    this.f_cre_date = '';
  }
}
