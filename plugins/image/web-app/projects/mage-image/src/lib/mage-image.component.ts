import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'lib-image',
    template: `
    <p>
      image works!
    </p>
  `,
    styles: [],
    standalone: false
})
export class ImageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
