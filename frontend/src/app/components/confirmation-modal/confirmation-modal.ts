import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css'
})
export class ConfirmationModalComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Success';
  @Input() message: string = '';
  @Input() details: any = null;
  @Input() confirmButtonText: string = 'Continue';
  @Output() onConfirm = new EventEmitter<void>();

  confirm(): void {
    this.onConfirm.emit();
  }
}
