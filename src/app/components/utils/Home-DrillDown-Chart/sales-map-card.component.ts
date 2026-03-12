import { Component, NgModule, Input, ElementRef, OnInit } from '@angular/core';
import { CardAnalyticsModule } from '../../library/card-analytics/card-analytics.component';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxChartModule,
  DxDropDownBoxModule,
  DxDropDownButtonModule,
  DxFunnelModule,
  DxLoadIndicatorModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services/data.service';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';
import { DxDataGridModule } from 'devextreme-angular';
import { Location } from '@angular/common';
@Component({
  selector: 'sales-map-card',
  templateUrl: './sales-map-card.component.html',
  styleUrls: ['./sales-map-card.component.scss'],
  providers: [DataService],
})
export class SalesMapCardComponent implements OnInit {
  // loadIndicatorVisible = false;

  buttonText = 'Send';

  getSubmissiondata: any;
  ReceiverWiseSubmittedData: any;
  ClinicianWiseSubmittedData: any;
  // isLoggedIn1: any = false;
  isdataLoaded: any = false;
  // isLoggedIn:any = true;

  clickedchart: any;
  sessiondata: string;
  vibleExportBtn: boolean = true;
  selectedFormat: any;

  constructor(
    public service: DataService,
    public router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.isdataLoaded = true;
    this.sessiondata = sessionStorage.getItem('drillitem');
    this.get_DrillDown_Chart_Data(this.sessiondata);
  }
  //====================== Fetch DAta for the Charts ======================
  get_DrillDown_Chart_Data(selecteddata: any) {
    this.service.getdrilldata(selecteddata).subscribe((res: any) => {
      const datasource1 = res.ReceiverWiseAmount.map((item) => {
        return {
          ...item,
          Amount: parseFloat(item.Amount),
        };
      });
      const datasource2 = res.ClinicianWiseAmount.map((item) => {
        return {
          ...item,
          Amount: parseFloat(item.Amount),
        };
      });
      this.ReceiverWiseSubmittedData = datasource1.sort(
        (a, b) => parseFloat(a.Amount) - parseFloat(b.Amount)
      );
      this.ClinicianWiseSubmittedData = datasource2.sort(
        (a, b) => parseFloat(a.Amount) - parseFloat(b.Amount)
      );
      this.isdataLoaded = false;
    });
  }

  //========================= Onclick Function For First Graph =====================
  onPointClick_First_Graph(event: any) {
    const pointData = event.target.data;
    this.clickedchart = 'receiver';
    sessionStorage.setItem('drillDownClickedItem', JSON.stringify(pointData));
    sessionStorage.setItem('clickedchart', JSON.stringify(this.clickedchart));
    this.router.navigate(['/dataGridPage1']);
  }

  //=========================Onclick Function For Second Graph=====================
  onPointClick_Second_Graph(event: any) {
    const pointData2 = event.target.data;
    this.clickedchart = 'clinician';
    // console.log('Second graph clicked', pointData2);
    sessionStorage.setItem('drillDownClickedItem', JSON.stringify(pointData2));
    sessionStorage.setItem('clickedchart', JSON.stringify(this.clickedchart));

    this.router.navigateByUrl('/dataGridPage1');
  }

  //===========Go to previous page===============
  BackToPreviousPage() {
    this.location.back();
  }

  customizeTooltipReceiver(arg: any) {
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
    const clinicianName = arg.point.data.ClinicianName;
    return {
      text: `Clinician : ${clinicianName} <br> Amount: ${argumentTextValue}`,
    };
  }

  export() {
    const format = this.selectedFormat;
    const funnelContainer = document.querySelector('.parentDiv') as HTMLElement;
    const reportName = `${this.sessiondata} Summary`;
    this.service.export(reportName, funnelContainer);
  }
}

@NgModule({
  imports: [
    CardAnalyticsModule,
    BrowserModule,
    DxChartModule,
    DxButtonModule,
    DxChartModule,
    DxLoadIndicatorModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxDropDownButtonModule,
  ],
  declarations: [SalesMapCardComponent],
  exports: [SalesMapCardComponent],
})
export class SalesMapCardModule {}
