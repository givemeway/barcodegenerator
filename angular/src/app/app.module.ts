import { AuthService } from './components/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AuthComponent } from './components/auth/auth.component';
import { NavbarComponent } from './components/navbar/navbar.component';

import { ReportsComponent } from './components/auth/reports/reports.component';
import { DetailsComponent } from './components/auth/reports/details/details.component';

const AppRoutes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },

      { path: 'reports', component: ReportsComponent },
      { path: 'reports/details', component: DetailsComponent },
    ],
  },
  { path: 'navbar', component: NavbarComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    NavbarComponent,

    ReportsComponent,
    DetailsComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(AppRoutes),
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [AuthService, ReportsComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
