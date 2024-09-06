import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidatorsService } from '../../shared/services/validators.service';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginStatus: string = 'NONE';

  constructor(private validatorService: ValidatorsService, private authService: AuthService,
    private router: Router) { }

  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email, this.validatorService.emailDomain],
      updateOn: 'change'
    }),
    password: new FormControl('', {
      validators: [Validators.required],
      updateOn: 'change'
    }),
  }, { updateOn: 'submit' });

  onSubmit() {
    if (this.form.valid) {
      const email = this.form.get('email')?.value || '';
      const password = this.form.get('password')?.value || '';
      this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.setSession(response.user.token, response.user.image, response.user.verified)
            this.toHome()
          }
          else {
            this.loginStatus = 'INVALID';
          }
        },
        error: (error) => {
          this.loginStatus = 'ERROR';
        }
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  setSession(token: string, profileImageUrl: string, verified: boolean) {
    this.authService.setSession(token, profileImageUrl, verified);
  }

  toHome() {
    this.router.navigate(['/']);
  }
}
