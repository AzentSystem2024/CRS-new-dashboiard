import {
  ChangeDetectorRef,
  Component, NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import notify from 'devextreme/ui/notify';
import {
  DxButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxFormModule,
  DxNumberBoxModule,
  DxDateBoxModule,
  DxLoadPanelModule,
  DxFileUploaderModule,
  DxScrollViewModule,
} from 'devextreme-angular';
import { forkJoin } from 'rxjs';
import { PhonePipeModule } from 'src/app/pipes/phone.pipe';
import {
 
  FormTextboxModule,
  ChangeProfilePasswordFormModule,
  ProfileCardModule,
  FormPopupModule,
} from 'src/app/components';
import { DataService, ScreenService } from 'src/app/services';

@Component({
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  providers: [DataService],
})
export class UserProfileComponent {

  constructor(private service: DataService, public screen: ScreenService, private ref: ChangeDetectorRef) {

  }

}

@NgModule({
  imports: [
    DxButtonModule,
    DxDateBoxModule,
    DxFormModule,
    DxFileUploaderModule,
    DxNumberBoxModule,
    DxToolbarModule,
    DxSelectBoxModule,
    DxScrollViewModule,
    DxLoadPanelModule,
    DxTextBoxModule,
    FormTextboxModule,
    FormPopupModule,
    ProfileCardModule,
    ChangeProfilePasswordFormModule,
    CommonModule,
    PhonePipeModule,
  ],
  providers: [],
  exports: [],
  declarations: [UserProfileComponent],
})
export class UserProfileListModule { }
