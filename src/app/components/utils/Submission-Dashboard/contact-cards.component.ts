import {
  Component,
  NgModule,
  Input,
  asNativeElements,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxTabPanelModule,
  DxDataGridModule,
  DxChartModule,
  DxLoadIndicatorModule,
  DxChartComponent,
  DxSelectBoxModule,
} from 'devextreme-angular';
import {
  CardNotesModule,
  CardMessagesModule,
  CardActivitiesModule,
  CardOpportunitiesModule,
  CardTasksModule,
} from 'src/app/components';
import DataSource from 'devextreme/data/data_source';
import { DataService } from 'src/app/services/data.service';
import { BrowserModule } from '@angular/platform-browser';
import { Route, Router } from '@angular/router';
import { exportWidgets } from 'devextreme/viz/export';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
@Component({
  selector: 'contact-cards',
  templateUrl: './contact-cards.component.html',
  styleUrls: ['./contact-cards.component.scss'],
  providers: [DataService],
})
export class ContactCardsComponent implements OnInit, OnDestroy {
  @ViewChild('chart', { static: false }) chart: DxChartComponent;
  @ViewChild('chart1', { static: false }) chart1: DxChartComponent;
  private subscription: Subscription;
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
      this.handleSubmissionReload();
    });
    // Initial setup logic
    this.handleSubmissionReload();
  }
  // Common logic for submission reload and initial setup
  private handleSubmissionReload() {
    sessionStorage.setItem('LoadedPage', '/submission');
    this.loadIndicatorVisible = true;
    this.get_Submission_Chart_Data();
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

  get_Submission_Chart_Data() {
    this.isLoggedIn1 = true;
    this.isLoggedIn2 = true;
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    const SearchOn_Value = selectedValuesString.searchOn;
    const facility_VAlue = selectedValuesString.facility;
    const encounterType_Value = selectedValuesString.encounterType;
    const fromdate = selectedValuesString.DateFrom;
    const todate = selectedValuesString.DateTo;
    this.service
      .getSubmission(
        SearchOn_Value,
        facility_VAlue,
        encounterType_Value,
        fromdate,
        todate
      )
      .subscribe((response: any) => {
        this.dataSource = response.ReceiverWiseSubmitted.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);
        this.dataSource1 = response.ClinicianWiseSubmitted.map((item) => {
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
    this.loadIndicatorVisible = false;
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
    const reportName = 'Submission Summary';
    if (element) {
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    DxButtonModule,
    DxTabPanelModule,
    DxDataGridModule,
    BrowserModule,
    DxSelectBoxModule,
    DxChartModule,
    DxLoadIndicatorModule,
    CardNotesModule,
    CardMessagesModule,
    CardActivitiesModule,
    CardOpportunitiesModule,
    CardTasksModule,

    CommonModule,
  ],
  providers: [],
  exports: [ContactCardsComponent],
  declarations: [ContactCardsComponent],
})
export class ContactCardsModule {}
