import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NodeMakerService } from '../node-maker.service';

@Component({
  selector: 'app-list-item',
  standalone: true,
  imports: [],
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.css'
})
export class ListItemComponent {
  // Event Emitters
  @Output() addListItem = new EventEmitter();
  @Output() deleteListItem = new EventEmitter();
  @Output() changeListItem = new EventEmitter();
  @Output() focused = new EventEmitter();

  // DOM Manipulation Variables
  @ViewChild('editableListItem', { read: ElementRef }) editableListItem: ElementRef<HTMLLIElement> | undefined;

  // Local Varibles
  id: string | undefined;

  // link count variable
  childrenCount: number = 1;

  constructor(private nodeMakerService: NodeMakerService) { }

  // Event's functions
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      // let lenght = this.editableListItem?.nativeElement.textContent?.length;
      this.addListItem.emit();
      // if (lenght && lenght > 0) {
      //   let content = this.getContentAfterCursor();
      // // this.removeEmptyLinks();
      //   this.removeEmptyNodes();
      //   if (content) {
      //     this.addListItem.emit(content);
      //   }
      //   else {
      //     this.addListItem.emit();
      //   }
      // }
      // else {
      //   this.addListItem.emit();
      // }
    }
    else if (event.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection) {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range.startOffset == 0 && range.endOffset == 0) {
            let lenght = this.editableListItem?.nativeElement.textContent?.length;
            if (lenght && lenght > 0) {
              this.deleteListItem.emit();

              // let content = this.getContentAfterCursor();
              // if (content) {
              //   this.deleteListItem.emit(content);
              // }
              // else {
              //   this.deleteListItem.emit();
              // }
            }
            else {
              this.deleteListItem.emit();
            }
          }
        }
      }
    }
  }

  onFocus() {
    this.focused.emit();
  }

  onTooltipSelection(selection: any) {
    if (selection.range) {
      let ancestorElement = this.getCommonAncestorElement(selection.range);
      if (this.editableListItem && this.editableListItem.nativeElement.contains(ancestorElement)) {
        let operation = selection.operation;
        switch (operation) {
          case 'toTitle':
            this.toTitle();
            break;
          case 'toSubtitle':
            this.toSubtitle();
            break;
          case 'toParagraph':
            this.toParagraph();
            break;
          case 'addNode':
            this.addNode(selection);
            break;
          case 'removeNodes':
            this.removeNodes(selection);
            break;
        }
      }
    }
  }

  setId(id: string) {
    this.id = id;
  }

  setData(data: any) {
    if (data) {
      // set data
    }
  }

  focus() {
    if (this.editableListItem) {
      this.editableListItem.nativeElement.focus();
    }
  }

  placeCursorAtEnd(): void {
    if (this.editableListItem) {
      const element = this.editableListItem.nativeElement;
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  addContentAtEnd(data: any) {
    // data.content.forEach((element: { type: string; text: string; url: string }) => {
    //   if (element.type == 'text') {
    //     let textNode = this.createTextNode(element.text);
    //     this.editableListItem?.nativeElement.appendChild(textNode);
    //   }
    //   else if (element.type == 'link') {
    //     let linkNode = this.createLinkNode(element.text, element.url);
    //     this.editableListItem?.nativeElement.appendChild(linkNode);
    //   }
    // });
    // this.editableListItem?.nativeElement.normalize();
  }

  // Most likely to go
  // toLink(text: string, range: Range, url: string) {
  //   if (range) {
  //     const link = this.createLinkNode(text, url);
  //     range.deleteContents();
  //     range.insertNode(link);
  //   }
  // }

  // toUnlink(range: Range, targetId: string = '') {
  //   if (range) {
  //     if (targetId != '') {
  //       this.deleteSelectedLinks([targetId]);
  //     }
  //     else {
  //       // Identify links inside the selection
  //       let linkIds = this.getSelectedLinkIds(range);

  //       // Delete links inside the selection
  //       if (linkIds.length > 0) {
  //         this.deleteSelectedLinks(linkIds);
  //       }
  //     }
  //   }
  // }

  // createLinkNode(text: string, url: string) {
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.id = `${this.id}-link-${this.childrenCount++}`;
  //   link.textContent = text;
  //   return link;
  // }

  // createTextNode(text: string) {
  //   const textNode = document.createTextNode(text);
  //   return textNode;
  // }

  // getSelectedLinkIds(range: Range) {
  //   let linkIds = Array();
  //   if (range) {
  //     let childNodes = this.getChildNodes(range);
  //     childNodes?.forEach(node => {
  //       if (node.nodeType === Node.ELEMENT_NODE) {
  //         let childElement = node as HTMLElement;
  //         if (childElement.tagName === 'A') {
  //           linkIds.push(childElement.id);
  //         }
  //       }
  //     });
  //   }
  //   return linkIds;
  // }

  // deleteSelectedLinks(linkIds: Array<string>) {
  //   if (this.editableListItem) {
  //     const nativeElement: HTMLElement = this.editableListItem.nativeElement;
  //     const childNodes = nativeElement.childNodes;
  //     childNodes.forEach((node) => {
  //       if (node.nodeType === Node.ELEMENT_NODE) {
  //         const elementNode = node as HTMLElement;
  //         if (elementNode.tagName === 'A' && linkIds.includes(elementNode.id)) {
  //           const textNode = this.createTextNode(elementNode.textContent || '');
  //           nativeElement.replaceChild(textNode, elementNode);
  //         }
  //       }
  //     });
  //     nativeElement.normalize();
  //   }
  // }
  // Most likely to go

  getContentAfterCursor() {
    let content = null;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && this.editableListItem) {
      const range = selection.getRangeAt(0);
      const afterRange = range.cloneRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEnd(this.editableListItem.nativeElement as Node,
        this.editableListItem.nativeElement.childNodes.length);

      // Create objects:
      let nodes = Array();
      let childNodes = this.getChildNodes(afterRange);
      childNodes?.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          let childElement = node as HTMLElement;
          if (childElement.tagName === 'A') {
            let linkElement = childElement as HTMLAnchorElement;
            nodes.push({ type: 'link', text: linkElement.textContent || '', url: linkElement.href });
          }
        }
        else if (node.nodeType === Node.TEXT_NODE) {
          nodes.push({ type: 'text', text: node.textContent });
        }
      });

      if (!(nodes.length == 1 && nodes[0].text.length == 0)) {
        content = {
          type: 'LIST',
          content: nodes
        }
      }
      afterRange.deleteContents();
    }
    return content;
  }

  getCommonAncestorElement(range: Range) {
    const commonAncestor = range?.commonAncestorContainer as Element;
    return commonAncestor?.nodeType !== 1 ? commonAncestor?.parentElement : commonAncestor;
  }

  toTitle() {
    // get data, only text
    // emit event
    let component = 'Title';
    let data = null;
    this.changeListItem.emit({ component, data });
  }

  toSubtitle() {
    // get data, only text
    // emit event
    let component = 'Subtitle';
    let data = null;
    this.changeListItem.emit({ component, data });
  }

  toParagraph() {
    // get data
    // emit event
    let component = 'Paragraph';
    let data = null;
    this.changeListItem.emit({ component, data });

  }

  addNode(selection: any) {
    let range = selection.range;
    if (this.editableListItem && range) {
      let node = null;
      switch (selection.type) {
        case 'bold':
          node = this.nodeMakerService.createBoldNode(selection.text,
            `${this.id}-bold-${this.childrenCount++}`);
          break;
        case 'italic':
          node = this.nodeMakerService.createItalicNode(selection.text,
            `${this.id}-italic-${this.childrenCount++}`);
          break;
        case 'strike':
          node = this.nodeMakerService.createStrikeNode(selection.text,
            `${this.id}-strike-${this.childrenCount++}`);
          break;
        case 'link':
          node = this.nodeMakerService.createLinkNode(selection.text, selection.url,
            `${this.id}-link-${this.childrenCount++}`);
          break;
      }
      if (node) {
        range.deleteContents();
        range.insertNode(node);
      }
    }
  }

  removeNodes(selection: any) {
    let ids = selection.elementIds;
    let tagName = selection.tagName;
    if (this.editableListItem) {
      const nativeElement: HTMLElement = this.editableListItem.nativeElement;
      const childNodes = nativeElement.childNodes;
      childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const elementNode = node as HTMLElement;
          if (elementNode.tagName === tagName && ids.includes(elementNode.id)) {
            const textNode = this.nodeMakerService.createTextNode(elementNode.textContent || '');
            nativeElement.replaceChild(textNode, elementNode);
          }
        }
      });
      nativeElement.normalize();
      this.removeEmptyNodes();
    }
  }

  removeEmptyNodes() {
    if (this.editableListItem) {
      if (this.editableListItem.nativeElement.innerText.length == 0) {
        const parent: HTMLElement = this.editableListItem.nativeElement;
        while (parent.firstElementChild) {
          parent.removeChild(parent.firstElementChild);
        }
      }
    }
  }

  // Most likely to be renamed
  // removeEmptyLinks() {
  //   if (this.editableListItem) {
  //     if (this.editableListItem.nativeElement.innerText.length == 0) {
  //       const parent: HTMLElement = this.editableListItem.nativeElement;
  //       while (parent.firstElementChild) {
  //         parent.removeChild(parent.firstElementChild);
  //       }
  //     }
  //   }
  // }

  getChildNodes(range: Range) {
    let childNodes = null;
    if (range) {
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(range.cloneContents());
      childNodes = tempDiv.childNodes;
    }
    return childNodes;
  }

  isEmpty() {
    if (this.editableListItem && this.editableListItem.nativeElement.innerText.length == 0) {
      return true;
    }
    return false;
  }
}
