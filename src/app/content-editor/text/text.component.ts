import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { SpeedDialComponent } from "../speed-dial/speed-dial.component";
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { NodeMakerService } from '../node-maker.service';

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
  @Output() focused = new EventEmitter();

  // DOM Manipulation Variables
  @ViewChild('editableTitle', { read: ElementRef }) editableTitle: ElementRef<HTMLHeadingElement> | undefined;
  @ViewChild('editableSubtitle', { read: ElementRef }) editableSubtitle: ElementRef<HTMLHeadingElement> | undefined;
  @ViewChild('editableParagraph', { read: ElementRef }) editableParagraph: ElementRef<HTMLParagraphElement> | undefined;
  @ViewChild(SpeedDialComponent) speedDial!: SpeedDialComponent;

  // Local Varibles
  componentBefore: string = 'NONE';
  componentIds: Array<string> = [];
  elementType: string = 'PARAGRAPH';
  childrenCount: number = 1;

  // Speed Dial Varibles
  showSpeedDial: boolean = true;
  text: string | undefined;

  constructor(private nodeMakerService: NodeMakerService) { }

  // Event's Functions
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let target = this.getTarget();
      let lenght = target?.nativeElement.textContent?.length;
      if (lenght && lenght > 0) {
        let content = this.getContentAfterCursor();
        this.removeEmptyNodes();
        if (content) {
          this.addComponent.emit(content);
          this.hideSpeedDial();
        }
        else {
          this.addComponent.emit();
          this.hideSpeedDial();
        }
      }
      else {
        this.addComponent.emit();
        this.hideSpeedDial();
      }
    }
    else if (event.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection) {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range.startOffset == 0 && range.endOffset == 0) {
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
        this.hideSpeedDial();
      }
      if (text.length == 1) {
        if (text == '*' && event.code == 'Space') {
          this.changeComponent.emit('UL');
        }
        if (text == '+' && event.code == 'Space') {
          this.changeComponent.emit('OL');
        }
      }
    }
  }

  onFocus() {
    this.focused.emit();
    if (this.showSpeedDial) {
      this.speedDial.closeMenu();
    }
    let target = this.getTarget();
    if (target) {
      const text = target.nativeElement.textContent?.trim() || '';
      if (text.length == 0) {
        this.showSpeedDial = true;
      }
      else {
        this.hideSpeedDial();
      }
    }
  }

  onSpeedSelection(type: string) {
    this.changeComponent.emit(type);
  }

  onTooltipSelection(selection: any) {
    let target = this.getTarget();
    if (selection.range) {
      let ancestorElement = this.getCommonAncestorElement(selection.range);
      if (target && target.nativeElement.contains(ancestorElement)) {
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
            // in this funtion verify if the target is a paragraph
            break;
          case 'removeNodes':
            this.removeNodes(selection);
            // in this funtion verify if the target is a paragraph
            break;
        }
      }
    }
  }

  // Functions
  setId(ids: Array<string>) {
    this.componentIds = ids;
  }

  setData(data: any) {
    this.elementType = data.type;
    this.waitForTarget().then(() => {
      this.addContentAtEnd(data);
    });
  }

  setComponentBefore(type: string) {
    this.componentBefore = type;
  }

  hideSpeedDial() {
    if (this.showSpeedDial) {
      this.speedDial.closeMenu();
    }
    this.showSpeedDial = false;
  }

  focus() {
    let target = this.getTarget();
    if (target) {
      target.nativeElement.focus();
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

  // Need changes here
  addContentAtEnd(data: any) {
    let target = this.getTarget();
    data.content.forEach((element: { type: string; text: string; url: string }) => {
      if (element.type == 'text') {
        let textNode = this.nodeMakerService.createTextNode(element.text);
        target?.nativeElement.appendChild(textNode);
      }
      else if (element.type == 'link') {
        if (this.elementType === 'PARAGRAPH') {
          let linkNode = this.nodeMakerService.createLinkNode(element.text, element.url,
            `${this.componentIds[3]}-link-${this.childrenCount++}`);
          target?.nativeElement.appendChild(linkNode);
        }
        else {
          let textNode = this.nodeMakerService.createTextNode(element.text);
          target?.nativeElement.appendChild(textNode);
        }
      }
    });
    target?.nativeElement.normalize();
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

  // Need changes here
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

  toTitle() {
    let target = this.getTarget();
    this.text = target?.nativeElement.innerText;
    this.elementType = 'TITLE';
    this.waitForTarget().then(() => {
      if (this.editableTitle && this.text) {
        this.editableTitle.nativeElement.innerText = this.text;
        this.placeCursorAtEnd();
      }
    });
  }

  toSubtitle() {
    let target = this.getTarget();
    this.text = target?.nativeElement.innerText;
    this.elementType = 'SUBTITLE';
    this.waitForTarget().then(() => {
      if (this.editableSubtitle && this.text) {
        this.editableSubtitle.nativeElement.innerText = this.text;
        this.placeCursorAtEnd();
      }
    });
  }

  toParagraph() {
    let target = this.getTarget();
    this.text = target?.nativeElement.innerText;
    this.elementType = 'PARAGRAPH';
    this.waitForTarget().then(() => {
      if (this.editableParagraph && this.text) {
        this.editableParagraph.nativeElement.innerText = this.text;
        this.placeCursorAtEnd();
      }
    });
  }

  addNode(selection: any) {
    let range = selection.range;
    if (this.editableParagraph && this.elementType == 'PARAGRAPH' && range) {
      let node = null;
      switch (selection.type) {
        case 'bold':
          node = this.nodeMakerService.createBoldNode(selection.text,
            `${this.componentIds[3]}-bold-${this.childrenCount++}`);
          break;
        case 'italic':
          node = this.nodeMakerService.createItalicNode(selection.text,
            `${this.componentIds[3]}-italic-${this.childrenCount++}`);
          break;
        case 'strike':
          node = this.nodeMakerService.createStrikeNode(selection.text,
            `${this.componentIds[3]}-strike-${this.childrenCount++}`);
          break;
        case 'link':
          node = this.nodeMakerService.createLinkNode(selection.text, selection.url,
            `${this.componentIds[3]}-link-${this.childrenCount++}`);
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
    console.log(ids)
    let tagName = selection.tagName;
    if (this.editableParagraph) {
      const nativeElement: HTMLElement = this.editableParagraph.nativeElement;
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
    let target = this.getTarget();
    if (target) {
      if (target.nativeElement.innerText.length == 0) {
        const parent: HTMLElement = target.nativeElement;
        while (parent.firstElementChild) {
          parent.removeChild(parent.firstElementChild);
        }
      }
    }
  }

  getCommonAncestorElement(range: Range) {
    const commonAncestor = range?.commonAncestorContainer as Element;
    return commonAncestor?.nodeType !== 1 ? commonAncestor?.parentElement : commonAncestor;
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
