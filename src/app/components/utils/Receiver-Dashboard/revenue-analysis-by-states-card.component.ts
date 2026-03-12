import { Component, NgModule, Input, OnInit, OnDestroy } from '@angular/core';
import { CardAnalyticsModule } from '../../library/card-analytics/card-analytics.component';
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
  selector: 'revenue-analysis-by-states-card',
  templateUrl: './revenue-analysis-by-states-card.component.html',
  styleUrls: ['./revenue-analysis-by-states-card.component.scss'],
  providers: [DataService],
})
export class RevenueAnalysisByStatesCardComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  loadIndicatorVisible = false;
  buttonText = 'Send';
  dataSource: any;
  processedData: any[];
  ReceivrSummaryData: any;
  ReceiverdataObj: any;
  receiverData: any;
  result: DataSource;
  selectedValues: any;
  getReceiverdata: any;
  ReceiverHomeData: any;
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
      this.handleReceiverReload();
    });

    // Initial setup logic
    this.handleReceiverReload();
  }

  // Common logic for receiver reload and initial setup
  private handleReceiverReload() {
    sessionStorage.setItem('LoadedPage', '/receivers');
    this.loadIndicatorVisible = true;
    this.getRecvr();

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

  getRecvr() {
    this.isLoggedIn1 = true;
    this.isLoggedIn2 = true;

    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    var SearchOn_Value = selectedValuesString.searchOn;
    var facility_VAlue = selectedValuesString.facility;
    var encounterType_Value = selectedValuesString.encounterType;
    var fromdate = selectedValuesString.DateFrom;
    var todate = selectedValuesString.DateTo;
    this.service
      .getReceiver(
        SearchOn_Value,
        facility_VAlue,
        encounterType_Value,
        fromdate,
        todate
      )
      .subscribe((response: any) => {
        this.dataSource = response.ReceiverHome.map((item) => {
          return {
            ...item,
            RejectionPercent: parseFloat(item.RejectionPercent),
          };
        }).sort((a, b) => a.RejectionPercent - b.RejectionPercent);

        this.isLoggedIn2 = false;
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

  customizeTooltip(arg: any) {
    const argumentTextValue = new Intl.NumberFormat('en-US', {
      style: 'decimal',
    }).format(arg.valueText);
    return {
      text: `Rejection : ${argumentTextValue}%`,
    };
  }

  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }
  export() {
    // this.vibleExportBtn = false;
    // const format = this.selectedFormat;
    // const element = document.querySelector('.parentDiv') as HTMLElement;
    // const reportName = 'Top 10 Receiver';
    // if (element) {
    //   this.service.export(reportName, element);
    // }
    // this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    CardAnalyticsModule,
    DxDataGridModule,
    DxButtonModule,
    DxTabPanelModule,
    DxDataGridModule,
    BrowserModule,
    DxChartModule,
    DxLoadIndicatorModule,
    DxSelectBoxModule,
  ],
  declarations: [RevenueAnalysisByStatesCardComponent],
  exports: [RevenueAnalysisByStatesCardComponent],
})
export class RevenueAnalysisByStatesCardModule {}
