import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'runtime', standalone: true })
export class RuntimePipe implements PipeTransform {
  transform(minutes: number | null): string {
    if (minutes == null || minutes <= 0) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}
