import { Component, ComponentRef, EventEmitter, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ListItemComponent } from '../list-item/list-item.component';
import { IdService } from '../../id.service';

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
  componentBefore: string = 'NONE';
  id: string = '';
  ordered: boolean = false;

  private listItems: ComponentRef<ListItemComponent>[] = [];
  private listItemsIds: Array<string> = [];

  constructor(private idService: IdService) { }

  renderNewList() {
    this.addListItem(0);
  }

  changeTypeToOrdered() {
    this.ordered = true;
  }

  isOrdered() {
    return this.ordered;
  }

  setId(id: string) {
    this.id = id;
  }

  setData(data: any) {
    if (data) {
      // set data
    }
  }

  setComponentBefore(type: string) {
    this.componentBefore = type;
  }

  addListItem(index: number, data: any = null) {
    const componentRef = this.listElement.createComponent(ListItemComponent, { index });

    let liID = `${this.id}-lsi-${this.idService.getId()}`;

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
      if (this.listItems.length > 1 && index == this.listItems.length - 1) {
        if (this.listItems[index - 1].instance.isEmpty() && this.listItems[index].instance.isEmpty()) {
          emitAddEvent = true;
        }
      }
      if (emitAddEvent) {
        this.addComponent.emit();
      }
      else {
        if (content) {
          this.addListItem(index + 1, content);
        }
        else {
          this.addListItem(index + 1);
        }
      }
    });

    componentRef.instance.deleteListItem.subscribe((content) => {
      let index = this.listItems.indexOf(componentRef);
      if (this.listItems.length == 1) {
        if (content) {
          this.changeComponent.emit(content);
        }
        else {
          this.changeComponent.emit();
        }
      }
      if (content) {
        this.removeListItem(index, content);
      }
      else {
        this.removeListItem(index);
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
    // setTimeout(() => {
    //   this.listItems[index - 1].instance.placeCursorAtEnd();
    //   if (data) {
    //     this.components[index - 1].instance.addContentAtEnd(data);
    //   }
    // }, 0);
  }

  toLink(text: string, range: Range, url: string, listItemId: string) {
    let index = this.listItemsIds.indexOf(listItemId);
    if (index >= 0) {
      this.listItems[index].instance.toLink(text, range, url);
    }
  }

  toUnlink(range: Range, listItemId: string) {
    let targetId = listItemId.substring(0, 29);
    let index = this.listItemsIds.indexOf(targetId);
    if (index >= 0) {
      if (listItemId.includes('anchor')) {
        this.listItems[index].instance.toUnlink(range, listItemId);
      }
      this.listItems[index].instance.toUnlink(range);
    }
  }
}
