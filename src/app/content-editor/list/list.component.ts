import { Component, ComponentRef, EventEmitter, input, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ListItemComponent } from '../list-item/list-item.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgClass],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  // Event Emitters
  @Output() addComponent = new EventEmitter();
  @Output() deleteComponent = new EventEmitter();
  
  @ViewChild('listElement', { read: ViewContainerRef, static: true }) listElement!: ViewContainerRef;
  @Input() componentBefore: string = 'NONE';

  isOrdered: boolean = false;
  id: string = '';
  listItemCount: number = 1;

  private listItems: ComponentRef<ListItemComponent>[] = [];
  private listItemsIds: Array<string> = [];

  renderNewList() {
    this.addListItem(0);
  }

  changeTypeToOrdered() {
    this.isOrdered = true;
  }

  setId(id: string) {
    this.id = id;
  }

  setData(data: any) {
    if (data) {
      // set data
    }
  }

  addListItem(index: number, data: any = null) {
    const componentRef = this.listElement.createComponent(ListItemComponent, { index });

    let liID= `${this.id}-lsi-${this.listItemCount++}`;

    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.setId(liID);
      if (data) {
        componentRef.instance.setData(data);
      }
    }, 0);

    this.listItems.splice(index, 0, componentRef);
    this.listItemsIds.splice(index, 0, );
    this.suscribeListItemEvents(componentRef);
  }

  suscribeListItemEvents(componentRef: ComponentRef<ListItemComponent>) {
    componentRef.instance.addListItem.subscribe((content) => {
      let index = this.listItems.indexOf(componentRef);
      if (content) {
        this.addListItem(index + 1, content);
      }
      else {
        this.addListItem(index + 1);
      }
    });

    componentRef.instance.deleteListItem.subscribe((content) => {
      let index = this.listItems.indexOf(componentRef);
      if (content) {
        this.removeListItem(index, content);
      }
      else {
        this.removeListItem(index);
      }
    });

    setTimeout(() => {
      componentRef.instance.focus();
    }, 0);
  }

  removeListItem(index: number, data: any = null) {
    const component = this.listItems.splice(index, 1)[0];
    this.listItemsIds.splice(index, 1);
    component.instance.addListItem.unsubscribe();
    component.instance.deleteListItem.unsubscribe();
    this.listElement.remove(index);
    // setTimeout(() => {
    //   this.listItems[index - 1].instance.placeCursorAtEnd();
    //   if (data) {
    //     this.components[index - 1].instance.addContentAtEnd(data);
    //   }
    // }, 0);
  }
}
