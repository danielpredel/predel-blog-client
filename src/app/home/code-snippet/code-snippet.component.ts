import { Component, ElementRef, ViewChild } from '@angular/core';
import { NodeMakerService } from '../../shared/services/node-maker.service';
import { NgClass } from '@angular/common';
import hljs from 'highlight.js';

@Component({
  selector: 'app-code-snippet',
  standalone: true,
  imports: [NgClass],
  templateUrl: './code-snippet.component.html',
  styleUrl: './code-snippet.component.css'
})
export class CodeSnippetComponent {
  @ViewChild('codeSnippet', { read: ElementRef }) codeSnippet: ElementRef<HTMLElement> | undefined;

  language: { name: string; class: string; } = { name: 'Javascript', class: 'language-javascript' };

  setData(data: any) {
    this.language = data.language;
    if (this.codeSnippet?.nativeElement) {
      this.codeSnippet.nativeElement.innerHTML = data.code;
      this.highlightCode();
    }
  }

  highlightCode() {
    let code = this.codeSnippet?.nativeElement.textContent
      || this.codeSnippet?.nativeElement.innerText || '';
    code = this.escapeCode(code);
    if (this.codeSnippet?.nativeElement) {
      this.codeSnippet.nativeElement.innerHTML = code;
      if (this.codeSnippet?.nativeElement?.dataset['highlighted']) {
        delete this.codeSnippet?.nativeElement.dataset['highlighted'];
      }
      hljs.highlightElement(this.codeSnippet?.nativeElement);
    }
  }

  escapeCode(code: string) {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
