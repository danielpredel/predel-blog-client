import { Component } from '@angular/core';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  // src: string = 'https://cdn.environment.sa.gov.au/img/eyJidWNrZXQiOiJlbnZzYS1idWNrZXQiLCJrZXkiOiJsYW5kc2NhcGUvaW1hZ2VzL3N0YXRld2lkZS9sYnNhLWhlcm9fMjAyMy0wOC0wOC0wMTU5MjRfdWpzaC5qcGciLCJlZGl0cyI6eyJ3ZWJwIjp7InF1YWxpdHkiOjgyfSwicmVzaXplIjp7IndpZHRoIjoxMjAwLCJoZWlnaHQiOjQ5NSwiZml0IjoiY292ZXIifX19';
  src: string = '';
  alt: string = '';
  caption: string = '';
}
