import { NgForm } from '@angular/forms';
import { AuthService } from './../auth.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers: [],
})
export class NavbarComponent implements OnInit {
  constructor(private router: Router, public authService: AuthService) {}

  ngOnInit() {}
  onLogout() {}

  Search(f: NgForm) {}
}
