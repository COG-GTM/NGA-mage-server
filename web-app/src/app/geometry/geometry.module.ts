import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeometryPipe } from './geometry.pipe';

@NgModule({
    exports: [
        GeometryPipe
    ],
    imports: [
        CommonModule,
        GeometryPipe
    ]
})
export class GeometryModule { }
