import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {
  readonly title = signal<string>('Dashboard');

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      const title = route.snapshot.title || this.deriveTitleFromUrl(this.router.url);
      if (title) {
        // Strip app name suffix if present (e.g. "Dashboard | ACME Salary Management" -> "Dashboard")
        const cleanTitle = title.split('|')[0].trim();
        this.title.set(cleanTitle);
      }
    });
  }

  private deriveTitleFromUrl(url: string): string {
    if (url.includes('/employees')) {
      return 'Employees';
    }
    return 'Dashboard';
  }
}
