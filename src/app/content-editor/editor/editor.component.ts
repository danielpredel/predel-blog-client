import { Component, ComponentRef, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ListComponent } from '../list/list.component';
import { TextComponent } from "../text/text.component";
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { IdService } from '../../id.service';
import { TooltipComponent } from "../tooltip/tooltip.component";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [NgIf, NgClass, NgStyle, TooltipComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {
  // Element's Varibles
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild(TooltipComponent) tooltip!: TooltipComponent;

  private components: ComponentRef<any>[] = [];
  private componentsIds: Array<string> = [];

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

  onTooltipSelection(operation: any) {
    console.log(operation);
    // console.log(this.components[targetIndex].location.nativeElement.contains(this.commonAncestorElement))
  }

  // Functions
  handleSelection(selection: Selection) {
    if (selection.toString().length > 0) {
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

  restoreSelection() {
    console.log('a')
    const selection = window.getSelection();
    selection?.removeAllRanges();
    console.log(this.selectionRange)
    if (this.selectionRange) {
      selection?.addRange(this.selectionRange);
    }
  }

  getCommonAncestorsId() {
    const commonAncestor = this.selectionRange?.commonAncestorContainer as Element;
    const commonAncestorElement = commonAncestor?.nodeType !== 1 ? commonAncestor?.parentElement : commonAncestor;
    return commonAncestorElement?.id;
  }

  renderNewPost() {
    this.addTextComponent(0);
    // this.components[0].instance.toTitle();
  }

  renderEditPost() {
    // console.log();
    // 
  }

  addTextComponent(index: number, data: any = null) {
    const componentRef = this.container.createComponent(TextComponent, { index });

    let id = this.idService.getId();
    let ids = Array();
    ids.push(`txt-${id}`);
    ids.push(`txt-${id}-Title`);
    ids.push(`txt-${id}-Subtitle`);
    ids.push(`txt-${id}-Paragraph`);

    // Send the init data in case it exists
    setTimeout(() => {
      componentRef.instance.componentIds = ids;
      if (data) {
        componentRef.instance.data = data;
      }
    }, 0);

    if (index == 0) {
      this.components.push(componentRef);
      // console.log(componentRef.componentType === TextComponent);
      this.componentsIds.push(ids[0]);
    }
    else {
      this.components.splice(index, 0, componentRef);
      this.componentsIds.splice(index, 0, ids[0]);

      // Suscribe only if it's not the first Component in the ViewContainerRef 
      componentRef.instance.deleteComponent.subscribe(() => {
        this.removeTextComponent(index);
      });
    }

    componentRef.instance.addComponent.subscribe(() => {
      this.addTextComponent(index + 1);
    });
    componentRef.instance.changeComponent.subscribe((componentType) => {
      this.changeTextComponent(index, componentType);
    });

    setTimeout(() => {
      componentRef.instance.focus();
    }, 0);
  }

  // addComponent(type: string) {
  //   const componentRef = this.container.createComponent(ParagraphComponent);
  //   this.components.push(componentRef);

  //   componentRef.instance.newComponent.subscribe(() => {
  //     this.addComponentAtIndex(1, 'P');
  //   });
  //   // componentRef.instance.deleteMe.subscribe(() => {
  //   //   this.removeComponentAtIndex(0);
  //   // });
  //   componentRef.instance.changeElement.subscribe((componentType) => {
  //     this.changeComponentAtIndex(0, componentType);
  //   });
  //   setTimeout(() => {
  //     this.components[0].instance.blur();
  //     componentRef.instance.focus()
  //   }, 0);
  // }

  // addComponentAtIndex(index: number, type: string) {
  //   const componentRef = this.container.createComponent(ParagraphComponent, { index });
  //   this.components.splice(index, 0, componentRef);
  //   const componentIndex = this.components.indexOf(componentRef);
  //   componentRef.instance.newComponent.subscribe(() => {
  //     this.addComponentAtIndex(componentIndex + 1, 'P');
  //   });
  //   if (componentIndex > 0) {
  //     componentRef.instance.deleteMe.subscribe(() => {
  //       this.removeComponentAtIndex(componentIndex);
  //     });
  //   }
  //   componentRef.instance.changeElement.subscribe((componentType) => {
  //     this.changeComponentAtIndex(componentIndex, componentType)
  //   });

  //   setTimeout(() => {
  //     this.components[index - 1].instance.blur();
  //     componentRef.instance.focus()
  //   }, 0);
  // }

  removeTextComponent(index: number) {
    const component = this.components.splice(index, 1)[0];
    component.instance.deleteMe.unsubscribe();
    component.instance.newComponent.unsubscribe();
    this.container.remove(index);
    setTimeout(() => {
      this.components[index - 1].instance.focus();
      this.components[index - 1].instance.placeCursorAtEnd();
      // Add the tada after the cursor, in case there's any
    }, 0);
  }

  removeComponentAtIndex(index: number) {
    // if (index > 0) {
    const component = this.components.splice(index, 1)[0];
    component.instance.deleteMe.unsubscribe();
    component.instance.newComponent.unsubscribe();
    this.container.remove(index);
    setTimeout(() => {
      this.components[index - 1].instance.focus();
      this.components[index - 1].instance.placeCursorAtEnd();
      // Add the tada after the cursor, in case there's any
    }, 0);
    // }
  }

  changeComponentAtIndex(index: number, type: string) {
    // this.removeComponentAtIndex(index);
    this.container.detach(index);
    this.addListAtIndex(index, type);
  }

  changeTextComponent(index: number, newComponentType: string) {
    this.container.detach(index);
    this.addListAtIndex(index, newComponentType);
  }

  addListAtIndex(index: number, type: string) {
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
