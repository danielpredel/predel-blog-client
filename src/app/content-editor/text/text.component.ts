import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { SpeedDialComponent } from "../speed-dial/speed-dial.component";
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { IdService } from '../../id.service';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, SpeedDialComponent],
  templateUrl: './text.component.html',
  styleUrl: './text.component.css'
})
export class TextComponent implements OnInit, AfterViewInit {
  // Event Emitters
  @Output() addComponent = new EventEmitter();
  @Output() deleteComponent = new EventEmitter();
  @Output() changeComponent = new EventEmitter<string>();

  // DOM Manipulation Variables
  @ViewChild('editableTitle', { read: ElementRef }) editableTitle: ElementRef<HTMLHeadingElement> | undefined;
  @ViewChild('editableSubtitle', { read: ElementRef }) editableSubtitle: ElementRef<HTMLHeadingElement> | undefined;
  @ViewChild('editableParagraph', { read: ElementRef }) editableParagraph: ElementRef<HTMLParagraphElement> | undefined;

  // Local Varibles
  types: Array<string> = ['PARAGRAPH', 'TITLE', 'SUBTITLE'];
  type: string = this.types[0];
  componentIds: Array<string> = [];

  // Speed Dial Varibles
  showSpeedDialOptions: boolean = false;
  showSpeedDial: boolean = true;

  constructor(private idService: IdService) { }

  ngOnInit(): void {
    let id = this.idService.getId();
    this.componentIds.push(`txt-${id}`);
    this.componentIds.push(`txt-${id}-Title`);
    this.componentIds.push(`txt-${id}-Subtitle`);
    this.componentIds.push(`txt-${id}-Paragraph`);
  }

  ngAfterViewInit() {
    this.focus();
  }

  // Event's Functions
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.showSpeedDial = false;
      this.addComponent.emit();
    }
    else if (event.key === 'Backspace') {
      let target = this.getTarget();
      if (target) {
        const text = target.nativeElement.textContent?.trim() || '';
        if (!text) {
          this.deleteComponent.emit();
        }
        if (text.length == 1) {
          this.showSpeedDial = true;
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
          console.log('UL')
          this.changeComponent.emit('UL');
        }
        if (text == '+' && event.code == 'Space') {
          console.log('OL')
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
    switch (this.type) {
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

  getComponentId(){
    return this.componentIds[0];
  }
}
