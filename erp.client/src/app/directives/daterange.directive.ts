import { Directive, ElementRef, AfterViewInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
declare var $: any;
declare var moment: any;

@Directive({
  selector: '[appDateRange]'
})
export class DateRangeDirective implements AfterViewInit, OnDestroy {
  @Input() startDate: any;
  @Input() endDate: any;
  @Output() rangeChanged = new EventEmitter<{ startDate: string, endDate: string }>();

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const options = {
      autoUpdateInput: false,
      locale: {
        format: 'YYYY-MM-DD',
        cancelLabel: 'Clear'
      },
      ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    };

    $(this.el.nativeElement).daterangepicker(options);

    $(this.el.nativeElement).on('apply.daterangepicker', (ev: any, picker: any) => {
      const start = picker.startDate.format('YYYY-MM-DD');
      const end = picker.endDate.format('YYYY-MM-DD');
      
      $(this.el.nativeElement).val(start + ' - ' + end);
      this.rangeChanged.emit({ startDate: start, endDate: end });
    });

    $(this.el.nativeElement).on('cancel.daterangepicker', (ev: any, picker: any) => {
      $(this.el.nativeElement).val('');
      this.rangeChanged.emit({ startDate: '', endDate: '' });
    });
    
    // Set initial value if provided
    if (this.startDate && this.endDate) {
      $(this.el.nativeElement).val(this.startDate + ' - ' + this.endDate);
      $(this.el.nativeElement).data('daterangepicker').setStartDate(this.startDate);
      $(this.el.nativeElement).data('daterangepicker').setEndDate(this.endDate);
    }
  }

  ngOnDestroy(): void {
    $(this.el.nativeElement).off('apply.daterangepicker');
    $(this.el.nativeElement).off('cancel.daterangepicker');
    if ($(this.el.nativeElement).data('daterangepicker')) {
        $(this.el.nativeElement).data('daterangepicker').remove();
    }
  }
}
