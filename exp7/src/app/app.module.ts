import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ContactFormComponent } from './contact-form/contact-form.component';

@NgModule({
  declarations: [AppComponent, ContactFormComponent],
  imports: [BrowserModule, ReactiveFormsModule], // ReactiveFormsModule enables [formGroup], formControlName, etc.
  bootstrap: [AppComponent],
})
export class AppModule {}
