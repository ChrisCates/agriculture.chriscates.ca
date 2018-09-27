import { Component, OnInit } from '@angular/core';
import GeoJSON from './countries.geo';

declare var window;
declare var L;

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.scss']
})
export class SimulatorComponent implements OnInit {

  public map;
  public geo;

  public countries = [];

  constructor() {

  }

  ngOnInit() {
    this.map = L.map('map').setView([62.2270, -105.3809], 4);
    L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
      {
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
          maxZoom: 4,
          subdomains: 'abcd'
      }
    ).addTo(this.map);

    this.geo = L.geoJSON(
      GeoJSON,
      {
        onEachFeature: (feature, layer) => {
          console.log(feature);
          this.countries.push({
            'name': feature.properties.name,
            'acres': 0
          });
        }
      }
    ).addTo(this.map);

    this.map.setMaxBounds(this.geo.getBounds());
    
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 250);
  }

}
