import { NgClass, NgIf, NgStyle, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [NgIf, NgClass, NgStyle, NgSwitch, NgSwitchCase],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.css'
})
export class TooltipComponent {
  @ViewChild('tooltip', { read: ElementRef, }) tooltip!: ElementRef;
  @ViewChild('linkInput', { read: ElementRef, }) linkInput!: ElementRef;
  @Output() operation = new EventEmitter<any>();

  hidden: boolean = true;
  left: number = 0;
  top: number = 0;
  bold = { disabled: false, selected: false };
  italic = { disabled: false, selected: false };
  strikethrough = { disabled: false, selected: false };
  link = { disabled: false, selected: false };
  title = { disabled: false, selected: false };
  subtitle = { disabled: false, selected: false };
  quote = { disabled: false, selected: false };
  stage: string = 'OPTIONS';
  clientRect: DOMRect | undefined;

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.linkInput) {
        const url = this.linkInput.nativeElement.textContent;
        if (url) {
          this.operation.emit({ operation: 'toLink', url });
          this.hide();
        }
      }
    }
  }

  onTooltipSelection(type: string) {
    switch (type) {
      case 'title':
        if (!this.title.disabled) {
          if (this.title.selected) {
            this.operation.emit({ operation: 'toParagraph' });
          }
          else {
            this.operation.emit({ operation: 'toTitle' });
          }
        }
        break;
      case 'subtitle':
        if (!this.subtitle.disabled) {
          if (this.subtitle.selected) {
            this.operation.emit({ operation: 'toParagraph' });
          }
          else {
            this.operation.emit({ operation: 'toSubtitle' });
          }
        }
        break;
      case 'close':
        this.operation.emit({ operation: 'close' });
        break;
    }
    this.hide();
    this.restoreConfig();
  }

  onBoldSelection() {
  }

  onItalicSelection() {
  }

  onStrikethroughSelection() {
  }

  onLinkSelection() {
    if (!this.link.disabled) {
      if (this.link.selected) {
        this.operation.emit({ operation: 'toUnlink' });
        this.hide();
      }
      else {
        this.placeForLinkInput();
        this.waitForLinkInput();
      }
    }
  }

  setClientRect(clientRect: DOMRect) {
    this.clientRect = clientRect;
  }

  show() {
    this.hidden = false;
  }

  placeForOptions() {
    this.stage = 'OPTIONS';
    if (this.clientRect) {
      this.left = this.clientRect.right - (this.clientRect.right - this.clientRect.left) / 2
        - this.tooltip.nativeElement.offsetWidth / 2;
      this.top = this.clientRect.top - 45;
      this.show();
    }
  }

  placeForLinkInput() {
    this.stage = 'LINK-INPUT';
    if (this.clientRect) {
      this.left = this.clientRect.right - (this.clientRect.right - this.clientRect.left) / 2
        - this.tooltip.nativeElement.offsetWidth / 2;
      this.top = this.clientRect.top - 45;
      this.show();
    }
  }

  hide() {
    this.hidden = true;
  }

  waitForLinkInput() {
    setTimeout(() => {
      if (this.linkInput && this.linkInput.nativeElement) {
        this.linkInput.nativeElement.focus();
      } else {
        this.waitForLinkInput();
      }
    }, 100);
  }

  setConfig(state: string) {
    this.restoreConfig();
    switch (state) {
      case 'onTitle':
        this.link.disabled = true;
        this.title.selected = true;
        break;
      case 'onSubtitle':
        this.link.disabled = true;
        this.subtitle.selected = true;
        break;
      case 'onLinkedParagraph':
        this.link.selected = true;
        break;
      case 'onListItem':
        this.title.disabled = true;
        this.subtitle.disabled = true;
        break;
      case 'onLinkedListItem':
        this.link.selected = true;
        this.title.disabled = true;
        this.subtitle.disabled = true;
        break;
    }
  }

  restoreConfig() {
    this.link = { disabled: false, selected: false };
    this.title = { disabled: false, selected: false };
    this.subtitle = { disabled: false, selected: false };
  }
}
