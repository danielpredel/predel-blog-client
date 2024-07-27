import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgClass],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  @Input() isOrdered: boolean = false;

  toLink(range: Range, url: string) {

  }

  toUnlink(range: Range) {

  }
}
