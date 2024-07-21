import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdService {
  currentId: number = 1;

  constructor() { }

  getId() {
    return this.currentId++;
  }
}
