import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ScriptLoaderService } from './services/script.loader.service';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation:ViewEncapsulation.Emulated // or ViewEncapsulation.Emulated, ViewEncapsulation.ShadowDom
})
export class AppComponent implements OnInit{
  constructor(
    private http: HttpClient,
    private scriptLoaderService: ScriptLoaderService,
    private router: Router,
    public loadingService: LoadingService
  ) { 
    // Automatically scroll to top on every route change
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      // Use a timeout to ensure scrolling happens after the new view is rendered
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 0);
    });
  }

  title = 'erp.client';

  ngOnInit() {
    // Initialize or perform any setup
    this.scriptLoaderService.loadScripts();
  }
}
