import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SpeedDialComponent } from "../speed-dial/speed-dial.component";
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, SpeedDialComponent],
  templateUrl: './text.component.html',
  styleUrl: './text.component.css'
})
export class TextComponent {
  // Event Emitters
  @Output() addComponent = new EventEmitter();
  @Output() deleteComponent = new EventEmitter();
  @Output() changeComponent = new EventEmitter<string>();

  // DOM Manipulation Variables
  @ViewChild('editableTitle', { read: ElementRef }) editableTitle: ElementRef<HTMLHeadingElement> | undefined;
  @ViewChild('editableSubtitle', { read: ElementRef }) editableSubtitle: ElementRef<HTMLHeadingElement> | undefined;
  @ViewChild('editableParagraph', { read: ElementRef }) editableParagraph: ElementRef<HTMLParagraphElement> | undefined;

  // Local Varibles
  private _data: any;
  @Input()
  set data(value: any) {
    this._data = value;
    this.afterInputData();
  }
  elementType: string = 'PARAGRAPH';
  @Input() componentIds: Array<string> = [];

  // Speed Dial Varibles
  showSpeedDialOptions: boolean = false;
  showSpeedDial: boolean = true;
  text: string | undefined;

  // link count variable
  linksCount: number = 1;

  afterInputData() {
    this.elementType = this._data.type;
    this.waitForTarget().then(() => {
      let target = this.getTarget();
      this._data.content.forEach((element: { type: string; text: string; url: string }) => {
        if (element.type == 'text') {
          let textNode = this.createTextNode(element.text);
          target?.nativeElement.appendChild(textNode);
        }
        else if (element.type == 'link') {
          if (this.elementType === 'PARAGRAPH') {
            let linkNode = this.createLinkNode(element.text, element.url);
            target?.nativeElement.appendChild(linkNode);
          }
          else {
            let textNode = this.createTextNode(element.text);
            target?.nativeElement.appendChild(textNode);
          }
        }
      });
      target?.nativeElement.normalize();
    });
  }

