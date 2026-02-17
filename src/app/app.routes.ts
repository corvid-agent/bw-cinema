import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    title: 'BW Cinema — Classic Black & White Films',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'browse',
    title: 'Browse Films — BW Cinema',
    loadComponent: () => import('./features/browse/browse.component').then((m) => m.BrowseComponent),
  },
  {
    path: 'movie/:id',
    title: 'Film Details — BW Cinema',
    loadComponent: () => import('./features/movie/movie.component').then((m) => m.MovieComponent),
  },
  {
    path: 'watch/:id',
    title: 'Now Playing — BW Cinema',
    loadComponent: () => import('./features/watch/watch.component').then((m) => m.WatchComponent),
  },
  {
    path: 'collection',
    title: 'My Collection — BW Cinema',
    loadComponent: () =>
      import('./features/collection/collection.component').then((m) => m.CollectionComponent),
  },
  {
    path: 'director/:name',
    title: 'Director — BW Cinema',
    loadComponent: () =>
      import('./features/director/director.component').then((m) => m.DirectorComponent),
  },
  {
    path: 'compare',
    title: 'Compare Films — BW Cinema',
    loadComponent: () => import('./features/compare/compare.component').then((m) => m.CompareComponent),
  },
  {
    path: 'about',
    title: 'About — BW Cinema',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'genre/:name',
    title: 'Genre — BW Cinema',
    loadComponent: () => import('./features/genre/genre.component').then((m) => m.GenreComponent),
  },
  {
    path: 'decade/:year',
    title: 'Decade — BW Cinema',
    loadComponent: () => import('./features/decade/decade.component').then((m) => m.DecadeComponent),
  },
  {
    path: 'stats',
    title: 'Catalog Statistics — BW Cinema',
    loadComponent: () => import('./features/stats/stats.component').then((m) => m.StatsComponent),
  },
  {
    path: 'quiz',
    title: 'What Should I Watch? — BW Cinema',
    loadComponent: () => import('./features/quiz/quiz.component').then((m) => m.QuizComponent),
  },
  {
    path: 'wrapped',
    title: 'Year in Review — BW Cinema',
    loadComponent: () => import('./features/wrapped/wrapped.component').then((m) => m.WrappedComponent),
  },
  {
    path: 'actor/:name',
    title: 'Actor — BW Cinema',
    loadComponent: () => import('./features/actor/actor.component').then((m) => m.ActorComponent),
  },
  {
    path: 'explore',
    title: 'Explore — BW Cinema',
    loadComponent: () => import('./features/explore/explore.component').then((m) => m.ExploreComponent),
  },
  {
    path: '**',
    title: 'Page Not Found — BW Cinema',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
