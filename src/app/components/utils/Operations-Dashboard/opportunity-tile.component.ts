import {
  Component,
  NgModule,
  Input,
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
  DxPieChartModule,
  DxChartComponent,
  DxPieChartComponent,
  DxSelectBoxModule,
} from 'devextreme-angular';

import { DataService } from 'src/app/services/data.service';
import { BrowserModule } from '@angular/platform-browser';
import { CardNotesModule } from '../../library/card-notes/card-notes.component';
import { CardActivitiesModule } from '../../library/card-activities/card-activities.component';
import { CardMessagesModule } from '../../library/card-messages/card-messages.component';
import { Router } from '@angular/router';
import { exportWidgets } from 'devextreme/viz/export';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
@Component({
  selector: 'opportunity-tile',
  templateUrl: 'opportunity-tile.component.html',
  styleUrls: ['./opportunity-tile.component.scss'],
  providers: [DataService],
})
export class OpportunityTileComponent implements OnInit, OnDestroy {
  @ViewChild(DxChartComponent, { static: false }) chart: DxChartComponent;

  @ViewChild(DxPieChartComponent, { static: false })
  pieChart: DxPieChartComponent;
  private subscription: Subscription;

  loadIndicatorVisible = false;

  buttonText = 'Send';

  dataSource: any;
  PiedataSource: any;
  selectedValues: any;
  isLoggedIn1: any = false;
  isLoggedIn2: any = false;

  Pie_Chart_title = 'Top 10 Denials';
  Pie_Chart_palette = ' soft';
  pies: any;
  tagsData: any;
  chartSeries = [
    {
      name: 'Claimed',
      valueField: 'ClaimedAmount',
      argumentField: 'Submission',
      color: '#4d68ddef',
    },
    {
      name: 'Remitted',
      valueField: 'RemittedAmount',
      argumentField: 'Submission',
      color: '#ff8522da',
    },
    {
      name: 'Paid',
      valueField: 'PaidAmount',
      argumentField: 'Submission',
      color: '#14e34be6',
    },
    {
      name: 'Balance',
      valueField: 'PendingAmount',
      argumentField: 'Submission',
      color: '#e19977e6',
    },
  ];
  vibleExportBtn: boolean = true;
  selectedFormat: any;
  constructor(
    public service: DataService,
    public router: Router,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    // Subscribe to reloadComponents$
    this.subscription = this.sharedService.reloadComponents$.subscribe(() => {
      this.handleRCMReload();
    });

    // Initial setup logic
    this.handleRCMReload();
  }

  // Common logic for RCM reload and initial setup
  private handleRCMReload() {
    sessionStorage.setItem('LoadedPage', '/rcm');
    this.loadIndicatorVisible = true;
    this.get_RCM_Chart_Data();

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

  get_RCM_Chart_Data() {
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
      .getRCM(
        SearchOn_Value,
        facility_VAlue,
        encounterType_Value,
        fromdate,
        todate
      )
      .subscribe((res: any) => {
        this.dataSource = this.convertDecimalsToInt(res.ClaimAnalysis);
        this.PiedataSource = res.Denials.filter(
          (item) => parseFloat(item.Amount) > 0
        );
        this.tagsData = this.dataSource.map((item) => item.Submission);
        this.isLoggedIn1 = false;
        this.isLoggedIn2 = false;
        console.log('data are :', this.dataSource);
      });
  }

  convertDecimalsToInt(data: any) {
    return data.map((item: any) => {
      item.ClaimedAmount = parseFloat(item.ClaimedAmount);
      item.PaidAmount = parseFloat(item.PaidAmount);
      item.PendingAmount = parseFloat(item.PendingAmount);
      item.RejectedAmount = parseFloat(item.RejectedAmount);
      item.RemittedAmount = parseFloat(item.RemittedAmount);
      return item;
    });
  }

  onPointClick(e: any) {
    // console.log('first graph clicked',e, e.target.argument,e.target.series.name);
    sessionStorage.setItem('drillitem', e.target.argument);
    sessionStorage.setItem('selectedValueOfDrill', e.target.series.name);
    this.router.navigateByUrl('/rcmdrill');
  }

  onPointClick1(e: any) {
    // console.log('second graph clicked', e.target.argument);
    sessionStorage.setItem('drillitem', e.target.argument);
    this.router.navigateByUrl('/denails');
  }

  customizeTooltip(arg: any) {
    const seriesName = arg.seriesName;
    const argumentTextValue = new Intl.NumberFormat('en-US', {
      style: 'decimal',
    }).format(arg.valueText);
    return {
      text: `Series : ${seriesName} <br> Amount : ${argumentTextValue}`,
    };
  }
  customizePieTooltip(arg: any) {
    return {
      text: `Clinician : ${arg.argument} <br> ${arg.percentText}`,
    };
  }
  customizeLabelText(arg: any) {
    const value = arg.value;
    const percentage = arg.percentText;
    return `${value} (${percentage})`;
  }

  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }

  export() {
    const format = this.selectedFormat;
    const element = document.querySelector('.parentDiv') as HTMLElement;
    const reportName = 'Claim Analysis';
    if (element) {
      this.vibleExportBtn = false;
      this.service.export(reportName, element);
    }
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxTabPanelModule,
    DxDataGridModule,
    BrowserModule,
    DxPieChartModule,
    DxChartModule,
    DxLoadIndicatorModule,
    CardNotesModule,
    CardMessagesModule,
    CardActivitiesModule,
    DxSelectBoxModule,
  ],
  declarations: [OpportunityTileComponent],
  exports: [OpportunityTileComponent],
})
export class OpportunityTileModule {}
