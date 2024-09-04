import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidatorsService } from '../../shared/services/validators.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  constructor(private validatorService: ValidatorsService, private userService: UserService) { }

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
      const name = this.form.get('name')?.value || '';
      const lastname = this.form.get('lastname')?.value || '';
      const image = this.form.get('image')?.value || '';
      const email = this.form.get('email')?.value || '';
      const password = this.form.get('password')?.value || '';
      const confirmPassword = this.form.get('confirmPassword')?.value || '';
      this.userService.createUser(name, lastname, image, email, password, confirmPassword).subscribe({
        next: (response) => {
          if (response.success) {
            // Save token, image and verified in cookie
          }
          else {
            alert(response.message)
          }
          // to home
        },
        error: (error) => {
          alert('Error al crear el usuario:' + error);
        }
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }
}
