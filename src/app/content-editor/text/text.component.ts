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

  afterInputData() {
    // Create Data Node: Text and Anchors
  }

  // Event's Functions
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.showSpeedDial = false;
      this.addComponent.emit();
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
}
