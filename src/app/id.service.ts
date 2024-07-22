import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdService {
  currentId: number = 1;

  constructor() { }

  getId() {
    let id = this.currentId.toString().padStart(10,'0');
    this.currentId++;
    return id;
  }
}
