import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

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

  isLogged(){
    return this.getToken() ? true : false;
  }
}
