import {
  Component,
  NgModule,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { DxLookupModule, DxDropDownBoxModule } from 'devextreme-angular';
import { DxDateBoxModule, DxFormModule } from 'devextreme-angular';

import { DataService, ScreenService } from 'src/app/services';
import { DxSelectBoxModule } from 'devextreme-angular';

import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTabsModule } from 'devextreme-angular/ui/tabs';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import {
  DxTreeViewComponent,
  DxTreeViewModule,
  DxTreeViewTypes,
} from 'devextreme-angular/ui/tree-view';
import { Dates, PanelItem } from 'src/app/types/resource';
import { DxTextBoxModule } from 'devextreme-angular';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'toolbar-analytics',
  templateUrl: './toolbar-analytics.component.html',
  styleUrls: ['./toolbar-analytics.component.scss'],
})
export class ToolbarAnalyticsComponent implements OnInit, OnDestroy {
  @Input() selectedItems: Array<number>;
  @Input() titleText: string;
  @Input() panelItems: Array<PanelItem>;
  @Output() selectionChanged = new EventEmitter<Dates>();
  @Output() applyClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() onClick: () => void;
  @ViewChild(DxTreeViewComponent, { static: false })
  private subscription: Subscription;
  treeView: DxTreeViewComponent;
  isFinanceHomeLoaded: boolean = false; //used to show the asondate parameters only in finance page
  posts: any[];
  selectedValues: any;
  encountertype: string[];
  facility: string[];
  SearchOn: string[];
  encountertypevalue: any;
  facilityvalue: any[];
  searchOnvalue: any;
  AsOnDate: any = new Date();
  DateFrom: any = new Date();
  now: Date = new Date();
  min: Date = new Date(1900, 0, 1);
  DateTo: any = new Date();
  nowa: Date = new Date();
  mind: Date = new Date(1900, 0, 1);

  getInitDataresponse: any;
  SearchOnDatasource: any;
  EncountrTypeDatasource: any;
  FacilityDataSource: any;
  monthDataSource: { name: string; value: number }[];
  years: number[] = [];
  FacilityData: any;
  selectedYear: any;
  selectedmonth: any;

  showSelectionControls = 'true';
  multiSelection = 'true';
  userId: any;

  constructor(
    private router: Router,
    protected screen: ScreenService,
    public service: DataService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    //=========As on date only show finance page====
    this.subscription = this.sharedService.financeHomeLoaded$.subscribe(
      (isLoaded) => {
        this.isFinanceHomeLoaded = isLoaded;
      }
    );
    this.userId = this.sharedService.getUserId();

    this.getValuesOfInitData(this.userId);

    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
      this.years.push(year);
    }
    //===========Get Month List======================
    this.monthDataSource = this.service.getMonths();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  //=============Fetch values of search on,facility, and some loading time needed data================
  getValuesOfInitData(id: any) {
    this.service.getInitData(id).subscribe((response: any) => {
      if (response) {
        console.log('filter values fetched response :=>', response);
        this.getInitDataresponse = response;
        let fromDate = this.getInitDataresponse.DateFrom;
        let ToDate = this.getInitDataresponse.DateTo;
        console.log('ckecking values are :', this.getInitDataresponse);
        let As_Ondate = this.getInitDataresponse.AsOnDate;
        this.AsOnDate = new Date(As_Ondate);
        this.DateFrom = new Date(fromDate);
        this.DateTo = new Date(ToDate);
        const initialYear = (date) => new Date(date).getFullYear();
        this.selectedYear = initialYear(this.DateFrom);
        this.selectedmonth = ((date) => new Date(date).getMonth())(
          this.DateFrom
        );
        this.searchOnvalue =
          this.getInitDataresponse.SearchOn.find(
            (obj: any) => obj.Default === '1'
          )?.ID || ' ';
        const foundFacility = this.getInitDataresponse.Facility.find(
          (obj: any) => obj.Default === '1'
        );
        this.facilityvalue = foundFacility ? [foundFacility.ID] : [''];
        this.encountertypevalue =
          this.getInitDataresponse.EncountrType.find(
            (obj: any) => obj.Default === '1'
          )?.ID || '';
        this.SearchOnDatasource = this.getInitDataresponse.SearchOn;
        this.EncountrTypeDatasource = this.getInitDataresponse.EncountrType;
        this.FacilityData = this.getInitDataresponse.Facility;
        this.FacilityDataSource = this.FacilityData.filter(
          (item) => item.Name !== 'All'
        );
        this.setSelectedValuesData();
        this.sharedService.setinitDataLoaded(true);
      }
    });
  }
  //============Store the selected values to local storage=================
  setSelectedValuesData(): any {
    this.selectedValues = {
      searchOn: this.searchOnvalue,
      facility: this.facilityvalue.join(', '),
      encounterType: this.encountertypevalue,
      DateFrom: this.formatDate(this.DateFrom),
      DateTo: this.formatDate(this.DateTo),
      AsOnDate: this.formatDate(this.AsOnDate),
    };
    // console.log(this.selectedValues);
    sessionStorage.setItem(
      'selectedValues',
      JSON.stringify(this.selectedValues)
    );
    return this.selectedValues;
  }

