import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxChartModule,
  DxLoadIndicatorModule,
  DxPieChartModule,
  DxSelectBoxModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services/data.service';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { Location } from '@angular/common';
@Component({
  selector: 'status-select-box',
  templateUrl: 'status-select-box.component.html',
  styleUrls: ['./status-select-box.component.scss'],
  providers: [DataService],
})
export class StatusSelectBoxComponent implements OnInit {
  loadIndicatorVisible = false;

  buttonText = 'Send';

  dataSource: any;
  dataSource1: any;
  processedData: any[];
  SubmsnSummaryData: any;
  SubmissiondataObj: any;
  submissionData: any;
  result: DataSource;
  selectedValues: any;
  getSubmissiondata: any;
  ReceiverWiseSubmittedData: any;
  ClinicianWiseSubmittedData: any;
  isLoggedIn1: any = false;
  isLoggedIn2: any = false;

  pies: any;
  pies1: any;
  denialcode = false;
  denialcode1 = false;

  left_title: 'TOP 10 PAID CPT';
  left_palette: 'soft';
  right_title: 'TOP 10 DENIED CPT';
  right_palette: 'soft';
  vibleExportBtn: boolean = true;
  selectedFormat: any | undefined;
  sessiondata: any;
  constructor(
    public service: DataService,
    public router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.isLoggedIn1 = true;
    this.isLoggedIn2 = true;
    this.sessiondata = sessionStorage.getItem('drillitem');
    let drillitemReciversName = sessionStorage.getItem('drillitemReciversName');

    this.get_chart_Datasource(this.sessiondata, drillitemReciversName);
  }

  get_chart_Datasource(selecteddata: any, receiversname: any) {
    this.service
      .getdrilldoctorpies(selecteddata, receiversname)
      .subscribe((res: any) => {
        this.dataSource = res.CPTRejected.filter(item => parseFloat(item.Amount) > 0);;
        this.dataSource1 = res.CPTPaid.filter(item => parseFloat(item.Amount) > 0);;

        this.isLoggedIn1 = false;
        this.isLoggedIn2 = false;
      });
  }
  BackToPreviousPage() {
    this.location.back();
  }
  customizePieTooltip(arg: any) {
    const data = arg.argument;
    const percentage = arg.percentText;

    return {
      text: `CPT Code: ${data} <br>  ${percentage} `,
    };
  }

  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }

  customizeLabelText(arg: any) {
    const value = arg.value;
    const percentage = arg.percentText;
    return `${value} (${percentage})`;
  }

  export() {
    this.vibleExportBtn = false;
    const format = this.selectedFormat;
    const element = document.querySelector('.parentDiv') as HTMLElement;
    const reportName = 'CPT Wise Paid vs Denied';
    if (element) {
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    DxSelectBoxModule,
    BrowserModule,
    DxChartModule,
    DxButtonModule,
    DxChartModule,
    DxLoadIndicatorModule,
    DxPieChartModule,

    CommonModule,
  ],
  declarations: [StatusSelectBoxComponent],
  exports: [StatusSelectBoxComponent],
})
export class StatusSelectBoxModule {}
