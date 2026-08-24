import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() title = 'No Employees Found';
  @Input() message = 'No employee records matched your search or filter criteria. Try clearing your filters.';
  @Input() icon = 'search_off';
  @Input() showResetButton = false;
  @Input() resetButtonText = 'Clear Filters';

  @Output() reset = new EventEmitter<void>();

  onReset(): void {
    this.reset.emit();
  }
}
