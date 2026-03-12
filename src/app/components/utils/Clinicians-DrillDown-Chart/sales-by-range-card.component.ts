import { Component, NgModule, Input, OnInit } from '@angular/core';
import { CardAnalyticsModule } from '../../library/card-analytics/card-analytics.component';
import { DxPieChartModule } from 'devextreme-angular/ui/pie-chart';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import { DxoValueAxisModule } from 'devextreme-angular/ui/nested';
import { DataService } from 'src/app/services/data.service';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxLoadIndicatorModule,
  DxButtonModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'sales-by-range-card',
  templateUrl: './sales-by-range-card.component.html',
  styleUrls: ['./sales-by-range-card.component.scss'],
  providers: [DataService],
})
export class SalesByRangeCardComponent implements OnInit {
  buttonText = 'Send';

  dataSource: any;
  isLoggedIn2: any = false;
  sessiondata: any;
  vibleExportBtn: boolean = true;
  selectedFormat: any;

  constructor(
    public service: DataService,
    public router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.isLoggedIn2 = true;
    this.sessiondata = sessionStorage.getItem('drillitem');
    console.log('session data', this.sessiondata);
    this.getSubmsn(this.sessiondata);
  }

  onPointClick(e: any) {
    sessionStorage.setItem('drillitemReciversName', e.target.data.ReceiverName);
    this.router.navigateByUrl('/doctors/drill');
  }

  getSubmsn(selecteddata: any) {
    this.service.getdrilldoctors(selecteddata).subscribe((res: any) => {
      // console.log('getdrilldoctors =>>', res);
      this.dataSource = this.convertDecimalsToInt(res.ClinicianReceiver);
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

  BackToPreviousPage() {
    this.location.back();
  }

  getpipes(data: any): any {
    return [
      {
        title: 'Denials',
        palette: 'soft',
        dataSource: data,
      },
    ];
  }

  customizeTooltip(arg: any) {
    const ReceiverName = arg.point.data.ReceiverName;
    const argumentTextValue = new Intl.NumberFormat('en-US', {
      style: 'decimal',
    }).format(arg.valueText);
    return {
      text: `Receiver Name : ${ReceiverName} <br>  ${arg.seriesName} Amount: ${argumentTextValue}`,
    };
  }

  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }

  export() {
    this.vibleExportBtn = false;
    const format = this.selectedFormat;
    const element = document.querySelector('.parentDiv') as HTMLElement;
    const reportName = `Receiverwise Breakup - Dr.${this.sessiondata}`;
    if (element) {
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    CardAnalyticsModule,
    DxPieChartModule,
    DxChartModule,
    DxoValueAxisModule,
    BrowserModule,
    DxPieChartModule,
    DxChartModule,
    DxLoadIndicatorModule,
    DxButtonModule,
    DxSelectBoxModule,
  ],
  declarations: [SalesByRangeCardComponent],
  exports: [SalesByRangeCardComponent],
})
export class SalesByRangeCardModule {}
