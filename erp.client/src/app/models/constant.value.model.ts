export class ConstantValue {
  cv_id: number;
  cv_name: string;
  cv_value: string;
  cv_active_yn: string;
  cv_cre_by: number;
  cv_cre_by_name: string;
  cv_cre_date: string;
  constructor() {
    this.cv_id = 0;
    this.cv_name = '';
    this.cv_value = '';
    this.cv_active_yn = '';
    this.cv_cre_by = 0;
    this.cv_cre_by_name = '';
    this.cv_cre_date = '';
  }

}
