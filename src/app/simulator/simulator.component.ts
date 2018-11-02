import { Component, OnInit, OnDestroy } from '@angular/core';
import GeoJSON from './countries.geo';
import data from './co2';

import { LoadingService } from '../loading.service';

declare var window;
declare var L;

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.scss']
})
export class SimulatorComponent implements OnInit, OnDestroy {

  public map;
  public geo;

  public inputAgri = '';
  public inputForest = '';

  public totalAgri = 0;
  public totalForest = 0;

  public offsetAgri = 0;
  public offsetForest = 0;

  public acreReduction = 0.0000004;
  public acreReductionForest = 0.0000000025;

  public countries = [];

  constructor(public ls: LoadingService) {

  }

  ngOnDestroy() {
    this.ls.loading = true;
  }

  ngOnInit() {
    this.ls.loading = true;

    this.countries = data;

    this.createMap().then(() => {
      this.ls.loading = false;
    });
  }

  rmAgri() {
    if (this.inputAgri && !isNaN(parseFloat(this.inputAgri))) {
      this.totalAgri -= parseFloat(this.inputAgri);
      this.calculateReduction();
    }
  }

  addAgri() {
    if (this.inputAgri && !isNaN(parseFloat(this.inputAgri))) {
      this.totalAgri += parseFloat(this.inputAgri);
      this.calculateReduction();
    }
  }

  rmForest() {
    if (this.inputForest && !isNaN(parseFloat(this.inputForest))) {
      this.totalForest -= parseFloat(this.inputForest);
      this.calculateReduction();
    }
  }

  addForest() {
    if (this.inputForest && !isNaN(parseFloat(this.inputForest))) {
      this.totalForest += parseFloat(this.inputForest);
      this.calculateReduction();
    }
  }

  calculateReduction() {
    this.offsetAgri = this.totalAgri * 1000 * this.acreReduction;
    this.offsetForest = this.totalForest * 1000 * this.acreReductionForest;

    const total = this.offsetAgri + this.offsetForest;

    this.countries = this.countries.map(country => {
      country['eta'] = (country['co2_mt'] / total) + ' years';
      return country;
    });

    this.updateLayers();
  }

  getColor(name) {
    let country;
    for (let i = 0; i < this.countries.length; i++) {
      country = this.countries[i];
      if (country.Code === name) { break; }
    }

    const offset = this.offsetAgri + this.offsetForest;
    let value = 0.5;

    if (country && offset > 0) {
      const co2 = parseFloat(country.co2_mt);
      value = offset  / ((co2 + offset) / 2) * 100;
      if (value > 1) {
        value = 1;
      }
    }

    return this.getHSL(1 - value);
  }

  getHSL(value = 0.5, hue0 = 120, hue1 = 0) {
    const hue = (value * (hue1 - hue0)) + hue0;
    return `hsl(${hue}, 100%, 50%)`;
  }

  updateLayers() {
    let max = 0;
    this.geo.eachLayer(layer => {
      if (max < 5 || layer.feature.id === 'CAN') {
        max++;
      }

      layer.setStyle({
        fillColor: this.getColor(layer.feature.id),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
      });
    });
  }

  createMap() {
    return new Promise((resolve, reject) => {
      this.map = L.map('map').setView([62.2270, -105.3809], 2);
      L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
        {
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            minZoom: 2,
            maxZoom: 2,
            subdomains: 'abcd'
        }
      ).addTo(this.map);

      this.geo = L.geoJSON(
        GeoJSON,
        {
          style: (feature) => {
            return {
              fillColor: this.getColor(feature.id),
              weight: 2,
              opacity: 1,
              color: 'white',
              dashArray: '3',
              fillOpacity: 0.5
            };
          }
        }
      ).addTo(this.map);

      this.map.setMaxBounds(this.geo.getBounds());
      
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        return resolve('Complete');
      }, 1500);
    });
  }

}
