import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-about.us',
  templateUrl: './about.us.component.html',
  styleUrl: './about.us.component.css'
})
export class AboutUsComponent implements OnInit {

  constructor(private titleService: Title, private metaService: Meta) {}

  ngOnInit(): void {
    this.titleService.setTitle('About Captain - Lead to Win');
    this.metaService.updateTag({ name: 'description', content: 'Learn about Captain (HUSI International), our mission to inspire sportsmanship, and our commitment to crafting premium-quality sporting goods.' });
    this.metaService.updateTag({ property: 'og:title', content: 'About Captain - Lead to Win' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
  }

}
