import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidatorsService } from '../../shared/services/validators.service';

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

  constructor(private validatorService: ValidatorsService) { }

  imageForm = new FormGroup({
    src: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [this.validatorService.imageUrl()], updateOn: 'blur'
    }),
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

  onSubmit() {
    if (this.imageForm.valid) {
      this.closeMenu();
      this.selection.emit({ type: 'IMAGE', src: this.imageForm.get('src')?.value, alt: this.imageForm.get('alt')?.value });
    }
    else {
      this.imageForm.markAllAsTouched();
    }
  }
}