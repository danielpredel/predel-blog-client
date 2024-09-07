import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidatorsService } from '../../shared/services/validators.service';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-meta',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './meta.component.html',
  styleUrl: './meta.component.css'
})
export class MetaComponent {
  sessionEnded: boolean = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private userService: UserService, private validatorService: ValidatorsService,
    private authService: AuthService) { }

  form = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5),
      Validators.maxLength(100), this.validatorService.noWhitespace], updateOn: 'change'
    }),
    image: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [this.validatorService.imageUrl()], updateOn: 'blur'
    })
  }, { updateOn: 'submit' });

  onSubmit() {
    if (this.form.valid) {
      const title = this.form.get('title')?.value || '';
      const image = this.form.get('image')?.value || '';
      this.userService.createPost(title, image).subscribe({
        next: (response) => {
          this.authService.setToken(response.token);
          this.toEditor(response.postId);
        },
        error: (error) => {
          this.sessionEnded = true;
          this.authService.clearSession();
          setTimeout(() => this.toLogin(), 5000);
        }
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  toEditor(postId: string) {
    this.router.navigate(['../', postId], { relativeTo: this.activatedRoute });
  }

  toLogin() {
    this.router.navigate(['/user/login']);
  }
}
