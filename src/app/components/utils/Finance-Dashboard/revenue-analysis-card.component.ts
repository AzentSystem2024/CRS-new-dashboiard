import { Component, NgModule, Input, OnInit, OnDestroy } from '@angular/core';
import { CardAnalyticsModule } from '../../library/card-analytics/card-analytics.component';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxBulletModule } from 'devextreme-angular/ui/bullet';
import { BrowserModule } from '@angular/platform-browser';

import {
  DxChartModule,
  DxLoadIndicatorModule,
  DxPieChartModule,
  DxButtonModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
@Component({
  selector: 'revenue-analysis-card',
  templateUrl: './revenue-analysis-card.component.html',
  styleUrls: ['./revenue-analysis-card.component.scss'],
  providers: [DataService],
})
export class RevenueAnalysisCardComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  loadIndicatorVisible = false;
  buttonText = 'Send';
  dataSource: any;
  dataSource1: any;
  PieChart_DataSource: any;

  selectedValues: any;
  getFinancedata: any;
  ReceiverBalanceData: any;
  ClinicianBalanceData: any;
  isLoggedIn1: any = false;
  isLoggedIn2: any = false;
  // isLoggedIn:any = true;
  pies: any;
  clickedchart: any;
  InsuranceAgeing: any;
  dataSource2: any;
  opportunitiesDatatoolbar: any;

  Pie_Chart_title = ' Insurance Ageing';
  Pie_Chart_palette = 'soft';
  vibleExportBtn: boolean = true;
  selectedFormat: any;
  min = 0;

  constructor(
    public service: DataService,
    public router: Router,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    // Subscribe to reloadComponents$
    this.subscription = this.sharedService.reloadComponents$.subscribe(() => {
      this.handleFinanceHomeReload();
    });

    // Initial setup logic
    this.handleFinanceHomeReload();
  }

  // Common logic for finance home reload and initial setup
  private handleFinanceHomeReload() {
    this.sharedService.setFinanceHomeLoaded(true);
    this.isLoggedIn1 = true;
    this.isLoggedIn2 = true;
    sessionStorage.setItem('LoadedPage', '/finance');
    this.loadIndicatorVisible = true;
    this.get_Finance_Chart_Data();
  }

  // Cleanup on component destroy
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.sharedService.setFinanceHomeLoaded(false);
  }

  setOpportunities(data: any): void {
    this.opportunitiesDatatoolbar = data;
  }

  getOpportunities(): any {
    return this.opportunitiesDatatoolbar;
  }

  get_Finance_Chart_Data() {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    var SearchOn_Value = selectedValuesString.searchOn;
    var facility_VAlue = selectedValuesString.facility;
    var encounterType_Value = selectedValuesString.encounterType;
    var fromdate = selectedValuesString.DateFrom;
    var todate = selectedValuesString.DateTo;
    var AsOnDate = selectedValuesString.AsOnDate;
    this.service
      .getFinance(
        SearchOn_Value,
        facility_VAlue,
        encounterType_Value,
        fromdate,
        todate,
        AsOnDate
      )
      .subscribe((response: any) => {
        this.dataSource = response.ReceiverBalance.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);
        this.dataSource1 = response.ClinicianBalance.map((item) => {
          return {
            ...item,
            Amount: parseFloat(item.Amount),
          };
        }).sort((a, b) => a.Amount - b.Amount);
        this.PieChart_DataSource = response.InsuranceAgeing.filter(
          (item) => parseFloat(item.Amount) > 0
        );
        this.isLoggedIn1 = false;
        this.isLoggedIn2 = false;
      });
  }

  onPointClick1(e: any) {
    sessionStorage.setItem('drillitem', e.target.data.Age);
    this.router.navigateByUrl('/finance/ageing');
  }

  //=========================Onclick Function For First Graph=====================
  onPointClick_First_Graph(event: any) {
    const pointData = event.target.data;
    this.clickedchart = 'receiver';
    sessionStorage.setItem('drillDownClickedItem', JSON.stringify(pointData));
    sessionStorage.setItem('clickedchart', JSON.stringify(this.clickedchart));
    this.router.navigate(['/dataGridPage1']);
  }

  onPointClick_Second_Graph(event: any) {
    const pointData2 = event.target.data;
    this.clickedchart = 'clinician';
    console.log('Second graph clicked', pointData2);
    sessionStorage.setItem('drillDownClickedItem', JSON.stringify(pointData2));
    sessionStorage.setItem('clickedchart', JSON.stringify(this.clickedchart));

    this.router.navigateByUrl('/dataGridPage1');
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

  customizePieTooltip(arg: any) {
    return {
      text: `Age : ${arg.argumentText} <br>  ${arg.percentText}`,
    };
  }

  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }

  customizeLabelText(arg: any) {
    return `${arg.value} (${arg.percentText})`;
  }

  export() {
    this.vibleExportBtn = false;
    const format = this.selectedFormat;
    const element = document.querySelector('.parentDiv') as HTMLElement;
    const reportName = 'Balance Amount to Be Received';
    if (element) {
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    CardAnalyticsModule,
    DxDataGridModule,
    DxBulletModule,
    DxDataGridModule,
    BrowserModule,
    DxChartModule,
    DxLoadIndicatorModule,
    DxPieChartModule,
    DxButtonModule,
    DxSelectBoxModule,
  ],
  declarations: [RevenueAnalysisCardComponent],
  exports: [RevenueAnalysisCardComponent],
})
export class RevenueAnalysisCardModule {}
