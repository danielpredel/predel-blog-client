import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NodeMakerService {

  constructor() { }

  createTextNode(text: string) {
    const node = document.createTextNode(text);
    return node;
  }

  createLinkNode(text: string, url: string, id: string = '') {
    const node = document.createElement('a');
    node.href = url;
    if (id != '') {
      node.id = id;
    }
    node.textContent = text;
    return node;
  }

  createBoldNode(text: string, id: string = '') {
    const node = document.createElement('b');
    if (id != '') {
      node.id = id;
    }
    node.className = "uk-text-bolder";
    node.classList.add("uk-text-emphasis");
    node.textContent = text;
    return node;
  }

  createItalicNode(text: string, id: string = '') {
    const node = document.createElement('i');
    if (id != '') {
      node.id = id;
    }
    node.textContent = text;
    return node;
  }

  createStrikeNode(text: string, id: string = '') {
    const node = document.createElement('s');
    if (id != '') {
      node.id = id;
    }
    node.textContent = text;
    return node;
  }
}
