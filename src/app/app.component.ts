import { Component, OnInit } from '@angular/core';

import { LoadingService } from './loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public navActive = false;
  public bayes = `P(A|B) = \\frac{P(A|B) \\cdot P(A)}{P(B)}`;

  constructor(public ls: LoadingService) {

  }

  ngOnInit() {

  }

  loading() {
    return this.ls.loading;
  }

}
