export class Blog {
  b_id: number;
  b_title: string;
  b_description: string;
  b_content: string;
  b_image_url: string;
  b_active_yn: string;
  b_cre_by: number;
  b_cre_by_name: string;
  b_cre_date: string;

  constructor() {
    this.b_id = 0;
    this.b_title = '';
    this.b_description = '';
    this.b_content = '';
    this.b_image_url = '';
    this.b_active_yn = 'Y';   // Y / N
    this.b_cre_by = 0;
    this.b_cre_by_name = '';
    this.b_cre_date = '';
  }
}