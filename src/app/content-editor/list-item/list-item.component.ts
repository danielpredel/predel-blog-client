import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

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

  // DOM Manipulation Variables
  @ViewChild('editableListItem', { read: ElementRef }) editableListItem: ElementRef<HTMLLIElement> | undefined;

  // Local Varibles
  id: string | undefined;

  // link count variable
  childrenCount: number = 1;

  setId(id: string) {
    this.id = id;
  }

  setData(data: any) {
    if (data) {
      // set data
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      // let lenght = this.editableListItem?.nativeElement.textContent?.length;
      this.addListItem.emit();
      // if (lenght && lenght > 0) {
      //   let content = this.getContentAfterCursor();
      //   this.removeEmptyLinks();
      //   // this.removeEmptyNodes();
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

  focus() {
    if (this.editableListItem) {
      this.editableListItem.nativeElement.focus();
    }
  }
}
