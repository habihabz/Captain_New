export class Slider {
  s_id: number;
  s_title: string;
  s_image_url: string;
  s_active_yn: string;
  s_cre_by: number;
  s_cre_by_name: string;
  s_cre_date: string;

  constructor() {
    this.s_id = 0;
    this.s_title = '';
    this.s_image_url = '';
    this.s_active_yn = 'Y';       // Y / N
    this.s_cre_by = 0;
    this.s_cre_by_name = '';
    this.s_cre_date = '';
  }
}