import { Directive, ElementRef, Input, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
declare var $: any;

@Directive({
  selector: '[appSelect2]'
})
export class Select2Directive implements AfterViewInit, OnDestroy {
  @Input() options: any = {};
  @Input() placeholder: string = 'Select an option';
  @Input() allowClear: boolean = false;
  @Output() selectionChanged = new EventEmitter<any>();

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const select2Options = {
      ...this.options,
      placeholder: this.placeholder,
      allowClear: this.allowClear,
      width: '100%'
    };

    // Initialize Select2 with the provided options
    $(this.el.nativeElement).select2(select2Options);

    // Listen for the 'change' event and emit the selectionChanged event
    $(this.el.nativeElement).on('change', (e: any) => {
      const selectedValue = $(e.target).val();
      this.selectionChanged.emit(selectedValue);
    });
  }

  ngOnDestroy(): void {
    // Remove the event listener and destroy the Select2 instance
    $(this.el.nativeElement).off('change');
    $(this.el.nativeElement).select2('destroy');
  }

  // Method to get selected value
  public getSelectedValue(): any {
    return $(this.el.nativeElement).val();
  }

  setValue(value: any): void {
    $(this.el.nativeElement).val(value).trigger('change');
  }
}
