import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
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
import { Location } from '@angular/common';
import notify from 'devextreme/ui/notify';

@Component({
  templateUrl: './planning-task-list.component.html',
  styleUrls: ['./planning-task-list.component.scss'],
  providers: [DataService],
})
export class PlanningTaskListComponent implements OnInit {
  loadIndicatorVisible = false;

  buttonText = 'Send';

  dataSource: any;
  processedData: any[];
  SubmsnSummaryData: any;
  SubmissiondataObj: any;
  submissionData: any;
  result: DataSource;
  selectedValues: any;
  getSubmissiondata: any;
  ReceiverWiseSubmittedData: any;
  isLoggedIn2: any;
  remittedamount: boolean;
  ClinicianWiseSubmittedData: any;
  dataSource2: any;
  dataSource3: any;
  submissionLevel: any;
  selectedSeriesName: any;
  vibleExportBtn: boolean = true;
  selectedFormat: any;

  constructor(
    public service: DataService,
    public router: Router,
    private location: Location
  ) {}
  ngOnInit() {
    this.isLoggedIn2 = true;
    this.submissionLevel = sessionStorage.getItem('drillitem');
    this.selectedSeriesName = sessionStorage.getItem('selectedValueOfDrill');
    this.get_RCM_drillDown_Data(this.selectedSeriesName, this.submissionLevel);
  }

  get_RCM_drillDown_Data(selecteddata: any, SubmissionLevel: any) {
    this.service
      .getdrillrcmdata(selecteddata, SubmissionLevel)
      .subscribe((responseData: any) => {
        let checkData = responseData.ReceiverAmount;
        if (checkData.length !== 0) {
          this.dataSource = responseData.ReceiverAmount.map((item) => {
            return {
              ...item,
              Amount: parseFloat(item.Amount),
            };
          }).sort((a, b) => a.Amount - b.Amount);
          this.isLoggedIn2 = false;
        } else {
          this.location.back();
          notify('no data available', 'error', 2000);
        }
      });
  }

  BackToPreviousPage() {
    this.location.back();
  }

  customizeTooltip(arg: any) {
    console.log(arg);
    const argumentTextValue = new Intl.NumberFormat('en-US', {
      style: 'decimal',
    }).format(arg.valueText);
    const receiverName = arg.point.data.ReceiverName;
    return {
      text: `Receiver : ${receiverName} <br> Amount: ${argumentTextValue}`,
    };
  }

  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }

  export() {
    this.vibleExportBtn = false;
    const format = this.selectedFormat;
    const element = document.querySelector('.parentDiv') as HTMLElement;
    const reportName = `${this.submissionLevel} - ${this.selectedSeriesName}`;
    if (element) {
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    DxButtonModule,
    DxChartModule,
    DxButtonModule,
    DxChartModule,
    DxLoadIndicatorModule,
    DxSelectBoxModule,
    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [PlanningTaskListComponent],
})
export class PlanningTaskListModule {}
