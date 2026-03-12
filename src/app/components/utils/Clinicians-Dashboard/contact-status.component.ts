import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxTabPanelModule,
  DxDataGridModule,
  DxChartModule,
  DxLoadIndicatorModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { DataService } from 'src/app/services/data.service';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
@Component({
  selector: 'contact-status',
  templateUrl: './contact-status.component.html',
  styleUrls: ['./contact-status.component.scss'],
  providers: [DataService],
})
export class ContactStatusComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  loadIndicatorVisible = false;
  buttonText = 'Send';

  dataSource1: any;
  processedData: any[];
  ClincnData: any;
  CliniciandataObj: any;
  clinicianData: any;
  result: DataSource;
  selectedValues: any;
  getCliniciandata: any;
  ClinicianHomeData: any;
  isLoggedIn1: any = false;
  isLoggedIn2: any = false;

  colors: string[];

  isFirstLevel: boolean;
  vibleExportBtn: boolean = true;
  selectedFormat: any | undefined;

  constructor(
    public service: DataService,
    public router: Router,
    private sharedService: SharedService
  ) {}
  ngOnInit() {
    // Subscribe to reloadComponents$
    this.subscription = this.sharedService.reloadComponents$.subscribe(() => {
      this.handleComponentReload();
    });

    // Initial setup logic
    this.handleComponentReload();
  }

  // Common logic for component reload and initial setup
  private handleComponentReload() {
    this.isLoggedIn1 = true;
    this.isLoggedIn2 = true;
    sessionStorage.setItem('LoadedPage', '/doctors');
    this.loadIndicatorVisible = true;
    this.get_Clinician_Chart_Data();

    const selectedValuesString = sessionStorage.getItem('selectedValues');
    if (selectedValuesString) {
      this.selectedValues = JSON.parse(selectedValuesString);
    }
  }

  // Cleanup on component destroy
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get_Clinician_Chart_Data() {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    var SearchOn_Value = selectedValuesString.searchOn;
    var facility_VAlue = selectedValuesString.facility;
    var encounterType_Value = selectedValuesString.encounterType;
    var fromdate = selectedValuesString.DateFrom;
    var todate = selectedValuesString.DateTo;
    this.service
      .getClinician(
        SearchOn_Value,
        facility_VAlue,
        encounterType_Value,
        fromdate,
        todate
      )
      .subscribe((response: any) => {
        this.dataSource1 = this.convertDecimalsToInt(response.ClinicianHome);
        this.isLoggedIn1 = false;
        this.isLoggedIn2 = false;
      });
  }

  convertDecimalsToInt(data: any) {
    return data.map((item: any) => {
      item.Submitted = parseFloat(item.Submitted);
      item.Paid = parseFloat(item.Paid);
      item.Rejected = parseFloat(item.Rejected);
      return item;
    });
  }

  onPointClick(e) {
    sessionStorage.setItem('drillitem', e.target.data.ClinicianName);
    this.router.navigateByUrl('/doctor/drill');
  }

  customizeTooltip(arg: any) {
    const argumentTextValue = new Intl.NumberFormat('en-US', {
      style: 'decimal',
    }).format(arg.valueText);
    return {
      text: `Clinician Name : ${arg.point.data.ClinicianName} <br> ${arg.seriesName} Amount: ${argumentTextValue}`,
    };
  }

  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }

  customizePoint = () => ({
    color: this.colors[Number(this.isFirstLevel)],
    ...(this.isFirstLevel
      ? {}
      : {
          hoverStyle: {
            hatching: 'none',
          },
        }),
  });

  export() {
    this.vibleExportBtn = false;
    const format = this.selectedFormat;
    const element = document.querySelector('.parentDiv') as HTMLElement;
    const reportName = 'Top 10 Clinicians';
    if (element) {
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxTabPanelModule,
    DxDataGridModule,
    BrowserModule,
    DxChartModule,
    DxLoadIndicatorModule,
    DxSelectBoxModule,
  ],
  declarations: [ContactStatusComponent],
  exports: [ContactStatusComponent],
})
export class ContactStatusModule {}