  // Event's Functions
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let target = this.getTarget();
      let lenght = target?.nativeElement.textContent?.length;
      if (lenght && lenght > 0) {
        let content = this.getContentAfterCursor();
        if (content) {
          this.addComponent.emit(content);
          this.showSpeedDial = false;
        }
        else {
          this.addComponent.emit();
          this.showSpeedDial = false;
        }
      }
      else {
        this.addComponent.emit();
        this.showSpeedDial = false;
      }
    }
    else if (event.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection) {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);

          if (range.startOffset === 0 && range.endOffset === 0) {
            let target = this.getTarget();
            let lenght = target?.nativeElement.textContent?.length;
            if (lenght && lenght > 0) {
              let content = this.getContentAfterCursor();
              if (content) {
                this.deleteComponent.emit(content);
              }
              else {
                this.deleteComponent.emit();
              }
            }
            else {
              this.deleteComponent.emit();
            }
          }
        }
      }
    }
  }

  onKeyUp(event: KeyboardEvent) {
    let target = this.getTarget();
    if (target) {
      const text = target.nativeElement.textContent?.trim() || '';
      if (text.length > 0 && this.showSpeedDial) {
        this.showSpeedDial = false;
      }
      if (text.length == 1) {
        if (text == '*' && event.code == 'Space') {
          // console.log('UL')
          this.changeComponent.emit('UL');
        }
        if (text == '+' && event.code == 'Space') {
          // console.log('OL')
          this.changeComponent.emit('OL');
        }
      }
    }
  }

  onFocus() {
    let target = this.getTarget();
    if (target) {
      const text = target.nativeElement.textContent?.trim() || '';
      if (text.length == 0) {
        this.showSpeedDial = true;
      }
      else {
        this.showSpeedDial = false;
      }
    }
    this.showSpeedDialOptions = false;
  }

  onSpeedStatusChange(open: boolean) {
    this.showSpeedDialOptions = open;
  }

  onSpeedSelection(type: string) {
    this.changeComponent.emit(type);
  }

  // Functions
  focus() {
    let target = this.getTarget();
    if (target) {
      target.nativeElement.focus();
    }
  }

  blur() {
    let target = this.getTarget();
    if (target) {
      target.nativeElement.blur();
    }
  }

  placeCursorAtEnd(): void {
    let target = this.getTarget();
    if (target) {
      const element = target.nativeElement;
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

  getTarget() {
    let target = null;
    switch (this.elementType) {
      case 'PARAGRAPH':
        target = this.editableParagraph;
        break;
      case 'TITLE':
        target = this.editableTitle;
        break;
      case 'SUBTITLE':
        target = this.editableSubtitle;
        break;
    }
    return target;
  }

  getComponentId() {
    return this.componentIds[0];
  }

  toTitle() {
    let target = this.getTarget();
    this.text = target?.nativeElement.innerText;
    this.elementType = 'TITLE';
    this.waitForTitle();
  }

  toSubtitle() {
    let target = this.getTarget();
    this.text = target?.nativeElement.innerText;
    this.elementType = 'SUBTITLE';
    this.waitForSubtitle();
  }

  toParagraph() {
    let target = this.getTarget();
    this.text = target?.nativeElement.innerText;
    this.elementType = 'PARAGRAPH';
    this.waitForParagraph();
  }

  toLink(text: string, range: Range, url: string) {
    if (range && this.elementType == 'PARAGRAPH') {
      const link = this.createLinkNode(text, url);
      // const link = document.createElement('a');
      // link.href = url;
      // link.id = `${this.componentIds[3]}-anchor-${this.linksCount++}`;
      // link.textContent = text;

      range.deleteContents();
      range.insertNode(link);
    }
  }

  toUnlink(range: Range) {
    if (range) {
      // Identify links inside the selection
      let linkIds = this.getSelectedLinkIds(range);

      // Delete links inside the selection
      if (linkIds.length > 0) {
        this.deleteSelectedLinks(linkIds);
      }
    }
  }

  createLinkNode(text: string, url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.id = `${this.componentIds[3]}-anchor-${this.linksCount++}`;
    link.textContent = text;
    return link;
  }

  createTextNode(text: string) {
    const textNode = document.createTextNode(text);
    return textNode;
  }

  getSelectedLinkIds(range: Range) {
    let linkIds = Array();
    if (range) {
      let childNodes = this.getChildNodes(range);
      console.log(childNodes);
      childNodes?.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          let childElement = node as HTMLElement;
          if (childElement.tagName === 'A') {
            linkIds.push(childElement.id);
          }
        }
      });
    }
    return linkIds;
  }

  deleteSelectedLinks(linkIds: Array<string>) {
    if (this.editableParagraph) {
      const nativeElement: HTMLElement = this.editableParagraph.nativeElement;
      const childNodes = nativeElement.childNodes;
      childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const elementNode = node as HTMLElement;
          if (elementNode.tagName === 'A' && linkIds.includes(elementNode.id)) {
            const textNode = this.createTextNode(elementNode.textContent || '');
            nativeElement.replaceChild(textNode, elementNode);
          }
        }
      });
      nativeElement.normalize();
    }
  }

  waitForTarget(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkTarget = () => {
        let target;
        switch (this.elementType) {
          case 'TITLE':
            target = this.editableTitle;
            break;
          case 'SUBTITLE':
            target = this.editableSubtitle;
            break;
          default:
            target = this.editableParagraph;
            break;
        }
        if (target && target.nativeElement) {
          resolve();
        }
        else {
          setTimeout(checkTarget, 50);
        }
      }
      checkTarget();
    });
  }

  waitForTitle() {
    setTimeout(() => {
      if (this.editableTitle && this.editableTitle.nativeElement) {
        if (this.text) {
          this.editableTitle.nativeElement.innerText = this.text;
          this.placeCursorAtEnd();
        }
      } else {
        this.waitForTitle();
      }
    }, 100);
  }

  waitForSubtitle() {
    setTimeout(() => {
      if (this.editableSubtitle && this.editableSubtitle.nativeElement) {
        if (this.text) {
          this.editableSubtitle.nativeElement.innerText = this.text;
          this.placeCursorAtEnd();
        }
      } else {
        this.waitForSubtitle();
      }
    }, 100);
  }

  waitForParagraph() {
    setTimeout(() => {
      if (this.editableParagraph && this.editableParagraph.nativeElement) {
        if (this.text) {
          this.editableParagraph.nativeElement.innerText = this.text;
          this.placeCursorAtEnd();
        }
      } else {
        this.waitForParagraph();
      }
    }, 100);
  }

  getContentAfterCursor() {
    let content = null;
    const selection = window.getSelection();
    const target = this.getTarget();
    if (selection && selection.rangeCount > 0 && target) {
      const range = selection.getRangeAt(0);
      const afterRange = range.cloneRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEnd(target.nativeElement as Node, target.nativeElement.childNodes.length);

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
          type: this.elementType == 'TITLE' ? 'SUBTITLE' : 'PARAGRAPH',
          content: nodes
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
}
