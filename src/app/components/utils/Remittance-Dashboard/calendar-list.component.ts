import {
  Component,
  NgModule,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  DxButtonModule,
  DxChartComponent,
  DxChartModule,
  DxCheckBoxModule,
  DxLoadIndicatorModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { DxListModule } from 'devextreme-angular/ui/list';
import DataSource from 'devextreme/data/data_source';
import { DataService } from 'src/app/services/data.service';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { exportWidgets } from 'devextreme/viz/export';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as moment from 'moment';

@Component({
  selector: 'calendar-list',
  templateUrl: './calendar-list.component.html',
  styleUrls: ['./calendar-list.component.scss'],
})
export class CalendarListComponent implements OnInit, OnDestroy {
  @ViewChild('chart', { static: false }) chart: DxChartComponent;
  @ViewChild('chart1', { static: false }) chart1: DxChartComponent;
  @ViewChild('chart2', { static: false }) chart2: DxChartComponent;
  @ViewChild('chart3', { static: false }) chart3: DxChartComponent;
  @ViewChild('chart4', { static: false }) chart4: DxChartComponent;
  @ViewChild('chart5', { static: false }) chart5: DxChartComponent;
  private subscription: Subscription;
  dataSource: any;
  dataSource1: any;
  dataSource2: any;
  dataSource3: any;
  dataSource4: any;
  dataSource5: any;
  RemitcnSummaryData: any;
  RemittancedataObj: any;
  remittanceData: any;
  result: DataSource;
  selectedValues: any;
  getRemittancedata: any;
  ReceiverWiseRemitted: any;
  ClinicianWiseRemitted: any;
  ReceiverWisePaid: any;
  ClinicianWisePaid: any;
  ReceiverWiseRejected: any;
  ClinicianWiseRejected: any;
  isLoggedIn1: any = false;
  isLoggedIn2: any = false;
  clickedchart: any;
  vibleExportBtn: boolean = true;
  selectedFormat: any;

  constructor(
    public service: DataService,
    private router: Router,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    // Subscribe to reloadComponents$
    this.subscription = this.sharedService.reloadComponents$.subscribe(() => {
      this.handleRemittanceReload();
    });
    // Initial setup logic
    this.handleRemittanceReload();
  }

  // Common logic for remittance reload and initial setup
  private handleRemittanceReload() {
    this.isLoggedIn2 = true;
    sessionStorage.setItem('LoadedPage', '/remittance');
    this.get_Remittance_Data();

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

  get_Remittance_Data() {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    const SearchOn_Value = selectedValuesString.searchOn;
    const facility_VAlue = selectedValuesString.facility;
    const encounterType_Value = selectedValuesString.encounterType;
    const fromdate = selectedValuesString.DateFrom;
    const todate = selectedValuesString.DateTo;

    this.service
      .getRemittance(
        SearchOn_Value,
        facility_VAlue,
        encounterType_Value,
        fromdate,
        todate
      )
      .subscribe((response: any) => {
        this.dataSource = response.ReceiverWiseRemitted.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);

        this.dataSource1 = response.ClinicianWiseRemitted.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);

        this.dataSource2 = response.ReceiverWisePaid.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);

        this.dataSource3 = response.ClinicianWisePaid.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);

        this.dataSource4 = response.ReceiverWiseRejected.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);

        this.dataSource5 = response.ClinicianWiseRejected.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);

        if (response) {
          this.isLoggedIn1 = false;
          this.isLoggedIn2 = false;
        }
      });
  }

  onPointClick(event: any) {
    // alert('clicked 1st graph');
    const pointData = event.target.data;
    this.clickedchart = 'receiver';
    sessionStorage.setItem('drillDownClickedItem', JSON.stringify(pointData));
    sessionStorage.setItem('clickedchart', JSON.stringify(this.clickedchart));
    this.router.navigate(['/dataGridPage1']);
    // this.router.navigateByUrl("/doctors/drill")
  }

  onPointClick_Second_Graph(event: any) {
    // alert('clciked 2nd graph');
    const pointData2 = event.target.data;
    this.clickedchart = 'clinician';
    // console.log('Second graph clicked', pointData2);
    sessionStorage.setItem('drillDownClickedItem', JSON.stringify(pointData2));
    sessionStorage.setItem('clickedchart', JSON.stringify(this.clickedchart));

    this.router.navigateByUrl('/dataGridPage1');
  }

  customizeTooltipReceiver(arg: any) {
    // console.log(arg);
    const argumentTextValue = new Intl.NumberFormat('en-US', {
      style: 'decimal',
    }).format(arg.valueText);
    const receiverName = arg.point.data.ReceiverName;
    return {
      text: `Receiver : ${receiverName} <br> Amount: ${argumentTextValue}`,
    };
  }
  customizeTooltipClinician(arg: any) {
    // console.log(arg);
    const argumentTextValue = new Intl.NumberFormat('en-US', {
      style: 'decimal',
    }).format(arg.valueText);
    const receiverName = arg.point.data.ClinicianName;
    return {
      text: `Clinician : ${receiverName} <br> Amount: ${argumentTextValue}`,
    };
  }

  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }

  export() {
    this.vibleExportBtn = false;
    const format = this.selectedFormat;
    const element = document.querySelector('.parentDiv') as HTMLElement;
    const reportName = 'Remittance Summary';
    if (element) {
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    DxListModule,
    DxCheckBoxModule,
    DxButtonModule,
    HttpClientModule,
    BrowserModule,
    DxLoadIndicatorModule,
    DxSelectBoxModule,
    DxChartModule,
    CommonModule,
  ],
  providers: [],
  exports: [CalendarListComponent],
  declarations: [CalendarListComponent],
})
export class CalendarListModule {}
