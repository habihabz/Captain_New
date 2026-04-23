import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
declare var Razorpay: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnDestroy {
    private apiUrl = `${environment.serverHostAddress}/api/payment/create-order`;
    razorpayLoaded = false;
  
    constructor(private http: HttpClient, private router: Router) {}

  loadRazorpay() {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="razorpay"]');
      if (existing) {
        this.razorpayLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.id = 'razorpay-checkout-js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => reject(false);
      document.body.appendChild(script);
    });
  }

  cleanupRazorpay() {
    const scripts = document.querySelectorAll('script[src*="razorpay"]');
    scripts.forEach(s => s.remove());
    
    const iframes = document.querySelectorAll('iframe[src*="razorpay"]');
    iframes.forEach(i => i.remove());
    
    if ((window as any).Razorpay) {
      delete (window as any).Razorpay;
    }
    
    this.razorpayLoaded = false;
  }

  ngOnDestroy() {
    this.cleanupRazorpay();
  }

  async pay() {
    await this.loadRazorpay();

    const Razorpay = (window as any).Razorpay;

    this.http.post<any>(this.apiUrl, { amount: 500 })
      .subscribe(order => {
        const options = {
          key: order.key,
          amount: order.amount * 100,
          currency: order.currency,
          name: 'Captain',
          description: 'Test Transaction',
          order_id: order.orderId,
          method: {
            upi: true
          },
          handler: (response: any) => {
            this.router.navigate(['/payment-success']);
          },
          prefill: {
            email: 'abimanjeri@gmail.com',
            contact: '9744764030'
          },
          theme: {
            color: '#3399cc'
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      });
  }
}