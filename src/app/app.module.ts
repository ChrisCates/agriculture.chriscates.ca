import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { KatexModule } from 'ng-katex';

import { LoadingService } from './loading.service';

import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { SimulatorComponent } from './simulator/simulator.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    SimulatorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      { 'path': 'article', 'component': IndexComponent },
      { 'path': '', 'component': SimulatorComponent }
    ]),
    KatexModule
  ],
  providers: [
    LoadingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
