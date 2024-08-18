import { Component, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ListComponent } from '../list/list.component';
import { TextComponent } from "../text/text.component";
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { TooltipComponent } from "../tooltip/tooltip.component";
import { ImageComponent } from "../image/image.component";
import { StaticIdService } from '../static-id.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [NgIf, NgClass, NgStyle, TooltipComponent, ListComponent, ImageComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {
  // DOM Manipulation Varibles
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild(TooltipComponent) tooltip!: TooltipComponent;

  // ComponentRef inside the ViewContainerRef and their Ids
  private components: ComponentRef<any>[] = [];
  private componentsIds: Array<string> = [];
  private lastFocusedComponent: number = 0;

  constructor(private idService: StaticIdService) { }

  ngOnInit() {
    // Get the post id
    // Depending on the requests answer:
    // + New:   body will be empty  -> newPostRender()
    // + Edit:  body will have data -> editPostRender()
    // + 403:   forbiden go to main page or not found
    this.renderNewPost();
  }

  // Event Functions
  onMouseUp() {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      this.tooltip.onWindowSelection(selection);
    }
  }

  onMouseDown() {
    this.tooltip.hide();
    this.hideWindowSelection();
  }

  onTooltipSelection(selection: any) {
    let componentId = selection.ancestorId.substring(0, 14);
    let index = this.componentsIds.indexOf(componentId);
    if (index > -1) {
      let componentRef = this.components[index];
      if (componentRef.componentType === TextComponent || componentRef.componentType === ListComponent) {
        componentRef.instance.onTooltipSelection(selection);
      }
    }
  }

  // Setters
  setComponentBefore() {
    this.components.forEach((componentRef, index) => {
      if (componentRef.componentType !== ListComponent) {
        if (index > 0) {
          switch (this.components[index - 1].componentType) {
            case TextComponent:
              this.components[index].instance.setComponentBefore('TEXT');
              break;
            case ListComponent:
              this.components[index].instance.setComponentBefore('LIST');
              break;
            // case ImageComponent:
            //   this.components[index].instance.setComponentBefore('IMAGE');
            //   break;
            // case CodeSnippetComponent:
            //   this.components[index].instance.setComponentBefore('CODE-SNIPPET');
            //   break;
          }
        }
        else {
          this.components[index].instance.setComponentBefore('NONE');
        }
      }
    });
  }

  // Functions
  hideWindowSelection() {
    window.getSelection()?.removeAllRanges();
  }

  renderNewPost() {
    this.addTextComponent(0, [], 'TITLE');
  }

  // Text Component Functions
  addTextComponent(index: number, data: Array<any> = [], elementType: string = 'PARAGRAPH') {
    const componentRef = this.container.createComponent(TextComponent, { index });

    let id = this.idService.getId();
    let ids = Array();
    ids.push(`txt-${id}`);
    ids.push(`txt-${id}-Title`);
    ids.push(`txt-${id}-Subtitle`);
    ids.push(`txt-${id}-Paragraph`);

    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.setId(ids);
      if (elementType != 'PARAGRAPH') {
        componentRef.instance.setElementType(elementType);
      }
      componentRef.instance.setData(data);
    }, 0);

    this.components.splice(index, 0, componentRef);
    this.componentsIds.splice(index, 0, ids[0]);
    this.subscribeTextComponentEvents(componentRef);
  }

  changeTextComponent(index: number, componentType: string) {
    const component = this.components.splice(index, 1)[0];
    this.componentsIds.splice(index, 1);
    component.instance.addComponent.unsubscribe();
    component.instance.deleteComponent.unsubscribe();
    component.instance.changeComponent.unsubscribe();
    component.instance.focused.unsubscribe();
    this.container.remove(index);

    switch (componentType) {
      case 'UL':
        this.addListComponent(index, componentType);
        break;
      case 'OL':
        this.addListComponent(index, componentType);
        break;
      case 'IMAGE':
        break;
      case 'CODE-SNIPPET':
        break;
    }
  }

  removeTextComponent(index: number, data: Array<any>) {
    const component = this.components.splice(index, 1)[0];
    this.componentsIds.splice(index, 1);
    component.instance.addComponent.unsubscribe();
    component.instance.deleteComponent.unsubscribe();
    component.instance.changeComponent.unsubscribe();
    component.instance.focused.unsubscribe();
    this.container.remove(index);
    setTimeout(() => {
      // For text and list components will be allowed to place the cursor at the end and add data
      // but for image, it only focus the image
      this.components[index - 1].instance.placeCursorAtEnd();
      this.components[index - 1].instance.setDataAtEnd(data);
    }, 0);
  }

  subscribeTextComponentEvents(componentRef: ComponentRef<TextComponent>) {
    componentRef.instance.addComponent.subscribe((data) => {
      let index = this.components.indexOf(componentRef);
      this.addTextComponent(index + 1, data);
      this.setComponentBefore();
    });

    componentRef.instance.changeComponent.subscribe((componentType) => {
      let index = this.components.indexOf(componentRef);
      this.changeTextComponent(index, componentType);
      this.setComponentBefore();
    });

    componentRef.instance.deleteComponent.subscribe((data) => {
      let index = this.components.indexOf(componentRef);
      this.removeTextComponent(index, data);
      this.setComponentBefore();
    });

    componentRef.instance.focused.subscribe(() => {
      let index = this.components.indexOf(componentRef);
      if (this.lastFocusedComponent < this.container.length
        && this.components[this.lastFocusedComponent].componentType === TextComponent) {
        this.components[this.lastFocusedComponent].instance.hideSpeedDial();
      }
      this.lastFocusedComponent = index;
    });

    setTimeout(() => {
      componentRef.instance.focus();
    }, 0);
  }

  // List Component Functions
  addListComponent(index: number, type: string, data: Array<any> = [], renderMode: boolean = false) {
    const componentRef = this.container.createComponent(ListComponent, { index });
    let id = this.idService.getId();
    let listId = `lst-${id}`;
    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.setId(listId);
      if (type == 'OL') {
        componentRef.instance.changeTypeToOrdered();
      }
      if (data.length > 0) {
        componentRef.instance.setData(data, renderMode);
      }
      else {
        componentRef.instance.renderNewList();
      }
    }, 0);

    this.components.splice(index, 0, componentRef);
    this.componentsIds.splice(index, 0, listId);
    this.subscribeListComponentEvents(componentRef);
  }

  changeListComponent(index: number, content: any) {
    const component = this.components.splice(index, 1)[0];
    this.componentsIds.splice(index, 1);
    component.instance.addComponent.unsubscribe();
    component.instance.changeComponent.unsubscribe();
    component.instance.splitComponent.unsubscribe();
    component.instance.focused.unsubscribe();

    // Delete the component
    this.container.remove(index);

    if (content) {
      let data = content?.data as Array<any>;
      if (data.length > 0) {
        let textData = data[0];
        if (data.length > 1) {
          let listData = data.slice(1);
          let listType = content?.listType;
          if (content.elementType) {
            this.addTextComponent(index, textData, content.elementType);
          }
          else {
            this.addTextComponent(index, textData);
          }
          this.addListComponent(index + 1, listType, listData, true);
        }
        else {
          this.addTextComponent(index, textData);
        }
      }
    }
    else {
      this.addTextComponent(index);
    }
  }

  splitListComponent(index: number, content: any) {
    if (content) {
      let data = content?.data as Array<any>;
      if (data.length > 0) {
        let textData = data[0];
        if (data.length > 1) {
          let listData = data.slice(1);
          let listType = content?.listType;
          if (content.elementType) {
            this.addTextComponent(index + 1, textData, content.elementType);
          }
          else {
            this.addTextComponent(index + 1, textData);
          }
          this.addListComponent(index + 2, listType, listData, true);
        }
        else {
          this.addTextComponent(index + 1, textData);
        }
      }
    }
    else {
      this.addTextComponent(index + 1);
    }
  }

  subscribeListComponentEvents(componentRef: ComponentRef<ListComponent>) {
    componentRef.instance.addComponent.subscribe(() => {
      let index = this.components.indexOf(componentRef);
      this.addTextComponent(index + 1);
      this.setComponentBefore();
    });

    componentRef.instance.changeComponent.subscribe((content) => {
      let index = this.components.indexOf(componentRef);
      this.changeListComponent(index, content);
      this.setComponentBefore();
    });

    componentRef.instance.splitComponent.subscribe((content) => {
      let index = this.components.indexOf(componentRef);
      this.splitListComponent(index, content);
      this.setComponentBefore();
    });

    componentRef.instance.focused.subscribe(() => {
      let index = this.components.indexOf(componentRef);
      if (this.lastFocusedComponent < this.container.length
        && this.components[this.lastFocusedComponent].componentType === TextComponent) {
        this.components[this.lastFocusedComponent].instance.hideSpeedDial();
      }
      this.lastFocusedComponent = index;
    });
  }
}
