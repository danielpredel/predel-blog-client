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
  @Output() addComponent = new EventEmitter();
  @Output() changeComponent = new EventEmitter();
  @Output() splitComponent = new EventEmitter();
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
    // lst-1234567890-ListItem-1234567890 -> 34
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

  setData(data: Array<any>) {
    if (data) {
      data.forEach((element, index) => {
        this.addListItem(index, element);
      });
    }
  }

  setDataAtEnd(data: any) {

  }

  // Getters
  getListType() {
    return this.ordered ? 'OL' : 'UL';
  }

  // Funtions
  renderNewList() {
    this.addListItem(0);
  }

  placeCursorAtEnd() {

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
  addListItem(index: number, data: any = null) {
    const componentRef = this.listElement.createComponent(ListItemComponent, { index });

    let liID = `${this.id}-ListItem-${this.idService.getId()}`;

    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.setId(liID);
      if (data) {
        componentRef.instance.setData(data);
      }
    }, 0);

    this.listItems.splice(index, 0, componentRef);
    this.listItemsIds.splice(index, 0, liID);
    this.suscribeListItemEvents(componentRef);
  }

  suscribeListItemEvents(componentRef: ComponentRef<ListItemComponent>) {
    componentRef.instance.addListItem.subscribe((content) => {
      let index = this.listItems.indexOf(componentRef);
      let emitAddEvent = false;
      if (this.listItems.length == 1) {
        if (!content && this.listItems[index].instance.isEmpty()) {
          this.changeComponent.emit();
        }
        else {
          emitAddEvent = true;
        }
      }
      else {
        if (!content && this.listItems[index].instance.isEmpty()) {
          this.removeListItem(index);
          this.addComponent.emit();
        }
        else {
          emitAddEvent = true;
        }
      }
      if (emitAddEvent) {
        if (content) {
          this.addListItem(index + 1, content);
        }
        else {
          this.addListItem(index + 1);
        }
      }
    });

    componentRef.instance.deleteListItem.subscribe(() => {
      let index = this.listItems.indexOf(componentRef);
      let listType = this.getListType();
      let data = Array();
      for (let i = index; i < this.listItems.length; i++) {
        data.push({ content: this.listItems[i].instance.getData() });
      }
      if (index == 0) {
        this.changeComponent.emit({ listType, data });
        // The editor will delete the list component
      }
      else {
        for (let i = this.listItems.length - 1; i == index; i--) {
          this.removeListItem(i);
        }
        this.splitComponent.emit({ listType, data });
      }
    });

    componentRef.instance.focused.subscribe(() => {
      this.focused.emit();
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
    setTimeout(() => {
      this.listItems[index - 1].instance.placeCursorAtEnd();
      if (data) {
        this.listItems[index - 1].instance.setDataAtEnd(data);
      }
    }, 0);
  }
}
