import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url = environment.baseUrl + '/users'

  constructor(private http: HttpClient, private authService: AuthService) { }

  createUser(name: string, lastname: string, image: string,
    email: string, password: string, confirmPassword: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new HttpParams()
      .set('name', name)
      .set('lastname', lastname)
      .set('image', image)
      .set('email', email)
      .set('password', password)
      .set('confirmPassword', confirmPassword);
    return this.http.post<any>(this.url, body, { headers });
  }

  createPost(title: string, image: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    const body = new HttpParams()
      .set('title', title)
      .set('image', image);
    return this.http.post<any>(this.url + '/posts', body, { headers });
  }
}
