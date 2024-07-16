import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Editable } from '../editable';
import { NgIf } from '@angular/common';
import { SpeedDialComponent } from '../speed-dial/speed-dial.component';

@Component({
  selector: 'app-paragraph',
  standalone: true,
  imports: [NgIf, SpeedDialComponent],
  templateUrl: './paragraph.component.html',
  styleUrl: './paragraph.component.css'
})
export class ParagraphComponent implements AfterViewInit, Editable {
  @Output() newComponent = new EventEmitter();
  @Output() deleteMe = new EventEmitter();
  @Output() changeElement = new EventEmitter<string>();

  @ViewChild('editableParagraph', { read: ElementRef }) editableElement: ElementRef | undefined;
  @ViewChild('editableParagraph', { read: ElementRef }) cursorElement: ElementRef<HTMLParagraphElement> | undefined;
  showSpeedDial: boolean = true;
  showSpeedDialOptions: boolean = false;

  ngAfterViewInit(): void {
    this.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.showSpeedDial = false;
      this.newComponent.emit();
    }
    else if (event.key === 'Backspace') {
      if (this.editableElement) {
        const text = this.editableElement.nativeElement.textContent.trim();
        if (!text) {
          this.deleteMe.emit();
        }
        if (text.length == 1) {
          this.showSpeedDial = true;
        }
      }
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (this.editableElement) {
      const text = this.editableElement.nativeElement.textContent.trim();
      // console.log(text.length)
      if (text.length > 0 && this.showSpeedDial) {
        this.showSpeedDial = false;
      }
      if (text.length == 1) {
        if (text == '*' && event.code == 'Space') {
          // console.log('UL')
          this.changeElement.emit('UL');
        }
        if (text == '+' && event.code == 'Space') {
          console.log('OL')
          this.changeElement.emit('OL');
        }
      }
    }
  }

  focus(): void {
    if (this.editableElement) {
      this.editableElement.nativeElement.focus();
    }
  }

  blur(): void {
    if (this.editableElement) {
      this.showSpeedDial = false;
      this.editableElement.nativeElement.blur();
    }
  }

  placeCursorAtEnd(): void {
    if (this.cursorElement) {
      const element = this.cursorElement.nativeElement;
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

  onSpeedStatusChange(open: boolean) {
    this.showSpeedDialOptions = open;
  }

  onFocus() {
    if (this.editableElement) {
      const text = this.editableElement.nativeElement.textContent.trim();
      if (text.length == 0) {
        this.showSpeedDial = true;
      }
      else {
        this.showSpeedDial = false;
      }
    }
    this.showSpeedDialOptions = false;
  }
}
