import { NgClass, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidatorsService } from '../../shared/services/validators.service';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  @ViewChild('caption', { read: ElementRef }) capptionElement: ElementRef<HTMLElement> | undefined;
  @Output() changeComponent = new EventEmitter();
  src: string = '';
  alt: string = '';
  id: string = '';
  componentBefore: string = 'NONE';

  constructor(private validatorService: ValidatorsService) { }

  srcForm = new FormGroup({
    src: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [this.validatorService.imageUrl()], updateOn: 'blur'
    })
  });

  altForm = new FormGroup({
    alt: new FormControl('')
  });

  // Setters
  setId(id: string) {
    this.id = id;
  }

  setData(data: any) {
    this.src = data.src;
    this.alt = data.alt;
    if (this.capptionElement) {
      this.capptionElement.nativeElement.textContent = data.caption || '';
    }

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

  // Getters
  getData() {
    let caption = this.capptionElement?.nativeElement.textContent || '';
    return { src: this.src, alt: this.alt, caption };
  }
}
