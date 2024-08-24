import { NgClass, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import hljs from 'highlight.js';
import { NodeMakerService } from '../node-maker.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-code-snippet',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgFor, NgClass, FormsModule],
  templateUrl: './code-snippet.component.html',
  styleUrl: './code-snippet.component.css'
})
export class CodeSnippetComponent {
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

  constructor(private nodeMakerService: NodeMakerService) { }

  onBlur() {
    this.highlightCode();
  }

  onKeydown(event: KeyboardEvent) {
    // event.preventDefault();
    // console.log(event.key)
    if (event.key === "ArrowRight") {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      if (selection && range) {

        // Obtiene el nodo donde está el cursor
        const cursorNode = range.endContainer;
        const cursorOffset = range.endOffset;

        // Verifica si el cursor está al final del texto
        if (cursorNode.nodeType === Node.TEXT_NODE && cursorOffset === cursorNode.textContent?.length) {
          console.log('Cursor al final del nodo de texto, flecha derecha presionada.');
          // Añade aquí tu lógica adicional
        } else if (cursorNode.nodeType === Node.ELEMENT_NODE && cursorOffset === cursorNode.childNodes.length) {
          console.log('Cursor al final del elemento, flecha derecha presionada.');
          // Añade aquí tu lógica adicional
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

  setLanguage(language: any) {
    this.selectedLanguage = language;
    setTimeout(() => {
      this.highlightCode();
    }, 100);
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
}
