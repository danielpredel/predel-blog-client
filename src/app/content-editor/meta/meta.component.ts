import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-meta',
  standalone: true,
  imports: [],
  templateUrl: './meta.component.html',
  styleUrl: './meta.component.css'
})
export class MetaComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  toEditor(){
    this
    this.router.navigate(['../12345'], { relativeTo: this.activatedRoute });
  }
}
