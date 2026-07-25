import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { User } from '../../../models/user.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IuserService } from '../../../services/iuser.service';
import { Menu } from '../../../models/menu.model';
import { IMenuService } from '../../../services/imenu.service';
import { ScriptLoaderService } from '../../../services/script.loader.service';
import { ILoginService } from '../../../services/ilogin.service';
import { environment } from '../../../../environments/environment';

declare var $: any;


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {
  currentUser: User = new User();
  allMenus: Menu[] = [];
  menus: Menu[] = [];
  searchTerm: string = '';
  fileUrl = environment.fileUrL;

  constructor(
    private iuserService: IuserService,
    private imenuService: IMenuService,
    private router: Router,
    private scriptLoaderService: ScriptLoaderService,
    private iLoginService: ILoginService
  ) {
    this.currentUser = iuserService.getCurrentUser();
    if (this.currentUser.u_id == 0 || !this.currentUser) {
      this.router.navigate(['login']);
    }
    if (this.currentUser.u_is_admin != 'Y') {
      this.router.navigate(['access-denied']);
    }

    // Clear stale jQuery-assigned active classes on child menu items on route navigation
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => {
        if (typeof $ !== 'undefined') {
          $('#sidebar-menu').find('ul.child_menu li').removeClass('active');
        }
      }, 50);
    });
  }

  ngOnInit(): void {
    this.getMenusByRole();
  }

  ngAfterViewInit(): void {
    this.scriptLoaderService.loadScripts();
  }

  getMenusByRole() {
    this.imenuService.getMenusByRole(this.currentUser.u_id).subscribe(
      (data: Menu[]) => {
        this.allMenus = data;
        this.menus = data;
        this.scriptLoaderService.loadScripts();
      },
      (error: any) => {
        console.error('Error fetching menus', error);
      }
    );
  }

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.searchTerm = term;

    if (!term) {
      this.menus = [...this.allMenus];
      // Reset expansion state
      this.menus.forEach((m: any) => m.isSearchMatch = false);
      // Re-run scripts to ensure standard click logic is restored
      setTimeout(() => this.scriptLoaderService.loadScripts(), 100);
      return;
    }

    this.menus = this.allMenus.map(menu => {
      const menuMatches = menu.m_name.toLowerCase().includes(term);
      const filteredItems = menu.m_menu_items.filter(item =>
        item.m_name.toLowerCase().includes(term)
      );

      if (menuMatches || filteredItems.length > 0) {
        // Expand matches automatically
        return {
          ...menu,
          m_menu_items: filteredItems.length > 0 ? filteredItems : menu.m_menu_items,
          isSearchMatch: true // Flag for CSS/HTML to force block display
        };
      }
      return null;
    }).filter(menu => menu !== null) as any[];

    // Ensure the new elements are interactive
    setTimeout(() => this.scriptLoaderService.loadScripts(), 100);
  }

  navigateTo(moveto: string) {
    this.router.navigate(['/' + moveto]);
  }

  isActive(route: string): boolean {
    if (!route) return false;
    const currentUrl = this.router.url.split('?')[0].replace(/^\/+|\/+$/g, '');
    const targetRoute = route.split('?')[0].replace(/^\/+|\/+$/g, '');
    return currentUrl === targetRoute;
  }

  logout() {
    this.iLoginService.logout();
    this.router.navigate(['login']);
  }
}
