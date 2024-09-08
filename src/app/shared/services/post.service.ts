import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  url = environment.baseUrl + '/posts'

  constructor(private http: HttpClient) { }

  getPosts() {
    return this.http.get<any>(this.url);
  }

  getPost(id: string) {
    return this.http.get<any>(`${this.url}/${id}`);
  }
}
