import { NgModule } from '@angular/core';
import { BannerComponent } from './baner.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule, BannerComponent],
    exports: [BannerComponent]
})
export class BannerModule { }