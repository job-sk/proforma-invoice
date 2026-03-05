import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[blockKeys]',
  standalone: true
})
export class BlockKeys {
  constructor() {}

  @Input() blockKeys: string[] = [];

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.blockKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
