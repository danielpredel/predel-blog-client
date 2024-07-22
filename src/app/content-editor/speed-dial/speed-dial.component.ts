import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-speed-dial',
  standalone: true,
  imports: [NgIf],
  templateUrl: './speed-dial.component.html',
  styleUrl: './speed-dial.component.css'
})
export class SpeedDialComponent {
  @Input() open: boolean = false;
  @Output() statusChage = new EventEmitter<boolean>();
  @Output() selection = new EventEmitter<string>();

  toggleMenu() {
    if (this.open) {
      this.statusChage.emit(false);
    }
    else {
      this.statusChage.emit(true);
    }
  }

  setSection(type: string) {
    this.statusChage.emit(false);
    this.selection.emit(type);
  }
}