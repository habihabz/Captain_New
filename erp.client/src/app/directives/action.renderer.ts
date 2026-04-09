import { Component } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-action-renderer',
  template: `
    <div class="d-flex align-items-center justify-content-center gap-2 h-100" *ngIf="actions.length > 0; else singleButton">
      <button *ngFor="let act of actions" 
              [class]="act.cssClass" 
              (click)="onActionClick(act)" 
              [title]="act.tooltip || act.name"
              class="action-btn">
        <i [class]="act.icon"></i> 
        <span *ngIf="act.name" class="ms-2">{{ act.name }}</span>
      </button>
    </div>
    <ng-template #singleButton>
      <div class="d-flex align-items-center justify-content-center h-100">
        <button [class]="cssClass" (click)="onButtonClick()" [title]="name" class="action-btn">
          <i [class]="icon"></i> 
          <span *ngIf="name" class="ms-2">{{ name }}</span>
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    .gap-2 { gap: 0.5rem; }
    .action-btn { transition: all 0.3s ease; }
  `]
})
export class ActionRendererComponent {
  private params!: ICellRendererParams;
  name: string = '';
  icon: string = '';
  action: string = '';
  cssClass: string='';
  containerClass: string = '';
  actions: any[] = [];
  data :string='';
  

  agInit(params: any): void {
    this.params = params;
    this.name = params.name || '';
    this.icon = params.icon || '';
    this.cssClass=params.cssClass || '';
    this.containerClass = params.cssClass || ''; // reuse or use specific
    this.action = params.action || '';
    this.actions = params.actions || [];
    this.data= params.data||'';
  }

  onButtonClick(): void {
    const actionParams = this.params as any;
    if (actionParams && actionParams[this.action]) {
      actionParams[this.action](this.params.data);
    }
  }

  onActionClick(actionObj: any): void {
    const actionParams = this.params as any;
    const data = this.params.data;

    // 1. Try to call the function directly from the action object using the 'action' key
    if (actionObj.action && typeof actionObj[actionObj.action] === 'function') {
      actionObj[actionObj.action](data);
    } 
    // 2. Fallback: if 'action' string matches a function in params (legacy support)
    else if (actionObj.action && typeof actionParams[actionObj.action] === 'function') {
      actionParams[actionObj.action](data);
    }
    // 3. Fallback: Check common naming patterns if 'action' was just 'edit' or 'delete'
    else if (actionObj.action === 'edit' && typeof actionObj.onEdit === 'function') {
      actionObj.onEdit(data);
    }
    else if (actionObj.action === 'delete' && typeof actionObj.onDelete === 'function') {
      actionObj.onDelete(data);
    }
  }
}
