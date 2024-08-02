import { Component, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ListComponent } from '../list/list.component';
import { TextComponent } from "../text/text.component";
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { IdService } from '../../id.service';
import { TooltipComponent } from "../tooltip/tooltip.component";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [NgIf, NgClass, NgStyle, TooltipComponent, ListComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {
  // Element's Varibles
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild(TooltipComponent) tooltip!: TooltipComponent;

  private components: ComponentRef<any>[] = [];
  private componentsIds: Array<string> = [];

  selectionString: string | undefined;
  selectionRange: Range | undefined;
  selectionTargetId: string = '';

  constructor(private idService: IdService) { }

  ngOnInit() {
    // Get the post id
    // Depending on the requests answer:
    // + New:   body will be empty  -> newPostRender()
    // + Edit:  body will have data -> editPostRender()
    // + 403:   forbiden go to main page or not found
    this.renderNewPost();
  }

  // Event's functions
  onMouseUp() {
    const selection = window.getSelection();
    if (selection) {
      this.handleSelection(selection);
    }
  }

  onMouseDown() {
    this.tooltip.hide();
    this.hideSelection();
  }

  onTooltipSelection(selection: any) {
    if (selection.operation != 'close-link') {
      const targetIndex = this.componentsIds.indexOf(this.selectionTargetId);
      const targetComponentRef = this.components[targetIndex];
      const commonAncestorElement = this.getCommonAncestorElement();
      if (targetComponentRef.location.nativeElement.contains(commonAncestorElement)) {
        if (targetComponentRef.componentType === TextComponent) {
          switch (selection.operation) {
            case 'toTitle':
              targetComponentRef.instance.toTitle();
              break;
            case 'toSubtitle':
              targetComponentRef.instance.toSubtitle();
              break;
            case 'toParagraph':
              targetComponentRef.instance.toParagraph();
              break;
            case 'toLink':
              targetComponentRef.instance.toLink(this.selectionString, this.selectionRange, selection.url);
              break;
            case 'toUnlink':
              targetComponentRef.instance.toUnlink(this.selectionRange);
              break;
          }
        }
        else if (targetComponentRef.componentType === ListComponent) {
          switch (selection.operation) {
            case 'toLink':
              targetComponentRef.instance.toLink(this.selectionString, this.selectionRange, selection.url);
              break;
            case 'toUnlink':
              targetComponentRef.instance.toUnlink(this.selectionRange);
              break;
          }
        }
      }
    }
  }

  // Functions
  handleSelection(selection: Selection) {
    this.selectionString = selection.toString();
    if (this.selectionString.length > 0) {
      this.selectionRange = selection?.getRangeAt(0);
      const ancestorId = this.getCommonAncestorsId();

      if (ancestorId && ancestorId.length >= 14) {
        this.selectionTargetId = ancestorId.substring(0, 14);
        switch (true) {
          case ancestorId?.includes('txt'):
            switch (true) {
              case ancestorId?.includes('Paragraph'):
                if (ancestorId?.includes('anchor')) {
                  this.tooltip.setConfig('onLinkedParagraph');
                }
                else {
                  if (this.selectionRange.startContainer === this.selectionRange.endContainer) {
                    this.tooltip.restoreConfig();
                  }
                  else {
                    this.tooltip.setConfig('onLinkedParagraph');
                  }
                }
                break;
              case ancestorId?.includes('Title'):
                this.tooltip.setConfig('onTitle');
                break;
              case ancestorId?.includes('Subtitle'):
                this.tooltip.setConfig('onSubtitle');
                break;
            }
            this.tooltip.setClientRect(this.selectionRange.getBoundingClientRect());
            this.tooltip.placeForOptions();
            break;
          case ancestorId?.includes('lsi'):
            if (ancestorId?.includes('anchor')) {
              this.tooltip.setConfig('onLinkedListItem');
            }
            else {
              if (this.selectionRange.startContainer === this.selectionRange.endContainer) {
                this.tooltip.setConfig('onListItem');
              }
              else {
                this.tooltip.setConfig('onLinkedListItem');
              }
            }
            this.tooltip.setClientRect(this.selectionRange.getBoundingClientRect());
            this.tooltip.placeForOptions();
            break;
        }
      }
    }
  }

  hideSelection() {
    window.getSelection()?.removeAllRanges();
  }

  getCommonAncestorsId() {
    const commonAncestor = this.selectionRange?.commonAncestorContainer as Element;
    const commonAncestorElement = commonAncestor?.nodeType !== 1 ? commonAncestor?.parentElement : commonAncestor;
    return commonAncestorElement?.id;
  }

  getCommonAncestorElement() {
    const commonAncestor = this.selectionRange?.commonAncestorContainer as Element;
    return commonAncestor?.nodeType !== 1 ? commonAncestor?.parentElement : commonAncestor;
  }

  renderNewPost() {
    this.addTextComponent(0);
    this.components[0].instance.toTitle();
  }

  addTextComponent(index: number, data: any = null) {
    const componentRef = this.container.createComponent(TextComponent, { index });

    let id = this.idService.getId();
    let ids = Array();
    ids.push(`txt-${id}`);
    ids.push(`txt-${id}-Title`);
    ids.push(`txt-${id}-Subtitle`);
    ids.push(`txt-${id}-Paragraph`);

    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.componentIds = ids;
      if (index > 0) {
        switch (this.components[index - 1].componentType) {
          case TextComponent:
            componentRef.instance.componentBefore = 'TEXT';
            break;
          case ListComponent:
            componentRef.instance.componentBefore = 'LIST';
            break;
        }
      }
      if(index < this.components.length - 1){
        this.components[index + 1].instance.componentBefore = 'TEXT';
      }
      if (data) {
        componentRef.instance.data = data;
      }
    }, 0);

    this.components.splice(index, 0, componentRef);
    this.componentsIds.splice(index, 0, ids[0]);
    this.subscribeTextComponentEvents(componentRef);
  }

  subscribeTextComponentEvents(componentRef: ComponentRef<TextComponent>) {
    componentRef.instance.addComponent.subscribe((content) => {
      let index = this.components.indexOf(componentRef);
      if (content) {
        this.addTextComponent(index + 1, content);
      }
      else {
        this.addTextComponent(index + 1);
      }
    });

    componentRef.instance.deleteComponent.subscribe((content) => {
      let index = this.components.indexOf(componentRef);
      if (content) {
        this.removeTextComponent(index, content);
      }
      else {
        this.removeTextComponent(index);
      }
    });

    componentRef.instance.changeComponent.subscribe((componentType) => {
      let index = this.components.indexOf(componentRef);
      this.changeTextComponent(index, componentType);
    });

    setTimeout(() => {
      componentRef.instance.focus();
    }, 0);
  }

  removeTextComponent(index: number, data: any = null) {
    const component = this.components.splice(index, 1)[0];
    this.componentsIds.splice(index, 1);
    component.instance.addComponent.unsubscribe();
    component.instance.deleteComponent.unsubscribe();
    component.instance.changeComponent.unsubscribe();
    this.container.remove(index);
    setTimeout(() => {
      this.components[index - 1].instance.placeCursorAtEnd();
      if (data) {
        this.components[index - 1].instance.addContentAtEnd(data);
      }
    }, 0);
  }

  changeTextComponent(index: number, componentType: string) {
    setTimeout(() => {
      const component = this.components.splice(index, 1)[0];
      this.componentsIds.splice(index, 1);
      component.instance.addComponent.unsubscribe();
      component.instance.deleteComponent.unsubscribe();
      component.instance.changeComponent.unsubscribe();
      this.container.remove(index);
    }, 0)
    // this.container.detach(index);
    switch (componentType) {
      case 'UL' || 'OL':
        break;
      case 'IMAGE':
        break;
      case 'CODE-SNIPPET':
        break;
    }
    this.addListComponent(index, componentType);
  }

  addListComponent(index: number, type: string) {
    const componentRef = this.container.createComponent(ListComponent, { index });
    if (type == 'OL') {
      componentRef.instance.isOrdered = true;
    }
    this.components.splice(index, 0, componentRef);

    // componentRef.instance.newComponent.subscribe(() => {
    //   const componentIndex = this.components.indexOf(componentRef);
    //   this.addComponentAtIndex(componentIndex + 1, 'P');
    // });
    // componentRef.instance.deleteMe.subscribe(() => {
    //   const componentIndex = this.components.indexOf(componentRef);
    //   this.removeComponentAtIndex(componentIndex);
    // });

    // setTimeout(() => {
    //   this.components[index - 1].instance.blur();
    //   componentRef.instance.focus();
    // }, 0);
  }
}
