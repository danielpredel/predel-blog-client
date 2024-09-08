import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NodeMakerService } from '../../shared/services/node-maker.service';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './text.component.html',
  styleUrl: './text.component.css'
})
export class TextComponent {

  // DOM Manipulation Variables
  @ViewChild('title', { read: ElementRef }) title: ElementRef<HTMLHeadingElement> | undefined;
  @ViewChild('subtitle', { read: ElementRef }) subtitle: ElementRef<HTMLHeadingElement> | undefined;
  @ViewChild('paragraph', { read: ElementRef }) paragraph: ElementRef<HTMLParagraphElement> | undefined;

  // Local Varibles
  elementType: string = 'PARAGRAPH';

  constructor(private nodeMakerService: NodeMakerService) { }

  setElementType(type: string) {
    this.elementType = type;
  }

  setData(data: Array<any>) {
    this.waitForTarget().then(() => {
      if (data.length > 0) {
        this.setDataAtEnd(data);
      }
    });
  }

  setDataAtEnd(data: Array<any>) {
    let target = this.getTarget();
    data.forEach((element: { type: string; text: string; url: string }) => {
      if (this.elementType === 'PARAGRAPH') {
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
          target?.nativeElement.appendChild(node);
        }
      }
      else {
        let textNode = this.nodeMakerService.createTextNode(element.text);
        target?.nativeElement.appendChild(textNode);
      }
    });
    target?.nativeElement.normalize();
  }

  getTarget() {
    let target = null;
    switch (this.elementType) {
      case 'PARAGRAPH':
        target = this.paragraph;
        break;
      case 'TITLE':
        target = this.title;
        break;
      case 'SUBTITLE':
        target = this.subtitle;
        break;
    }
    return target;
  }

  waitForTarget(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkTarget = () => {
        let target;
        switch (this.elementType) {
          case 'TITLE':
            target = this.title;
            break;
          case 'SUBTITLE':
            target = this.subtitle;
            break;
          default:
            target = this.paragraph;
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
}
