import { NgClass, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import hljs from 'highlight.js';
import { NodeMakerService } from '../node-maker.service';

@Component({
  selector: 'app-code-snippet',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgFor, NgClass],
  templateUrl: './code-snippet.component.html',
  styleUrl: './code-snippet.component.css'
})
export class CodeSnippetComponent {
  // Event Emitters
  @Output() changeComponent = new EventEmitter();
  @Output() focusComponent = new EventEmitter<string>();
  @Output() focused = new EventEmitter();

  @ViewChild('codeSnippet', { read: ElementRef }) codeSnippet: ElementRef<HTMLElement> | undefined;
  languages: Array<any> = [
    { name: 'Bash', class: 'language-bash' },
    { name: 'C', class: 'language-c' },
    { name: 'C++', class: 'language-cpp' },
    { name: 'C#', class: 'language-csharp' },
    { name: 'CSS', class: 'language-css' },
    { name: 'Dockerfile', class: 'language-dockerfile' },
    { name: 'Go', class: 'language-go' },
    { name: 'HTML/XML', class: 'language-xml' },
    { name: 'Java', class: 'language-java' },
    { name: 'Javascript', class: 'language-javascript' },
    { name: 'JSON', class: 'language-json' },
    { name: 'Kotlin', class: 'language-kotlin' },
    { name: 'PHP', class: 'language-php' },
    { name: 'Python', class: 'language-python' },
    { name: 'Ruby', class: 'language-ruby' },
    { name: 'SCSS', class: 'language-scss' },
    { name: 'SQL', class: 'language-sql' },
    { name: 'Swift', class: 'language-swift' },
    { name: 'Typescript', class: 'language-typescript' },
    { name: 'YAML', class: 'language-yaml' }
  ];
  selectedLanguage: any = { name: 'Javascript', class: 'language-javascript' };
  componentBefore: string = 'NONE';
  id: string = '';

  constructor(private nodeMakerService: NodeMakerService) { }

  onBlur() {
    this.highlightCode();
  }

  onFocus() {
    this.focused.emit();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      if (selection && range) {
        const cursorNode = range.endContainer;
        const cursorOffset = range.endOffset;
        if (cursorNode.nodeType === Node.TEXT_NODE && cursorOffset === cursorNode.textContent?.length) {
          this.focusComponent.emit('AFTER');
        } else if (cursorNode.nodeType === Node.ELEMENT_NODE && cursorOffset === cursorNode.childNodes.length) {
          this.focusComponent.emit('AFTER');
        }
      }
    }
    else if (event.key === 'ArrowLeft') {
      const selection = window.getSelection();
      if (selection) {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range.startOffset == 0 && range.endOffset == 0) {
            if (this.componentBefore !== 'NONE') {
              this.focusComponent.emit('BEFORE');
            }
          }
        }
      }
    }
    else if (event.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection) {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let text = this.codeSnippet?.nativeElement.textContent || '';
          if (range.startOffset == 0 && range.endOffset == 0 && text?.length == 0) {
            this.changeComponent.emit();
          }
        }
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedContent = event.clipboardData?.getData('text/plain');
    if (pastedContent) {
      this.paste(pastedContent);
    }
  }

  // Setters
  setLanguage(language: any) {
    this.selectedLanguage = language;
    setTimeout(() => {
      this.highlightCode();
    }, 100);
  }

  setData(data: any) {
    this.selectedLanguage = data.language;
    if (this.codeSnippet?.nativeElement) {
      this.codeSnippet.nativeElement.innerHTML = data.code;
    }
  }

  setComponentBefore(componentBefore: string) {
    this.componentBefore = componentBefore;
  }

  setId(id: string) {
    this.id = id;
  }

  // Getters
  getData() {
    let code = this.codeSnippet?.nativeElement.textContent || this.codeSnippet?.nativeElement.innerText || '';
    let data = {
      language: this.selectedLanguage,
      code: code
    }
    return data;
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

  // Clipboard Functions
  paste(text: string) {
    if (this.codeSnippet?.nativeElement) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(this.nodeMakerService.createTextNode(text));

        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        this.codeSnippet.nativeElement.normalize();
      }
    }
  }

  placeCursorAtEnd(): void {
    if (this.codeSnippet) {
      const element = this.codeSnippet.nativeElement;
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
}
