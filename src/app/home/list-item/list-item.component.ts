import { Component, ElementRef, ViewChild } from '@angular/core';
import { NodeMakerService } from '../../shared/services/node-maker.service';

@Component({
  selector: 'app-list-item',
  standalone: true,
  imports: [],
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.css'
})
export class ListItemComponent {

  // DOM Manipulation Variables
  @ViewChild('listItem', { read: ElementRef }) listItem: ElementRef<HTMLLIElement> | undefined;

  constructor(private nodeMakerService: NodeMakerService) { }

  // Should receive an Array
  setData(data: Array<any>) {
    if (data.length > 0) {
      this.setDataAtEnd(data);
    }
  }

  // Should receive an Array
  setDataAtEnd(data: Array<any>) {
    data.forEach((element: { type: string; text: string; url: string }) => {
      let node = null;
      switch (element.type) {
        case 'text':
          node = this.nodeMakerService.createTextNode(element.text);
          break;
        case 'bold':
          node = this.nodeMakerService.createBoldNode(element.text);
          break;
        case 'italic':
          node = this.nodeMakerService.createItalicNode(element.text);
          break;
        case 'strike':
          node = this.nodeMakerService.createStrikeNode(element.text);
          break;
        case 'link':
          node = this.nodeMakerService.createLinkNode(element.text, element.url);
          break;
      }
      if (node) {
        this.listItem?.nativeElement.appendChild(node);
      }
    });
    this.listItem?.nativeElement.normalize();
  }
}
