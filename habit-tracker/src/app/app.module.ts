/**
 * App Module
 * 
 * The root module of the application.
 * Declares all components and imports required modules.
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Standalone components used in app.component
import { UserSwitcherComponent } from './shared/components/user-switcher/user-switcher.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    // Import standalone components
    UserSwitcherComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
