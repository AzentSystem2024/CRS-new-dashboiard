import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxPieChartModule } from 'devextreme-angular/ui/pie-chart';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxFunnelModule } from 'devextreme-angular/ui/funnel';
import { DxBulletModule } from 'devextreme-angular/ui/bullet';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DataService } from 'src/app/services';
import { CardAnalyticsModule } from 'src/app/components/library/card-analytics/card-analytics.component';
import { ToolbarAnalyticsModule } from 'src/app/components/utils/Search-Parameters-Page/toolbar-analytics.component';
import { ConversionCardModule } from 'src/app/components/utils/Home-Funnel-Chart/conversion-card.component';

import { ApplyPipeModule } from 'src/app/pipes/apply.pipe';

@Component({
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
  providers: [DataService],
})
export class AnalyticsDashboardComponent implements OnInit {
  parentMessage = 'Message from parent';
  constructor(private service: DataService) {}

  customizeSaleText(arg: { percentText: string }) {
    return arg.percentText;
  }

  ngOnInit(): void {
    console.log();
  }
}

@NgModule({
  imports: [
    DxScrollViewModule,
    DxDataGridModule,
    DxBulletModule,
    DxFunnelModule,
    DxPieChartModule,
    DxChartModule,
    CardAnalyticsModule,
    ToolbarAnalyticsModule,
    DxLoadPanelModule,
    ApplyPipeModule,
    ConversionCardModule,


    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [AnalyticsDashboardComponent],
})
export class AnalyticsDashboardModule {}
