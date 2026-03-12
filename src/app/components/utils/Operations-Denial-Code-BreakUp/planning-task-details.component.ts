import { Component, OnInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxChartModule,
  DxFunnelModule,
  DxLoadIndicatorModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services/data.service';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import notify from 'devextreme/ui/notify';
import { Location } from '@angular/common';
@Component({
  templateUrl: './planning-task-details.component.html',
  styleUrls: ['./planning-task-details.component.scss'],
  providers: [DataService],
})
export class PlanningTaskDetailsComponent implements OnInit {
  loadIndicatorVisible = false;

  buttonText = 'Send';

  dataSource: any;
  dataSource1: any;
  processedData: any;
  SubmsnSummaryData: any;
  SubmissiondataObj: any;
  submissionData: any;
  result: DataSource;
  selectedValues: any;
  getSubmissiondata: any;
  ReceiverWiseSubmittedDataSource: any;
  ClinicianWiseSubmittedDataSource: any;

  isLoaded: any = false;
  clickedchart: any;
  vibleExportBtn: boolean = true;
  selectedFormat: any;

  constructor(
    public service: DataService,
    public router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.isLoaded = true;
    let sessiondata = sessionStorage.getItem('drillitem');
    console.log('drill item', sessiondata);
    this.getSubmsn(sessiondata);
  }

  onPointClick(event: any) {
    const pointData = event.target.data;
    this.clickedchart = 'receiver';
    sessionStorage.setItem('drillDownClickedItem', JSON.stringify(pointData));
    sessionStorage.setItem('clickedchart', JSON.stringify(this.clickedchart));
    this.router.navigate(['/dataGridPage1']);
  }

  onPointClick_Second_Graph(event: any) {
    const pointData2 = event.target.data;
    this.clickedchart = 'clinician';
    // console.log('Second graph clicked', pointData2);
    sessionStorage.setItem('drillDownClickedItem', JSON.stringify(pointData2));
    sessionStorage.setItem('clickedchart', JSON.stringify(this.clickedchart));
    this.router.navigateByUrl('/dataGridPage1');
  }
  getSubmsn(selecteddata: any) {
    this.service.getdrilldenialdata(selecteddata).subscribe((res: any) => {
      let recieversData = res.Receivers;
      let denialsdata = res.Clinician;
      if (recieversData.length !== 0 || denialsdata.length !== 0) {
        this.ReceiverWiseSubmittedDataSource = res.Receivers.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);

        this.ClinicianWiseSubmittedDataSource = res.Clinician.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);
        this.isLoaded = false;
      } else {
        this.location.back();
        notify('no data available', 'error', 2000);
      }
    });
  }
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
    const reportName = 'Denial Code Analysis';
    if (element) {
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    DxButtonModule,
    CommonModule,
    BrowserModule,
    DxChartModule,
    DxButtonModule,
    DxChartModule,
    DxLoadIndicatorModule,
    DxSelectBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [PlanningTaskDetailsComponent],
})
export class PlanningTaskDetailsModule {}
