import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidatorsService } from '../../shared/services/validators.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  constructor(private validatorService: ValidatorsService) { }

  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2),
      Validators.maxLength(20), this.validatorService.noWhitespace],
      updateOn: 'change'
    }),
    lastname: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2),
      Validators.maxLength(30), this.validatorService.noWhitespace],
      updateOn: 'change'
    }),
    image: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [this.validatorService.imageUrl()],
      updateOn: 'blur'
    }),
    // check unique email in API
    email: new FormControl('', {
      validators: [Validators.required, Validators.email, this.validatorService.emailDomain],
      asyncValidators: [this.validatorService.availableEmail()],
      updateOn: 'blur'
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8),
      this.validatorService.minus, this.validatorService.mayus,
      this.validatorService.digits, this.validatorService.symbols
      ],
      updateOn: 'change'
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required],
      updateOn: 'change'
    }),
  }, { validators: this.validatorService.matchPasswordValidator, updateOn: 'submit' });

  onSubmit() {
    if (this.form.valid) {
    }
    else {
      this.form.markAllAsTouched();
    }
  }
}
