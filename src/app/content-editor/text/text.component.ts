import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SpeedDialComponent } from "../speed-dial/speed-dial.component";
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { after } from 'node:test';

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
    // Create Data Node: Text and Anchors
    // For new Text Component with initial data
    // Like Edition and receciving content from other components
  }

  // Event's Functions
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let content = this.getContentAfterCursor();
      // this.showSpeedDial = false;
      // this.addComponent.emit();
    }
    else if (event.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection) {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);

          if (range.startOffset === 0 && range.endOffset === 0) {
            this.deleteComponent.emit();
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
      const link = document.createElement('a');
      link.href = url;
      link.id = `${this.componentIds[3]}-anchor-${this.linksCount++}`;
      link.textContent = text;

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
        this.deleleSelectedLinks(linkIds);
      }
    }
  }

  // This needs the nodes in range
  getSelectedLinkIds(range: Range) {
    let linkIds = Array();
    if (range) {
      let childNodes = this.getChildNodes(range);
      console.log(childNodes);
      childNodes?.forEach(node => {
        if(node.nodeType === Node.ELEMENT_NODE){
          let childElement = node as HTMLElement;
          if(childElement.tagName === 'A'){
            linkIds.push(childElement.id);
          }
        }
      });
      
      // Original way of getting the childNodes of the selection, just in case
      // if (range.startContainer === range.endContainer) {
      //   const startElement = range.startContainer.parentElement as HTMLElement;
      //   if (startElement.nodeType === Node.ELEMENT_NODE && startElement.tagName === 'A') {
      //     linkIds.push(startElement.id);
      //   }
      // }
      // else {
      //   let startNode = range.startContainer;
      //   let endNode = range.endContainer;
      //   if (range.startContainer.parentElement?.tagName === 'A') {
      //     startNode = range.startContainer.parentElement;
      //     const startElement = range.startContainer.parentElement as HTMLElement;
      //     linkIds.push(startElement.id);
      //   }
      //   if (range.endContainer.parentElement?.tagName === 'A') {
      //     endNode = range.endContainer.parentElement;
      //     const endElement = range.endContainer.parentElement as HTMLElement;
      //     linkIds.push(endElement.id);
      //   }

      //   let nextNode = startNode.nextSibling ? startNode.nextSibling : startNode.parentElement?.nextSibling;
      //   while (nextNode != endNode) {
      //     if (nextNode?.nodeType === Node.ELEMENT_NODE) {
      //       let nextElement = nextNode as HTMLElement;
      //       if (nextElement.tagName === 'A') {
      //         linkIds.push(nextElement.id);
      //       }
      //     }
      //     nextNode = nextNode?.nextSibling;
      //   }
      // }
    }
    return linkIds;
  }

  deleleSelectedLinks(linkIds: Array<string>) {
    if (this.editableParagraph) {
      const nativeElement: HTMLElement = this.editableParagraph.nativeElement;
      const childNodes = nativeElement.childNodes;
      childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const elementNode = node as HTMLElement;
          if (elementNode.tagName === 'A' && linkIds.includes(elementNode.id)) {
            const textNode = document.createTextNode(elementNode.textContent || '');
            nativeElement.replaceChild(textNode, elementNode);
          }
        }
      });
      nativeElement.normalize();
    }
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

  // this need the nodes in range
  getContentAfterCursor() {
    let content = Array();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && this.editableParagraph) {
      const range = selection.getRangeAt(0);
      const afterRange = range.cloneRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEnd(this.editableParagraph.nativeElement as Node, this.editableParagraph.nativeElement.childNodes.length);

      // Create objects:
      this.getChildNodes(afterRange);


      // Delete selection at the end
      // afterRange.deleteContents();
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
