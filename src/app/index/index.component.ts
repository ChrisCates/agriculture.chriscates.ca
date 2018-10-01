import { Component, OnInit, OnDestroy } from '@angular/core';

import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {

  constructor(public ls: LoadingService) {

  }

  ngOnDestroy() {
    this.ls.loading = true;
  }

  ngOnInit() {
    setTimeout(() => {
      this.ls.loading = false;
    }, 500);
  }

}
