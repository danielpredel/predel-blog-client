import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-meta',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './meta.component.html',
  styleUrl: './meta.component.css'
})
export class MetaComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  form = new FormGroup({
    image: new FormControl('', [Validators.required, this.urlImageValidator]),
    title: new FormControl('', Validators.required)
  });

  // Form validation
  urlImageValidator(control: FormControl): { [key: string]: any } | null {
    const pattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)\.(?:jpg|jpeg|png|gif|bmp|svg|webp)$/;
    if (!pattern.test(control.value)) {
      return { urlError: 'URL Error' };
    }
    return null;
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.get('title')?.value)
      console.log(this.form.get('image')?.value)
      // this.selection.emit({ type: 'IMAGE', src: this.form.get('src')?.value, alt: this.form.get('alt')?.value });
    }
  }

  toEditor() {
    this.router.navigate(['../12345'], { relativeTo: this.activatedRoute });
  }
}
