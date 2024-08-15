import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
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

  // Event functions
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let lenght = this.editableListItem?.nativeElement.textContent?.length;
      if (lenght && lenght > 0) {
        let content = this.getDataAfterCursor();
        this.removeEmptyNodes();
        if (content) {
          this.addListItem.emit(content);
        }
        else {
          this.addListItem.emit();
        }
      }
      else {
        this.addListItem.emit();
      }
    }
    else if (event.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection) {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range.startOffset == 0 && range.endOffset == 0) {
            this.deleteListItem.emit();
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

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedContent = event.clipboardData?.getData('text/plain');
    if (pastedContent) {
      this.paste(pastedContent);
    }
  }

  // Setters
  setId(id: string) {
    this.id = id;
  }

  setData(data: any) {
    this.setDataAtEnd(data);
  }

  setDataAtEnd(data: any) {
    data.content.forEach((element: { type: string; text: string; url: string }) => {
      let node = null;
      switch (element.type) {
        case 'text':
          node = this.nodeMakerService.createTextNode(element.text);
          break;
        case 'bold':
          node = this.nodeMakerService.createBoldNode(element.text,
            `${this.id}-bold-${this.childrenCount++}`);
          break;
        case 'italic':
          node = this.nodeMakerService.createItalicNode(element.text,
            `${this.id}-italic-${this.childrenCount++}`);
          break;
        case 'strike':
          node = this.nodeMakerService.createStrikeNode(element.text,
            `${this.id}-strike-${this.childrenCount++}`);
          break;
        case 'link':
          node = this.nodeMakerService.createLinkNode(element.text, element.url,
            `${this.id}-link-${this.childrenCount++}`);
          break;
      }
      if (node) {
        this.editableListItem?.nativeElement.appendChild(node);
      }
    });
    this.editableListItem?.nativeElement.normalize();
  }

  // Getters
  getData() {
    let content = null;

    this.removeEmptyNodes();
    this.editableListItem?.nativeElement.normalize();

    let childNodes = this.editableListItem?.nativeElement.childNodes;

    if (childNodes) {
      let nodes = this.getContentNodes(childNodes);

      if (!(nodes.length == 1 && nodes[0].text.length == 0)) {
        content = {
          content: nodes
        }
      }
    }
    return content;
  }

  getDataAfterCursor() {
    let content = null;

    this.removeEmptyNodes();
    this.editableListItem?.nativeElement.normalize();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && this.editableListItem) {
      const range = selection.getRangeAt(0);
      const afterRange = range.cloneRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEnd(this.editableListItem.nativeElement as Node,
        this.editableListItem.nativeElement.childNodes.length);

      // Create objects:
      let childNodes = this.getChildNodes(afterRange);
      if (childNodes) {
        let nodes = this.getContentNodes(childNodes);

        if (!(nodes.length == 1 && nodes[0].text.length == 0)) {
          content = {
            content: nodes
          }
        }
      }
      afterRange.deleteContents();
    }
    return content;
  }

  getChildNodes(range: Range) {
    let childNodes = null;
    if (range) {
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(range.cloneContents());
      childNodes = tempDiv.childNodes;
    }
    return childNodes;
  }

  getContentNodes(childNodes: NodeListOf<ChildNode>) {
    let nodes = Array();
    if (childNodes) {
      childNodes?.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          let childElement = node as HTMLElement;
          switch (childElement.tagName) {
            case 'B':
              nodes.push({ type: 'bold', text: childElement.textContent || '' });
              break;
            case 'I':
              nodes.push({ type: 'italic', text: childElement.textContent || '' });
              break;
            case 'S':
              nodes.push({ type: 'strike', text: childElement.textContent || '' });
              break;
            case 'A':
              let linkElement = childElement as HTMLAnchorElement;
              nodes.push({ type: 'link', text: linkElement.textContent || '', url: linkElement.href });
              break;
          }
        }
        else if (node.nodeType === Node.TEXT_NODE) {
          nodes.push({ type: 'text', text: node.textContent });
        }
      });
    }
    return nodes;
  }

  getCommonAncestorElement(range: Range) {
    const commonAncestor = range?.commonAncestorContainer as Element;
    return commonAncestor?.nodeType !== 1 ? commonAncestor?.parentElement : commonAncestor;
  }

  // HTMLElement Funtions
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

  // ChangeComponent Event Functions
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

  // Text Node Functions
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

  // Functions
  isEmpty() {
    if (this.editableListItem && this.editableListItem.nativeElement.innerText.length == 0) {
      return true;
    }
    return false;
  }

  paste(text: string) {
    if (this.editableListItem) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(this.nodeMakerService.createTextNode(text));

        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        this.removeEmptyNodes();
        this.editableListItem.nativeElement.normalize();
      }
    }
  }
}
