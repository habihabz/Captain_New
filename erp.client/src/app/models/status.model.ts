export class Status {
  s_id: number;
  s_name: string;
  s_cre_by: number;
  s_cre_by_name: string;
  s_cre_date: string;
  s_workflow_id: number;
  cos_priority: number;
  s_active_yn: string;

  constructor() {
    this.s_id = 0;
    this.s_name = '';
    this.s_cre_by = 0;
    this.s_cre_by_name = '';
    this.s_cre_date = '';
    this.s_workflow_id = 0;
    this.cos_priority = 0;
    this.s_active_yn = 'Y';
  }
}
