import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = environment.baseUrl + '/auth';

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new HttpParams()
      .set('email', email)
      .set('password', password);
    return this.http.post<any>(this.url + '/login', body, { headers });
  }

  setSession(token: string, profileImageUrl: string, verified: boolean) {
    this.setToken(token);
    this.setProfileImageUrl(profileImageUrl);
    this.setVerified(verified);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  setProfileImageUrl(profileImageUrl: string) {
    localStorage.setItem('profileImageUrl', profileImageUrl);
  }

  setVerified(verified: boolean) {
    localStorage.setItem('verified', verified ? 'true' : 'false');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getProfileImageUrl() {
    return localStorage.getItem('profileImageUrl');
  }

  getVerified() {
    let verified = localStorage.getItem('verified');
    if (verified) {
      return verified === 'true' ? true : false;
    }
    return null;
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  removeProfileImageUrl() {
    localStorage.removeItem('profileImageUrl');
  }

  removeVerified() {
    localStorage.removeItem('verified');
  }

  clearSession() {
    localStorage.clear();
  }

  isLogged() {
    return this.getToken() ? true : false;
  }
}
