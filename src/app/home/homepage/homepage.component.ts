import { Component } from '@angular/core';
import { BlogEntryComponent } from "../blog-entry/blog-entry.component";

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [BlogEntryComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {

}
