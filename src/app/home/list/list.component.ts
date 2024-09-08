import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ListItemComponent } from '../list-item/list-item.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgClass],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  // DOM
  @ViewChild('list', { read: ViewContainerRef, static: true }) list!: ViewContainerRef;

  // Local Varibles
  ordered: boolean = false;

  setData(data: Array<any>) {
    if (data.length > 0) {
      data.forEach((element, index) => {
        this.addListItem(index, element);
      });
    }
  }

  isOrdered() {
    return this.ordered;
  }

  changeTypeToOrdered() {
    this.ordered = true;
  }

  // List Item Functions
  addListItem(index: number, data: Array<any> = []) {
    const componentRef = this.list.createComponent(ListItemComponent, { index });

    // Send the init data in case there's any
    setTimeout(() => {
      if (data.length > 0) {
        componentRef.instance.setData(data);
      }
    }, 0);
  }
}
