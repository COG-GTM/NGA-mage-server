import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss'],
    imports: [NgClass]
})
export class InfoComponent {
  backgrounds = [
    'mage-1-bg',
    'mage-2-bg',
    'mage-3-bg',
    'mage-4-bg'
  ]

  background = this.backgrounds[Math.floor(Math.random() * 4)]
}
