import { Component, ElementRef, Input, Renderer, ViewChild } from '@angular/core';
import {expand} from "rxjs/operator/expand";

/**
 * Generated class for the AccordionlistComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'accordionlist',
  templateUrl: 'accordionlist.html'
})
export class AccordionlistComponent {

    @Input() headerColor: string = '#F53D3D';
    @Input() textColor: string = '#FFF';
    @Input() contentColor: string = '#FFF';
    @Input() title: string;
    @Input() hasMargin: boolean = true;
    @Input() s_expanded: string='true';

    @ViewChild('accordionContent') elementView: ElementRef;

    viewHeight: number;
    expanded:boolean=true;

    constructor(public renderer: Renderer) {

    }

    ngOnInit()
    {
        if(this.s_expanded=='true')
            this.expanded=true;
        if(this.s_expanded=='false')
            this.expanded=false;
    }

    ngAfterViewInit() {

        if(this.expanded)
        {
            this.renderer.setElementStyle(this.elementView.nativeElement, 'height', '100%');
        }
        else if(this.expanded===false)
        {
            this.renderer.setElementStyle(this.elementView.nativeElement, 'height', '0px');
        }


    }


    toggleAccordion() {
        this.expanded = !this.expanded;
        const newHeight = this.expanded ? '100%' : '0px';
        this.renderer.setElementStyle(this.elementView.nativeElement, 'height', newHeight);
    }

}