  onMonthValueChanged(e: any) {
    this.selectedmonth = e.itemData.value;
    if (this.selectedmonth !== ' ') {
      this.DateFrom = new Date(this.selectedYear, this.selectedmonth, 1);
      this.DateTo = new Date(this.selectedYear, this.selectedmonth + 1, 0);
    } else {
      this.DateFrom = new Date(this.selectedYear, 0, 1);
      this.DateTo = new Date(this.selectedYear, 11, 31);
    }
  }
  //================Year value change ===========================

  onYearChanged(e: any): void {
    this.selectedYear = e.itemData;
    if (this.selectedmonth !== ' ') {
      this.DateFrom = new Date(this.selectedYear, this.selectedmonth, 1);
      this.DateTo = new Date(this.selectedYear, this.selectedmonth + 1, 0);
    } else {
      this.DateFrom = new Date(this.selectedYear, 0, 1);
      this.DateTo = new Date(this.selectedYear, 11, 31);
      this.selectedmonth = '';
    }
  }
  //===============Format the date fetch from date picker of ui ==================
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().substr(-4);
    return `${year}/${month}/${day}`;
  }
  //=======================Submit button ================================
  applyButtonClicked() {
    let LoadedPage = sessionStorage.getItem('LoadedPage');
    this.setSelectedValuesData();
    this.sharedService.reloadComponents();
    this.router.navigateByUrl(LoadedPage);
  }

  onDropDownBoxValueChanged() {
    this.updateSelection(this.treeView?.instance);
    const allItem = this.FacilityData.find((item) => item.Name === 'All');
    if (this.facilityvalue.includes(allItem.ID)) {
      const otherIds = this.FacilityData.filter(
        (item) => item.Name !== 'All'
      ).map((item) => item.ID);
      this.facilityvalue = otherIds;
      this.treeView.instance.selectAll();
    } else {
      this.treeView.instance.unselectAll();
    }
  }

  onTreeViewReady(e: DxTreeViewTypes.ContentReadyEvent) {
    this.updateSelection(e.component);
  }
  updateSelection(treeView: DxTreeViewComponent['instance']) {
    if (!treeView) return;

    if (!this.facilityvalue) {
      treeView.unselectAll();
    }

    this.facilityvalue?.forEach((value) => {
      treeView.selectItem(value);
    });
  }

  onTreeViewSelectionChanged(e: DxTreeViewTypes.ItemSelectionChangedEvent) {
    this.facilityvalue = e.component.getSelectedNodeKeys();
    const allItem = this.FacilityData.find((item) => item.Name === 'All');
    const selectedItems = this.treeView.instance
      .getSelectedNodes()
      .map((node) => node.itemData.ID);

    if (selectedItems.length === this.FacilityData.length - 1) {
      this.facilityvalue = [allItem.ID, ...selectedItems];
      this.treeView.instance.selectAll();
    } else {
      this.facilityvalue = selectedItems.filter((id) => id !== allItem.ID);
    }
  }
}
@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxTabsModule,
    DxTextBoxModule,
    DxToolbarModule,
    BrowserModule,
    DxLookupModule,
    DxDateBoxModule,
    DxTreeViewModule,
    DxFormModule,
    DxDropDownBoxModule,
    DxSelectBoxModule,
  ],
  declarations: [ToolbarAnalyticsComponent],
  exports: [ToolbarAnalyticsComponent],
})
export class ToolbarAnalyticsModule {}
