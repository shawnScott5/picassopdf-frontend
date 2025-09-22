import { Component } from '@angular/core';
import { navbarData } from './nav-data';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  collapsed = false;
  navData = navbarData;
}
