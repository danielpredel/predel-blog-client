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

  // Text type options
  bold = { disabled: false, selected: false };
  italic = { disabled: false, selected: false };
  strike = { disabled: false, selected: false };
  link = { disabled: false, selected: false };

  // Component type options
  title = { selected: false };
  subtitle = { selected: false };
  stage: string = 'OPTIONS';
  clientRect: DOMRect | undefined;

  // window selection variables
  selectionString: string | undefined;
  selectionRange: Range | undefined;
  ancestorId: string = '';
  elementIds: Array<string> = [];

  onWindowSelection(selection: Selection) {
    if (selection) {
      this.setOptions(selection);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.linkInput) {
        const url = this.linkInput.nativeElement.textContent;
        if (url) {
          this.operation.emit({
            operation: 'addNode',
            type: 'link',
            ancestorId: this.ancestorId,
            range: this.selectionRange,
            text: this.selectionString,
            url
          });
          this.hide();
        }
      }
    }
  }

  onTooltipSelection(option: string) {
    switch (option) {
      case 'bold':
        if (!this.bold.disabled) {
          if (this.bold.selected) {
            this.operation.emit({
              operation: 'removeNodes',
              tagName: 'B',
              ancestorId: this.ancestorId,
              range: this.selectionRange,
              elementIds: this.getElemementIds('bold')
            });
          }
          else {
            this.operation.emit({
              operation: 'addNode',
              type: 'bold',
              ancestorId: this.ancestorId,
              range: this.selectionRange,
              text: this.selectionString
            });
          }
        }
        break;
      case 'italic':
        if (!this.italic.disabled) {
          if (this.italic.selected) {
            this.operation.emit({
              operation: 'removeNodes',
              tagName: 'I',
              ancestorId: this.ancestorId,
              range: this.selectionRange,
              elementIds: this.getElemementIds('italic')
            });
          }
          else {
            this.operation.emit({
              operation: 'addNode',
              type: 'italic',
              ancestorId: this.ancestorId,
              range: this.selectionRange,
              text: this.selectionString
            });
          }
        }
        break;
      case 'strike':
        if (!this.strike.disabled) {
          if (this.strike.selected) {
            this.operation.emit({
              operation: 'removeNodes',
              tagName: 'S',
              ancestorId: this.ancestorId,
              range: this.selectionRange,
              elementIds: this.getElemementIds('strike')
            });
          }
          else {
            this.operation.emit({
              operation: 'addNode',
              type: 'strike',
              ancestorId: this.ancestorId,
              range: this.selectionRange,
              text: this.selectionString
            });
          }
        }
        break;
      case 'link':
        if (!this.link.disabled) {
          if (this.link.selected) {
            this.operation.emit({
              operation: 'removeNodes',
              tagName: 'A',
              ancestorId: this.ancestorId,
              range: this.selectionRange,
              elementIds: this.getElemementIds('link')
            });
          }
          else {
            this.showLinkInput();
          }
        }
        break;
      case 'title':
        if (this.title.selected) {
          this.operation.emit({
            operation: 'toParagraph',
            ancestorId: this.ancestorId,
            range: this.selectionRange
          });
        }
        else {
          this.operation.emit({
            operation: 'toTitle',
            ancestorId: this.ancestorId,
            range: this.selectionRange
          });
        }
        break;
      case 'subtitle':
        if (this.subtitle.selected) {
          this.operation.emit({
            operation: 'toParagraph',
            ancestorId: this.ancestorId,
            range: this.selectionRange
          });
        }
        else {
          this.operation.emit({
            operation: 'toSubtitle',
            ancestorId: this.ancestorId,
            range: this.selectionRange
          });
        }
        break;
    }
    if (this.stage == 'OPTIONS') {
      this.hide();
    }
  }

  showLinkInput() {
    this.placeForLinkInput();
    this.waitForLinkInput();
  }

  setOptions(selection: Selection) {
    this.restoreOptions();
    this.selectionString = selection.toString();
    if (this.selectionString.length > 0) {
      this.selectionRange = selection?.getRangeAt(0);
      const ancestorId = this.getCommonAncestorsId();

      if (ancestorId && ancestorId.length >= 14) {
        this.ancestorId = ancestorId;
        switch (true) {
          case ancestorId?.includes('txt'):
            switch (true) {
              case ancestorId?.includes('Paragraph'):
                this.checkCommonAncestor(ancestorId);
                break;
              case ancestorId?.includes('Title'):
                this.setAllDisabled();
                this.setContext('Title');
                break;
              case ancestorId?.includes('Subtitle'):
                this.setAllDisabled();
                this.setContext('Subtitle');
                break;
            }
            this.setClientRect(this.selectionRange.getBoundingClientRect());
            this.placeForOptions();
            break;
          case ancestorId?.includes('ListItem'):
            this.checkCommonAncestor(ancestorId);
            this.setClientRect(this.selectionRange.getBoundingClientRect());
            this.placeForOptions();
            break;
        }
      }
    }
  }

  checkCommonAncestor(ancestorId: string) {
    switch (true) {
      case ancestorId?.includes('link'):
        this.setAllDisabled();
        this.setSelected('A');
        this.elementIds.push(ancestorId);
        break;
      case ancestorId?.includes('bold'):
        this.setAllDisabled();
        this.setSelected('B');
        this.elementIds.push(ancestorId);
        break;
      case ancestorId?.includes('italic'):
        this.setAllDisabled();
        this.setSelected('I');
        this.elementIds.push(ancestorId);
        break;
      case ancestorId?.includes('strike'):
        this.setAllDisabled();
        this.setSelected('S');
        this.elementIds.push(ancestorId);
        break;
      default:
        let selectedElements = this.getSelectedElements();
        if (selectedElements.tagNames.length > 0) {
          this.setAllDisabled();
          let tagNames = [...new Set(selectedElements.tagNames)];
          tagNames.forEach(tagName => this.setSelected(tagName));
          this.elementIds = selectedElements.ids;
        }
        break;
    }
  }

  getCommonAncestorsId() {
    const commonAncestor = this.selectionRange?.commonAncestorContainer as Element;
    const commonAncestorElement = commonAncestor?.nodeType !== 1 ? commonAncestor?.parentElement : commonAncestor;
    return commonAncestorElement?.id;
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
      const scrollPosition = window.scrollY;
      this.left = this.clientRect.right - (this.clientRect.right - this.clientRect.left) / 2
        - this.tooltip.nativeElement.offsetWidth / 2;
      this.top = this.clientRect.top - 45 + scrollPosition;
      this.show();
    }
  }

  placeForLinkInput() {
    this.stage = 'LINK-INPUT';
    if (this.clientRect) {
      const scrollPosition = window.scrollY;
      this.left = this.clientRect.right - (this.clientRect.right - this.clientRect.left) / 2
        - this.tooltip.nativeElement.offsetWidth / 2;
      this.top = this.clientRect.top - 45 + scrollPosition;
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

  restoreOptions() {
    this.restoreTextOptions();
    this.restoreComponentOptions();
  }

  restoreTextOptions() {
    this.setAllEnabled();
    this.setAllDeselected();
  }

  restoreComponentOptions() {
    this.title.selected = false;
    this.subtitle.selected = false;
  }

  setAllEnabled() {
    this.bold.disabled = false;
    this.italic.disabled = false;
    this.strike.disabled = false;
    this.link.disabled = false;
  }

  setAllDisabled() {
    this.bold.disabled = true;
    this.italic.disabled = true;
    this.strike.disabled = true;
    this.link.disabled = true;
  }

  setAllDeselected() {
    this.bold.selected = false;
    this.italic.selected = false;
    this.strike.selected = false;
    this.link.selected = false;
  }

  setSelected(option: string) {
    switch (option) {
      case 'B':
        this.bold.selected = true;
        this.bold.disabled = false;
        break;
      case 'I':
        this.italic.selected = true;
        this.italic.disabled = false;
        break;
      case 'S':
        this.strike.selected = true;
        this.strike.disabled = false;
        break;
      case 'A':
        this.link.selected = true;
        this.link.disabled = false;
        break;
    }
  }

  setContext(context: string) {
    this.restoreComponentOptions();
    switch (context) {
      case 'Title':
        this.title.selected = true;
        break;
      case 'Subtitle':
        this.subtitle.selected = true;
        break;
    }
  }

  getSelectedElements() {
    let tagNames = Array();
    let ids = Array();
    if (this.selectionRange) {
      let childNodes = this.getChildNodes();
      childNodes?.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          let childElement = node as HTMLElement;
          tagNames.push(childElement.tagName);
          ids.push(childElement.id);
        }
      });
    }
    return { tagNames, ids };
  }

  getChildNodes() {
    let childNodes = null;
    if (this.selectionRange) {
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(this.selectionRange.cloneContents());
      childNodes = tempDiv.childNodes;
    }
    return childNodes;
  }

  getElemementIds(element: string) {
    return this.elementIds.filter(id => id.includes(element));
  }
}
