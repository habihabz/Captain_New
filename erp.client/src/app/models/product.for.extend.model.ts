export class  ProductForExtend {
  p_id: number;
  p_name: string;
  p_short_name: string;
  p_description : string;
  p_category: number;
  p_category_name: string;
  p_sub_category: number;
  p_sub_category_name: string;
  p_division: number;
  p_division_name: string;
  p_sub_division: number;
  p_sub_division_name: string;
  p_overall_rating:number ;
  p_active_yn: string;
  p_price:number;
  p_cre_by: number;
  p_cre_by_name: string;
  p_cre_date: string;
  p_barcodes:string;
  p_sizes:string;
  p_colors:string;
  p_attachements:string;
  
  constructor() {
    this.p_id = 0;
    this.p_name='',
    this.p_short_name='';
    this.p_description='',
    this.p_category = 0;
    this.p_category_name = '';
    this.p_sub_category = 0;
    this.p_sub_category_name = '';
    this.p_division = 0;
    this.p_division_name = '';
    this.p_sub_division = 0;
    this.p_sub_division_name = '';
    this.p_overall_rating=0;
    this.p_active_yn = '';
    this.p_price=0;
    this.p_cre_by = 0;
    this.p_cre_by_name = '';
    this.p_cre_date = '';
    this.p_barcodes='';
    this.p_sizes='';
    this.p_colors='';
    this.p_attachements='';
  }

}
