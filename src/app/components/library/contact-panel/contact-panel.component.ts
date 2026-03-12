import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  NgModule,
  Output,
  Input,
  SimpleChanges,
  EventEmitter,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DxAccordionModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxToolbarModule,
  DxLoadPanelModule,
  DxScrollViewModule,
  DxFormModule,
  DxValidatorModule,
  DxValidationGroupModule,
} from 'devextreme-angular';
import { DxButtonTypes } from 'devextreme-angular/ui/button';
import {
  FormTextboxModule,
  FormPhotoModule,
  CardActivitiesModule,
  ContactStatusModule,
} from 'src/app/components';
import { ScreenService, DataService } from 'src/app/services';
import { distinctUntilChanged, Subject, Subscription} from 'rxjs';
import { Contact } from 'src/app/types/contact';

@Component({
  selector: 'contact-panel',
  templateUrl: './contact-panel.component.html',
  styleUrls: ['./contact-panel.component.scss'],
  providers: [DataService],
})
export class ContactPanelComponent implements OnInit {

  constructor(private screen: ScreenService, private service: DataService, private router: Router) {
    
  }

  ngOnInit(): void {
    
  }

 
  navigateToDetails = () => {
    this.router.navigate(['/crm-contact-details']);
  };
}

@NgModule({
  imports: [
    DxAccordionModule,
    DxButtonModule,
    DxDropDownButtonModule,
    DxToolbarModule,
    DxLoadPanelModule,
    DxScrollViewModule,
    DxFormModule,
    DxValidatorModule,
    DxValidationGroupModule,

    FormTextboxModule,
    FormPhotoModule,
    CardActivitiesModule,
    ContactStatusModule,
    CommonModule,
  ],
  declarations: [ContactPanelComponent],
  exports: [ContactPanelComponent],
})
export class ContactPanelModule { }
