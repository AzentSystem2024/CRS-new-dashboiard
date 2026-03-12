import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CardAnalyticsModule } from 'src/app/components/library/card-analytics/card-analytics.component';
import { DxFunnelModule } from 'devextreme-angular/ui/funnel';
import { DataService } from 'src/app/services/data.service';
import DataSource from 'devextreme/data/data_source';
import {
  DxButtonModule,
  DxLoadIndicatorModule,
  DxSelectBoxModule,
  DxDropDownButtonModule,
  DxDropDownButtonComponent,
} from 'devextreme-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { Location } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
@Component({
  selector: 'conversion-card',
  templateUrl: 'conversion-card.component.html',
  styleUrls: ['./conversion-card.component.scss'],
  providers: [DatePipe],
})
export class ConversionCardComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  encountrType: any;
  facility: any;
  searchOn: any;

  ClaimSummaryData: any;
  claimData: any;
  result: DataSource;

  selectedValues: any;

  claimSummaryHeading: any;

  processedData: any[];
  isLoggedIn1: any = false;

  returnedData: any;
  functionCalled = false;

  userId: string;
  chartTitle: any;
  showTitle: boolean = false;
  vibleExportBtn: boolean = true;

  constructor(
    public service: DataService,
    public router: Router,
    private sharedService: SharedService,
    private datePipe: DatePipe
  ) {
    const now = new Date();
    const formattedTime = this.datePipe.transform(now, 'dd/MM/yyyy');
    this.chartTitle = `Claim Summary <br> ${formattedTime}`;
  }
  ngOnInit() {
    // Subscribe to initDataLoaded$
    this.subscription = this.sharedService.initDataLoaded$.subscribe(
      (isLoaded) => {
        if (isLoaded) {
          this.handleDataLoaded();
        }
      }
    );

    // Separate subscription to reloadComponents$
    this.subscription.add(
      this.sharedService.reloadComponents$.subscribe(() => {
        this.handleReload();
      })
    );
  }

  // Handle initDataLoaded logic
  handleDataLoaded() {
    this.isLoggedIn1 = true;
    this.get_claimSummary_Chart_Data();
    sessionStorage.setItem('LoadedPage', '/Home');

    const selectedValuesString = sessionStorage.getItem('selectedValues');
    if (selectedValuesString) {
      this.selectedValues = JSON.parse(selectedValuesString);
    }
  }

  // Handle reloadComponents logic
  handleReload() {
    this.isLoggedIn1 = true;
    this.get_claimSummary_Chart_Data();

    sessionStorage.setItem('LoadedPage', '/Home');
    const selectedValuesString = sessionStorage.getItem('selectedValues');
    if (selectedValuesString) {
      this.selectedValues = JSON.parse(selectedValuesString);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  //===================Fetch Claim Summary Data========================
  get_claimSummary_Chart_Data() {
    const selectedValuesString = JSON.parse(
      sessionStorage.getItem('selectedValues')
    );
    var SearchOn_Value = selectedValuesString.searchOn;
    var facility_VAlue = selectedValuesString.facility;
    var encounterType_Value = selectedValuesString.encounterType;
    var fromdate = selectedValuesString.DateFrom;
    var todate = selectedValuesString.DateTo;

    // Set the parameter values as a small heading
    this.claimSummaryHeading = `
            Search On: ${SearchOn_Value}, Facility: ${facility_VAlue}, Encounter Type: ${encounterType_Value}, From Date: ${fromdate}, To Date: ${todate}`;

    this.service
      .getClaimSummary(
        SearchOn_Value,
        facility_VAlue,
        encounterType_Value,
        fromdate,
        todate
      )
      .subscribe((response: any) => {
        const ClaimsmrydataObj = response;
        this.processedData = ClaimsmrydataObj.data1;
        if (this.processedData) {
          this.isLoggedIn1 = false;
        }
      });
  }

  onStorageChange(event: StorageEvent) {
    if (event.storageArea === sessionStorage) {
      // console.log('Session storage data changed:', event.key);
    }
  }

  onItemClick(e) {
    sessionStorage.setItem('drillitem', e.item.argument);
    this.router.navigateByUrl('/drill1');
  }

  onData() {
    this.ngOnInit();
  }
  //==============================================
  customizeOppText(arg: { valueText: string }) {
    return `${arg.valueText}`;
  }
  //=================Customize Tolltip Format===================
  customizeTooltip(arg: any) {
    const argumentTextValue = new Intl.NumberFormat('en-US', {
      style: 'decimal',
    }).format(arg.valueText);
    return {
      text: `${arg.item.argument}: ${argumentTextValue}`,
    };
  }

  export() {
    this.vibleExportBtn = false;
    // const format = event.itemData;
    const funnelContainer = document.querySelector('.ExportDiv') as HTMLElement;
    const reportName = 'Claim Summary';
    this.service.export(reportName, funnelContainer);
    this.vibleExportBtn = true;
  }
}

@NgModule({
  imports: [
    CommonModule,
    CardAnalyticsModule,
    DxLoadIndicatorModule,
    DxFunnelModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxDropDownButtonModule,
  ],
  declarations: [ConversionCardComponent],
  exports: [ConversionCardComponent],
})
export class ConversionCardModule {}
