import { Component } from '@angular/core';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  src: string = '';
  alt: string = '';
  caption: string = '';
  id: string = '';
  componentBefore: string = 'NONE';

  setId(id: string) {
    this.id = id;
  }

  setData(data: any) {
    this.src = data.src;
    this.alt = data.alt;
  }

  setComponentBefore(type: string) {
    this.componentBefore = type;
  }
}
