import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mmss', standalone: true })
export class MmssPipe implements PipeTransform {
  transform(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
