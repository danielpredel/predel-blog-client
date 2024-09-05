import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private authService: AuthService) { }

  isLogged(){
    return this.authService.isLogged();
  }

  getProfileImageUrl(){
    return this.authService.getProfileImageUrl();
  }

  logout(){
    this.authService.clearSession();
  }
}
