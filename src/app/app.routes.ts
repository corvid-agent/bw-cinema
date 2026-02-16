import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'browse',
    loadComponent: () => import('./features/browse/browse.component').then((m) => m.BrowseComponent),
  },
  {
    path: 'movie/:id',
    loadComponent: () => import('./features/movie/movie.component').then((m) => m.MovieComponent),
  },
  {
    path: 'watch/:id',
    loadComponent: () => import('./features/watch/watch.component').then((m) => m.WatchComponent),
  },
  {
    path: 'collection',
    loadComponent: () =>
      import('./features/collection/collection.component').then((m) => m.CollectionComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  { path: '**', redirectTo: 'home' },
];
