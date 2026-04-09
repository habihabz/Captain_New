export class Status {
  s_id: number;
  s_name: string;
  s_cre_by: number;
  s_cre_by_name: string;
  s_cre_date: string;
  s_workflow_id: number;

  constructor() {
    this.s_id = 0;
    this.s_name = '';
    this.s_cre_by = 0;
    this.s_cre_by_name = '';
    this.s_cre_date = '';
    this.s_workflow_id = 0;
  }
}
