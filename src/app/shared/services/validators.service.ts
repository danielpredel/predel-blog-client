import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  constructor(private http: HttpClient) { }

  // Sync Validators
  matchPasswordValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    return control.value.password === control.value.confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  emailDomain(control: FormControl): ValidationErrors | null {
    if (control.value) {
      const email = control.value;
      const domain = email.split('@')[1]?.toLowerCase();
      const allowedDomains = ['gmail.com', 'outlook.com'];
      if (!allowedDomains.includes(domain)) {
        return { emailDomainError: true };
      }
    }
    return null;
  }

  noWhitespace(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      const name = control.value as string;
      if ((name || '').trim().length === 0) {
        return { whitespaceError: true };
      }
    }
    return null;
  }

  minus(control: FormControl): ValidationErrors | null {
    if (control.value) {
      const password = control.value;
      const pattern = /.*[a-z].*[a-z]/;
      if (!pattern.test(password)) {
        return { minusError: true }
      }
    }
    return null;
  }

  mayus(control: FormControl): ValidationErrors | null {
    if (control.value) {
      const password = control.value;
      const pattern = /.*[A-Z].*[A-Z]/;
      if (!pattern.test(password)) {
        return { mayusError: true }
      }
    }
    return null;
  }

  digits(control: FormControl): ValidationErrors | null {
    if (control.value) {
      const password = control.value;
      const pattern = /.*\d.*\d/;
      if (!pattern.test(password)) {
        return { digitsError: true }
      }
    }
    return null;
  }

  symbols(control: FormControl): ValidationErrors | null {
    if (control.value) {
      const password = control.value;
      const pattern = /.*[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/;
      if (!pattern.test(password)) {
        return { symbolsError: true }
      }
    }
    return null;
  }

  // Async Validators
  imageUrl(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;

      if (!value) {
        return of(null);
      }

      return this.http.head(value, { observe: 'response' }).pipe(
        map(response => {
          const contentType = response.headers.get('Content-Type');
          return contentType && contentType.startsWith('image/') ? null :
            { urlError: true };
        }),
        catchError(() => of({ urlError: true }))
      );
    };
  }

  availableEmail(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;

      if (!value) {
        return of(null);
      }

      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      const params = new HttpParams().set('email', value);

      return this.http.get<any>(`${environment.baseUrl}/users/check-email`, { headers, params }).pipe(
        map(response => {
          if (response.success) {
            return response.available ? null : { emailTaken: true };
          }
          return { emailError: true };
        }),
        catchError(() => of({ emailError: true }))
      );
    };
  }
}