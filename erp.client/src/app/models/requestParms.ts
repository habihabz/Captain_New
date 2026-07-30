export class RequestParms {
  id: number;
  name: string;
  type: string;
  country :number;
  details:string;
  user:number;
  status:number;
  color:number;
  others:string;
  amount:number;
  deliveryCharge: number;
  paymentId: string;
  paymentMethod: number;
  startDate: string;
  endDate: string;
  completedYn: string;
  refundId: string;
  address: number;

  constructor() {
    this.id = 0;
    this.name='',
    this.type='',
    this.country=0;
    this.details='';
    this.user=0;
    this.status=0;
    this.color=0;
    this.others = '';
    this.amount = 0;
    this.deliveryCharge = 0;
    this.paymentId = '';
    this.paymentMethod = 0;
    this.startDate = '';
    this.endDate = '';
    this.completedYn = 'N';
    this.refundId = '';
    this.address = 0;
  }

}
