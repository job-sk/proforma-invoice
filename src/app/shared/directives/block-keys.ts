import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[blockKeys]',
  standalone: true,
  host:{
    '(keydown)': 'onKeyDown($event)'
  }
})
export class BlockKeys {
  constructor() {}

  @Input() blockKeys: string[] = [];

  onKeyDown(event: KeyboardEvent) {
    if (this.blockKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
