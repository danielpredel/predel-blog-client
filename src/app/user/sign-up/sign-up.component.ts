import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { matchPasswordValidator } from '../match.password.validator';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2),
      Validators.maxLength(20), this.whitespaceValidator],
      updateOn: 'change'
    }),
    lastname: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2),
      Validators.maxLength(30), this.whitespaceValidator],
      updateOn: 'change'
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email, this.emailDomainValidator],
      updateOn: 'change'
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8),
      this.minusValidator, this.mayusValidator, this.digitsValidator, this.symbolsValidator
      ],
      updateOn: 'change'
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required],
      updateOn: 'change'
    }),
    image: new FormControl('', {
      validators: [Validators.required, this.urlImageValidator],
      updateOn: 'change'
    }),
  }, { validators: matchPasswordValidator, updateOn: 'submit' });

  // Form validation
  urlImageValidator(control: FormControl): { [key: string]: any } | null {
    const pattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)\.(?:jpg|jpeg|png|gif|bmp|svg|webp)$/;
    if (!pattern.test(control.value)) {
      return { urlError: 'URL Error' };
    }
    return null;
  }

  emailDomainValidator(control: FormControl): { [key: string]: any } | null {
    if (control.value) {
      const email = control.value;
      const domain = email.split('@')[1]?.toLowerCase();
      const allowedDomains = ['gmail.com', 'outlook.com'];
      if (!allowedDomains.includes(domain)) {
        return { emailDomainError: 'URL Error' };
      }
    }
    return null;
  }

  whitespaceValidator(control: FormControl): { [key: string]: any } | null {
    if (control.value) {
      const name = control.value as string;
      if ((name || '').trim().length === 0) {
        return { whitespaceError: true };
      }
    }
    return null;
  }

  minusValidator(control: FormControl): { [key: string]: any } | null {
    if (control.value) {
      const password = control.value;
      const pattern = /.*[a-z].*[a-z]/;
      if (!pattern.test(password)) {
        return { minusError: true }
      }
    }
    return null;
  }

  mayusValidator(control: FormControl): { [key: string]: any } | null {
    if (control.value) {
      const password = control.value;
      const pattern = /.*[A-Z].*[A-Z]/;
      if (!pattern.test(password)) {
        return { mayusError: true }
      }
    }
    return null;
  }

  digitsValidator(control: FormControl): { [key: string]: any } | null {
    if (control.value) {
      const password = control.value;
      const pattern = /.*\d.*\d/;
      if (!pattern.test(password)) {
        return { digitsError: true }
      }
    }
    return null;
  }

  symbolsValidator(control: FormControl): { [key: string]: any } | null {
    if (control.value) {
      const password = control.value;
      const pattern = /.*[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/;
      if (!pattern.test(password)) {
        return { symbolsError: true }
      }
    }
    return null;
  }

  onSubmit() {
    if (this.form.valid) {
    }
    else {
      this.form.markAllAsTouched();
    }
  }
}
