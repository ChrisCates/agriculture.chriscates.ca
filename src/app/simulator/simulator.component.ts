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

  public search = '';

  public ghgInc = 0;
  public ghgDec = 0;

  public timeline = 'N/A';

  public acreReduction = 0.0000004;

  public countries = [];

  constructor(public ls: LoadingService) {

  }

  ngOnDestroy() {
    this.ls.loading = true;
  }

  ngOnInit() {
    this.ls.loading = true;
    this.formatData()
    .then(() => {
      this.createMap()
      .then(() => {
        this.ls.loading = false;
      });
    });
  }

  getColor(name) {
    const { value } = this.getRatio(name);
    const hue = ((1 - value) * 120).toString(10);
    return `hsl(${hue}, 100%, 50%)`;
  }

  getImpact(country) {
    const { value, change } = this.getRatio(country);
    return (change * 100).toFixed(2);
  }

  getRatio(c) {
    let value = 0.5;
    let emissions = 0;
    let acres = 0;
    for (let i = 0; i < this.countries.length; i++) {
      const country = this.countries[i];
      if (c === country.Code) {
        emissions = country['co2_mt'];
        acres = country['acres'];
        break;
      }
    }

    const diff = emissions - (acres * this.acreReduction);
    const change = diff / this.ghgInc;

    value += change;

    if (value > 1) {
      value = 1;
    } else if (value < 0) {
      value = 0;
    }

    if (c === 'CAN') {
      console.log(c, acres, diff, change);
    }

    return { value, change } ;
  }

  formatData() {
    return new Promise((resolve, reject) => {
      this.countries = data;
      this.ghgInc = 0;

      this.countries = this.countries.map(country => {
        this.ghgInc += parseFloat(country['co2_mt']);

        country['acres'] = 0;
        country['io'] = 1000;
        return country;
      });

      return resolve('Complete');
    });
  }

  reduceAgri(country) {
    country['acres'] -= country['io'];
    this.calculateReduction();
  }

  increaseAgri(country) {
    country['acres'] += country['io'];
    this.calculateReduction();
  }

  calculateReduction() {
    this.ghgDec = 0;

    this.countries.forEach(country => {
      this.ghgDec += country['acres'];
    });

    const fmtGhgDec = this.ghgDec * this.acreReduction;

    if (this.ghgDec > 0) {
      this.timeline = (this.ghgInc / fmtGhgDec).toFixed(2);
    } else {
      this.timeline = 'N/A';
    }

    this.updateLayers();
  }

  updateLayers() {
    let max = 0;
    this.geo.eachLayer(layer => {
      if (max < 5 || layer.feature.id === 'CAN') {
        console.log(layer.feature.id, this.getColor(layer.feature.properties.name));
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
      }, 1000);
    });
  }

}
