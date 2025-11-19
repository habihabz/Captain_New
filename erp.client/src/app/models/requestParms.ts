export class RequestParms {
  id: number;
  name: string;
  type: string;
  country :number;
  details:string;
  user:number;
  status:number;
  constructor() {
    this.id = 0;
    this.name='',
    this.type='',
    this.country=0;
    this.details='';
    this.user=0;
    this.status=0;
  }

}
