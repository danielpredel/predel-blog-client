import { Component, ComponentRef, ElementRef, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { ParagraphComponent } from '../paragraph/paragraph.component';
import { ListComponent } from '../list/list.component';
import { TextComponent } from "../text/text.component";
import { TooltipComponent } from "../tooltip/tooltip.component";
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { IdService } from '../../id.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [TextComponent, TooltipComponent, NgIf, NgClass, NgStyle],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {
  // Tooltip variables
  tooltipVisible: boolean = false;
  tooltipLeft: number = 0;
  tooltipTop: number = 0;
  tooltipLink = { disabled: false, selected: false };
  tooltipTitle = { disabled: false, selected: false };
  tooltipSubtitle = { disabled: false, selected: false };
  tooltipTarget: string = '';

  // Element's Varibles
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  private components: ComponentRef<any>[] = [];
  private componentsIds: Array<string> = [];
  commonAncestorElement: Element | null | undefined;

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
      if (selection.toString().length == 0) {
        this.tooltipVisible = false;
      }
      else {
        const commonAncestor = selection?.getRangeAt(0).commonAncestorContainer as Element;
        this.commonAncestorElement = commonAncestor?.nodeType !== 1 ? commonAncestor?.parentElement : commonAncestor;
        const ancestorId = this.commonAncestorElement?.id;
        if (ancestorId) {
          if (ancestorId.length >= 14) {
            this.tooltipTarget = ancestorId.substring(0, 14);

            this.restoreTooltip();
            switch (true) {
              case ancestorId?.includes('txt'):
                switch (true) {
                  case ancestorId?.includes('Paragraph'):
                    break;
                  case ancestorId?.includes('Title'):
                    this.tooltipLink.disabled = true;
                    this.tooltipTitle.selected = true;
                    break;
                  case ancestorId?.includes('Subtitle'):
                    this.tooltipLink.disabled = true;
                    this.tooltipSubtitle.selected = true;
                    break;
                }
                this.showTooltip();
                break;
              case ancestorId?.includes('lsi'):
                this.tooltipTitle.disabled = true;
                this.tooltipSubtitle.disabled = true;
                this.showTooltip();
                break;
            }
          }
        }
      }
    }
    else {
      this.tooltipVisible = false;
    }
  }

  onMouseDown() {
    window.getSelection()?.removeAllRanges();
  }

  onTooltipSelection(type: string) {
    let targetIndex = this.componentsIds.indexOf(this.tooltipTarget)
    if (targetIndex > -1) {
      if (this.components[targetIndex].location.nativeElement.contains(this.commonAncestorElement)) {
        switch (type) {
          case 'link':
            break;
          case 'title':
            if (!this.tooltipTitle.disabled) {
              if (this.tooltipTitle.selected) {
                this.components[targetIndex].instance.toParagraph();
              }
              else {
                this.components[targetIndex].instance.toTitle();
              }
            }
            break;
          case 'subtitle':
            if (!this.tooltipSubtitle.disabled) {
              if (this.tooltipSubtitle.selected) {
                this.components[targetIndex].instance.toParagraph();
              }
              else {
                this.components[targetIndex].instance.toSubtitle();
              }
            }
            break;
        }
      }
    }
    this.tooltipVisible = false;
  }

  // Functions
  restoreTooltip() {
    this.tooltipLink = { disabled: false, selected: false };
    this.tooltipTitle = { disabled: false, selected: false };
    this.tooltipSubtitle = { disabled: false, selected: false };
  }

  showTooltip() {
    const clientRect = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
    if (clientRect) {
      this.tooltipLeft = clientRect.right - (clientRect.right - clientRect.left) / 2 - 51;
      this.tooltipTop = clientRect.top - 45;
      this.tooltipVisible = true;
    }
    else {
      this.tooltipVisible = false;
    }
  }

  renderNewPost() {
    this.addTextComponent(0);
    this.components[0].instance.toTitle();
  }

  renderEditPost() {}

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
      this.componentsIds.push(ids[0]);
    }
    else {
      this.components.splice(index, 0, componentRef);
      this.componentsIds.splice(index, 0, ids[0]);

      componentRef.instance.deleteComponent.subscribe(() => {
        this.removeTextComponent(index);
      });
    }

    componentRef.instance.addComponent.subscribe(() => {
      this.addTextComponent(index + 1);
    });
    // if (index > 0) {
    //   componentRef.instance.deleteComponent.subscribe(() => {
    //     this.removeTextComponent(index);
    //   });
    // }
    componentRef.instance.changeComponent.subscribe((componentType) => {
      this.changeTextComponent(index, componentType);
    });
    setTimeout(() => {
      if (index > 0) {
        this.components[index - 1].instance.blur();
      }
      componentRef.instance.focus();
    }, 0);
  }

  addComponent(type: string) {
    const componentRef = this.container.createComponent(ParagraphComponent);
    this.components.push(componentRef);

    componentRef.instance.newComponent.subscribe(() => {
      this.addComponentAtIndex(1, 'P');
    });
    // componentRef.instance.deleteMe.subscribe(() => {
    //   this.removeComponentAtIndex(0);
    // });
    componentRef.instance.changeElement.subscribe((componentType) => {
      this.changeComponentAtIndex(0, componentType);
    });
    setTimeout(() => {
      this.components[0].instance.blur();
      componentRef.instance.focus()
    }, 0);
  }

  addComponentAtIndex(index: number, type: string) {
    const componentRef = this.container.createComponent(ParagraphComponent, { index });
    this.components.splice(index, 0, componentRef);
    const componentIndex = this.components.indexOf(componentRef);
    componentRef.instance.newComponent.subscribe(() => {
      this.addComponentAtIndex(componentIndex + 1, 'P');
    });
    if (componentIndex > 0) {
      componentRef.instance.deleteMe.subscribe(() => {
        this.removeComponentAtIndex(componentIndex);
      });
    }
    componentRef.instance.changeElement.subscribe((componentType) => {
      this.changeComponentAtIndex(componentIndex, componentType)
    });

    setTimeout(() => {
      this.components[index - 1].instance.blur();
      componentRef.instance.focus()
    }, 0);
  }

  removeTextComponent(index: number) {

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
