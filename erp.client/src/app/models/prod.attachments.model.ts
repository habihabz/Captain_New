export class ProdAttachement {
  pa_id: number = 0;
  pa_prod_id: number = 0;
  pa_color: number = 0;
  pa_color_name: string = '';
  pa_image_path: string = '';
  pa_cre_by: number = 0;
  pa_cre_by_name: string = '';
  pa_cre_date: string = '';

  constructor(init?: Partial<ProdAttachement>) {
    Object.assign(this, init);
  }
}