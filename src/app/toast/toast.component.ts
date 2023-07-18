import { Component, EventEmitter, Input, Output } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('toastAnimation', [
      state('show', style({ opacity: 1, transform: 'translateX(0)' })),
      state('hide', style({ opacity: 0 })),
      transition('hide => show', [
        style({ opacity: 0, transform: 'translateX(calc(100% + 32px))' }),
        animate('500ms cubic-bezier(0.23, 1, 0.32, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition('show => hide', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent {
  showToast = false;
  toastTitle = '';
  toastMessage = '';
  toastType = 'info';
  toastDuration = 3000;

  showToastMessage(title: string, message: string, type: string): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, this.toastDuration);
  }

  getToastIconClass(): string {
    const icons: { [key: string]: string } = {
      success: 'fas fa-check-circle',
      info: 'fas fa-info-circle',
      warning: 'fas fa-exclamation-circle',
      error: 'fas fa-exclamation-circle'
    };
    return icons[this.toastType];
  }

  hideToast(): void {
    this.showToast = false;
  }

}