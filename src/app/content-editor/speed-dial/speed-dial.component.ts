import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-speed-dial',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './speed-dial.component.html',
  styleUrl: './speed-dial.component.css'
})
export class SpeedDialComponent {
  open: boolean = false;
  @Output() selection = new EventEmitter<any>();

  imageForm = new FormGroup({
    src: new FormControl('', [Validators.required, this.urlImageValidator]),
    alt: new FormControl('')
  });

  openMenu() {
    this.open = true;
  }

  closeMenu() {
    this.open = false;
  }

  setSection(type: string) {
    this.closeMenu();
    this.selection.emit({ type });
  }

  // Form validation
  urlImageValidator(control: FormControl): { [key: string]: any } | null {
    const pattern = /^(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|png|gif|bmp|svg|webp)$/;
    if (!pattern.test(control.value)) {
      return { urlError: 'URL Error' };
    }
    return null;
  }

  onSubmit() {
    this.closeMenu();
    if (this.imageForm.valid) {
      this.selection.emit({ type: 'IMAGE', src: this.imageForm.get('src')?.value, alt: this.imageForm.get('alt')?.value });
    }
  }
}