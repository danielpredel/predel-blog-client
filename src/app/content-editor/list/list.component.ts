import { Component, ComponentRef, EventEmitter, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ListItemComponent } from '../list-item/list-item.component';
import { StaticIdService } from '../static-id.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgClass],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  // Event Emitters
  @Output() addComponent = new EventEmitter<void>();
  @Output() changeComponent = new EventEmitter<any>();
  @Output() splitComponent = new EventEmitter<any>();
  @Output() focused = new EventEmitter();

  // DOM
  @ViewChild('listElement', { read: ViewContainerRef, static: true }) listElement!: ViewContainerRef;

  // Local Varibles
  id: string = '';
  ordered: boolean = false;

  private listItems: ComponentRef<ListItemComponent>[] = [];
  private listItemsIds: Array<string> = [];

  constructor(private idService: StaticIdService) { }

  // Event Functions
  onTooltipSelection(selection: any) {
    let listItemId = selection.ancestorId.substring(0, 34);
    let index = this.listItemsIds.indexOf(listItemId);
    if (index > -1) {
      let componentRef = this.listItems[index];
      componentRef.instance.onTooltipSelection(selection);
    }
  }

  // Setters
  setId(id: string) {
    this.id = id;
  }

  setData(data: Array<any>, renderMode: boolean = false) {
    if (data.length > 0) {
      data.forEach((element, index) => {
        this.addListItem(index, element, renderMode);
      });
    }
  }

  // Should receive an Array
  setDataAtEnd(data: Array<any>) {
    let index = this.listItems.length - 1;
    if (index >= 0) {
      this.listItems[index].instance.setData(data);
    }
  }

  // Getters
  getListType() {
    return this.ordered ? 'OL' : 'UL';
  }

  getData(): Array<any> {
    let data = Array();
    this.listItems.forEach(listItem => {
      data.push(listItem.instance.getData())
    });
    return data;
  }

  // Funtions
  mixList(data: Array<any>) {
    let index = this.listItems.length;
    data.forEach(listItem => {
      this.addListItem(index++, listItem, true);
    })
  }

  renderNewList() {
    this.addListItem(0);
  }

  placeCursorAtEnd() {
    let index = this.listItems.length - 1;
    if (index >= 0) {
      this.listItems[index].instance.placeCursorAtEnd();
    }
  }

  // List Type Functions
  changeTypeToOrdered() {
    this.ordered = true;
  }

  isOrdered() {
    return this.ordered;
  }

  // List Item Functions
  // silence mode: doesn't focus the new added component
  addListItem(index: number, data: Array<any> = [], renderMode: boolean = false) {
    const componentRef = this.listElement.createComponent(ListItemComponent, { index });

    let liID = `${this.id}-ListItem-${this.idService.getId()}`;

    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.setId(liID);
      if (data.length > 0) {
        componentRef.instance.setData(data);
      }
    }, 0);

    this.listItems.splice(index, 0, componentRef);
    this.listItemsIds.splice(index, 0, liID);
    this.suscribeListItemEvents(componentRef, renderMode);
  }

  removeListItem(index: number) {
    const component = this.listItems.splice(index, 1)[0];
    this.listItemsIds.splice(index, 1);
    component.instance.addListItem.unsubscribe();
    component.instance.deleteListItem.unsubscribe();
    component.instance.changeListItem.unsubscribe();
    component.instance.focused.unsubscribe();
    this.listElement.remove(index);
  }

  suscribeListItemEvents(componentRef: ComponentRef<ListItemComponent>, renderMode: boolean = false) {
    componentRef.instance.addListItem.subscribe((data) => {
      let index = this.listItems.indexOf(componentRef);
      let emitAddEvent = false;
      if (this.listItems.length == 1) {
        if (data.length == 0 && this.listItems[index].instance.isEmpty()) {
          this.changeComponent.emit();
        }
        else {
          emitAddEvent = true;
        }
      }
      else {
        if (data.length == 0 && this.listItems[index].instance.isEmpty()) {
          this.removeListItem(index);
          this.addComponent.emit();
        }
        else {
          emitAddEvent = true;
        }
      }
      if (emitAddEvent) {
        this.addListItem(index + 1, data);
      }
    });

    componentRef.instance.changeListItem.subscribe((elementType) => {
      let index = this.listItems.indexOf(componentRef);
      let listType = this.getListType();
      let data = Array();
      for (let i = index; i < this.listItems.length; i++) {
        data.push(this.listItems[i].instance.getData());
      }
      if (index == 0) {
        this.changeComponent.emit({ listType, data, elementType });
      }
      else {
        for (let i = this.listItems.length - 1; i >= index; i--) {
          this.removeListItem(i);
        }
        this.splitComponent.emit({ listType, data, elementType });
      }
    });

    componentRef.instance.deleteListItem.subscribe(() => {
      let index = this.listItems.indexOf(componentRef);
      let listType = this.getListType();
      let data = Array();
      for (let i = index; i < this.listItems.length; i++) {
        data.push(this.listItems[i].instance.getData());
      }
      if (index == 0) {
        this.changeComponent.emit({ listType, data });
      }
      else {
        for (let i = this.listItems.length - 1; i >= index; i--) {
          this.removeListItem(i);
        }
        this.splitComponent.emit({ listType, data });
      }
    });

    componentRef.instance.focused.subscribe(() => {
      this.focused.emit();
    });

    if (!renderMode) {
      setTimeout(() => {
        componentRef.instance.focus();
      }, 0);
    }
  }
}
