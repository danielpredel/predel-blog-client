import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-speed-dial',
  standalone: true,
  imports: [NgIf],
  templateUrl: './speed-dial.component.html',
  styleUrl: './speed-dial.component.css'
})
export class SpeedDialComponent {
  open: boolean = false;
  @Output() selection = new EventEmitter<string>();

  openMenu() {
    this.open = true;
  }

  closeMenu() {
    this.open = false;
  }

  setSection(type: string) {
    this.closeMenu();
    this.selection.emit(type);
  }
}