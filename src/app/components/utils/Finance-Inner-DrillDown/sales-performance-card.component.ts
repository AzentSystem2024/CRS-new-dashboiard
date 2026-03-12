import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { CardAnalyticsModule } from '../../library/card-analytics/card-analytics.component';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import {
  DxButtonModule,
  DxLoadIndicatorModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services/data.service';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { SharedService } from 'src/app/services/shared.service';
@Component({
  selector: 'sales-performance-card',
  templateUrl: './sales-performance-card.component.html',
  styleUrls: ['./sales-performance-card.component.scss'],
  providers: [DataService],
})
export class SalesPerformanceCardComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  loadIndicatorVisible = false;

  buttonText = 'Send';

  dataSource: any;
  dataSource1: any;

  isLoggedIn1: any = false;
  isLoggedIn2: any = false;
  // isLoggedIn:any = true;
  claimed = false;
  remitted = false;
  vibleExportBtn: boolean = true;
  sessiondata: any;
  selectedFormat: any;
  constructor(
    public service: DataService,
    public router: Router,
    private location: Location,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.isLoggedIn1 = true;
    this.isLoggedIn2 = true;
    this.sessiondata = sessionStorage.getItem('drillitem');
    this.getSubmsn(this.sessiondata);
    this.sharedService.setFinanceHomeLoaded(true);
  }
  ngOnDestroy() {
    this.sharedService.setFinanceHomeLoaded(false);
  }

  getSubmsn(selecteddata: any) {
    this.service.getdrillFinanceageing(selecteddata).subscribe((res: any) => {
      this.dataSource = res.ReceiverAgeing.map((item) => {
        return {
          ...item,
          Amount: parseFloat(item.Amount),
        };
      }).sort((a, b) => a.Amount - b.Amount);
      this.dataSource1 = res.PayerAgeing.map((item) => {
        return {
          ...item,
          Amount: parseFloat(item.Amount),
        };
      }).sort((a, b) => a.Amount - b.Amount);
      this.isLoggedIn1 = false;
      this.isLoggedIn2 = false;
    });
  }
  BackToPreviousPage() {
    this.location.back();
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
    const payerName = arg.point.data.PayerName;
    return {
      text: `Payer : ${payerName} <br> Amount: ${argumentTextValue}`,
    };
  }

  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }

  export() {
    this.vibleExportBtn = false;
    const format = this.selectedFormat;
    const element = document.querySelector('.parentDiv') as HTMLElement;
    const reportName = `Insurance Ageing Breakup (${this.sessiondata})`;
    if (element) {
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    CardAnalyticsModule,
    DxButtonModule,
    DxChartModule,
    DxLoadIndicatorModule,
    CommonModule,
    BrowserModule,
    DxSelectBoxModule,
  ],
  declarations: [SalesPerformanceCardComponent],
  exports: [SalesPerformanceCardComponent],
})
export class SalesPerformanceCardModule {}
