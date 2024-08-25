import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  src: string = '';
  alt: string = '';
  caption: string = '';
  id: string = '';
  componentBefore: string = 'NONE';

  srcForm = new FormGroup({
    src: new FormControl('', [Validators.required, this.urlImageValidator])
  });

  altForm = new FormGroup({
    alt: new FormControl('')
  });

  setId(id: string) {
    this.id = id;
  }

  setData(data: any) {
    this.src = data.src;
    this.alt = data.alt;

    this.srcForm.get('src')?.setValue(this.src);
    this.altForm.get('alt')?.setValue(this.alt);
  }

  setComponentBefore(type: string) {
    this.componentBefore = type;
  }

  setSrc() {
    if (this.srcForm.valid) {
      this.src = this.srcForm.get('src')?.value || '';
    }
  }

  setAlt() {
    this.alt = this.altForm.get('alt')?.value || '';
  }

  // Form validation
  urlImageValidator(control: FormControl): { [key: string]: any } | null {
    const pattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)\.(?:jpg|jpeg|png|gif|bmp|svg|webp)$/;
    if (!pattern.test(control.value)) {
      return { urlError: 'URL Error' };
    }
    return null;
  }
}
