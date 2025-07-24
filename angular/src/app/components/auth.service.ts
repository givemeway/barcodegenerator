import {
  HttpClient,
  HttpHeaders,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class AuthService {
  isDev = false;
  isLoggedIn: any;
  rows_columns_list: any;
  LoggedInUserName: any;
  LoggedInEmail: any;
  ReportDetails: any;
  authenticate = false;
  constructor(private http: HttpClient) {}

  hostURL(isDev: any, route: any) {
    if (isDev) {
      return 'http://localhost:3000' + route;
    } else {
      return route;
    }
  }

  getBar(code: any, bar_options: any, truncate: any): Observable<any> {
    var token = localStorage.getItem('token') || [];
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token,
    });

    const URL = this.hostURL(this.isDev, '/auth/reports');

    return this.http
      .post(URL, { code, bar_options, truncate }, { headers: headers })
      .pipe(
        tap((data: any) => {
          catchError((err: any) => throwError(err));

          return data;
        })
      );
  }

  errorHandler(error: HttpErrorResponse) {
    console.log('error triggered');
    let errorMessage = 'Unknown Error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    alert(errorMessage);
    return throwError(errorMessage);
  }

  generateReport(QueryBuilder: any) {
    console.log(QueryBuilder);

    const headers = new HttpHeaders();
    const token = localStorage.getItem('token') || [];
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', token);
    const URL = this.hostURL(this.isDev, '/auth/reports');

    return this.http.post(URL, QueryBuilder, { headers: headers }).pipe(
      map((data: any) => {
        catchError((error) => {
          return error;
        });

        return data;
      })
    );
  }
}
