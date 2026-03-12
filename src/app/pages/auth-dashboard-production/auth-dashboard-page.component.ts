import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule, PercentPipe } from '@angular/common';
import {
  Component,
  HostListener,
  NgModule,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import notify from 'devextreme/ui/notify';
import {
  DxLoadIndicatorModule,
  DxFunnelModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxTabsModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxLookupModule,
  DxDateBoxModule,
  DxTreeViewModule,
  DxFormModule,
  DxDropDownBoxModule,
  DxSelectBoxModule,
  DxChartModule,
  DxPieChartModule,
  DxTagBoxModule,
  DxLoadPanelModule,
  DxDataGridModule,
  DxDataGridComponent,
  DxPopupModule,
} from 'devextreme-angular';
import { CardAnalyticsModule } from 'src/app/components/library/card-analytics/card-analytics.component';
import CustomStore from 'devextreme/data/custom_store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService } from 'src/app/services';
import { DxTagBoxTypes } from 'devextreme-angular/ui/tag-box';
import DataSource from 'devextreme/data/data_source';
@Component({
  selector: 'app-auth-dashboard-page',
  templateUrl: './auth-dashboard-page.component.html',
  styleUrls: ['./auth-dashboard-page.component.scss'],
  animations: [
    trigger('toggleRows', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('300ms ease-in', style({ height: '0', opacity: 0 })),
      ]),
    ]),
  ],
})
export class AuthDashboardPageComponent implements OnInit, OnDestroy {
  @ViewChild('payerTagBox', { static: false }) payerTagBox: any;

  @ViewChild('physicianTagBox', { static: false }) physicianTagBox: any;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  @HostListener('window:resize')
  onResize() {
    this.chartSize = { width: window.innerWidth * 0.95 };

    if (this.chartInstance) {
      this.chartInstance.option('size', { width: this.chartSize.width });
    }
  }

  chartSize = { width: window.innerWidth * 0.95 };
  payerPopupVisible = false;
  physicianPopupVisible = false;
  pipe = new PercentPipe('en-US');

  dateForm = {
    fromdate: '',
    todate: '',
  };
  vibleExportBtn: boolean = true;
  physicianvalue: any[];
  physicianNewvalue: any[] = [];
  PhysicianDatasource: any;
  denialcategoryvalue: any[];
  denialcategoryNewvalue: any[] = [];
  DenailCategoryDatasource: any;
  ServiceCategoryDatasource: any[];
  servicecategoryvalue: any[];
  servicecategoryNewvalue: any[] = [];
  modifiedFacilityDatasource: any;
  facilityvalue: any[];
  FacilityDataSource: any;
  SubmissionIndexvalue: any[] = [];
  SubmissionIndexDatasource: any;
  showGroups: boolean = true;
  loadingVisible: boolean = false;
  exportLoadingVisible: boolean = false;
  payerDatasource: any;
  payervalue: any;
  payerNewvalue: any[] = [];
  PhysicianCategoryDatasource: any;
  physiciancategoryvalue: any;
  physiciancategoryNewvalue: any[] = [];

  mainSeriesChartDatasource: any;
  TaTstatusDataSource: any;
  PayerWiseTATDatasource: any;
  FacilityWiseTATDatasource: any;
  // AuthTATEfficiencyDatasource: any;
  CountPerDaysData: any;

  ApprovalStatusChartData: any;

  userId: string;
  ReguestSendCardValue: any;

  chartInstance: any;

  physicianDataSource1: any;

  physicianSelectedItems: any[] = [];

  displayMode: any = 'full';

  payerDataSource1: any;

  payerSelectedItems: any[] = [];

  exportOptions = [
    {
      id: 'pdf',
      text: 'As PDF',
      icon: 'exportpdf',
      onClick: () => this.export(),
    },
    {
      id: 'excel',
      text: 'As Excel',
      icon: 'exportxlsx',
      onClick: () => this.exportExcel(),
    },
  ];
  //========================= Constructor =======================
  constructor(
    private router: Router,
    private service: DataService,
    private route: ActivatedRoute,
  ) {
    this.userId = sessionStorage.getItem('paramsid');
    if (this.userId != 'undefined' && this.userId != '' && this.userId > '0') {
    } else {
      this.router.navigate(['/auth/login']);
    }

    this.initializeDataSources();
  }

  private initializeDataSources(): void {
    // ========== Payer Data ==========
    const dashboardID = '3';
    const parameter = 'Payer';
    this.payerDataSource1 = this.createDataSource(
      dashboardID,
      parameter,
      (data) => this.sortPayerDataSource(data),
    );

    // ========== Physician Data ==========
    const clinicianDashboardID = '3';
    const clinicianParameter = 'Clinician';
    this.physicianDataSource1 = this.createDataSource(
      clinicianDashboardID,
      clinicianParameter,
      (data) => this.sortPhysicianDataSource(data),
    );
  }

  private createDataSource(
    dashboardID: string,
    parameter: string,
    sortFn: (data: any[]) => any[],
  ): any {
    return new DataSource<any>({
      load: () =>
        new Promise((resolve, reject) => {
          this.service.get_Parameter_List(dashboardID, parameter).subscribe({
            next: (response: any) => {
              const allItems = response?.Parameters ?? [];
              const sorted = sortFn(allItems);
              resolve(sorted);
            },
            error: (error) => reject(error.message),
          });
        }),
    });
  }

  onPayerSelectionChanged(e: any) {
    console.log(e);
    this.payerSelectedItems = e.selectedRowsData;
    this.payervalue = e.selectedRowKeys;
    this.payerNewvalue = this.payervalue.map((item) => item.ID);
  }

  handlePayerClick(event: MouseEvent) {
    // Prevent the dropdown from opening
    event.preventDefault();
    event.stopPropagation();
    this.openPayerPopup();
  }

  private sortPayerDataSource(allPayers: any[]) {
    const selectedIds = this.payervalue?.map((item: any) => item.ID) || [];
    const selectedSet = new Set(selectedIds);

    return [
      // Selected payers first
      ...(this.payervalue || []),
      // Remaining payers
      ...allPayers.filter((item: any) => !selectedSet.has(item.ID)),
    ];
  }

  getPayerTooltip(): string {
    if (!this.payerSelectedItems || this.payerSelectedItems.length === 0) {
      return '';
    }

    return this.payerSelectedItems.map((item: any) => item.Name).join(', ');
  }

  onPayerValueChanged(e: any) {
    const selectedIDs = e.value || [];

    //Update the selected items based on selected IDs
    this.payervalue = this.payerSelectedItems.filter((item: any) =>
      selectedIDs.includes(item.ID),
    );

    this.payerNewvalue = selectedIDs;
  }

  openPayerPopup() {
    this.payerPopupVisible = true;
  }

  onPhysicianSelectionChanged(e: any) {
    console.log(e);
    this.physicianSelectedItems = e.selectedRowsData;
    this.physiciancategoryvalue = e.selectedRowKeys;
    this.physiciancategoryNewvalue = this.physiciancategoryvalue.map(
      (item) => item.ID,
    );
  }

  handlePhysicianClick(event: MouseEvent) {
    // Prevent the dropdown from opening
    event.preventDefault();
    event.stopPropagation();
    this.openPhysicianPopup();
  }

  private sortPhysicianDataSource(allPayers: any[]) {
    const selectedIds =
      this.physiciancategoryvalue?.map((item: any) => item.ID) || [];
    const selectedSet = new Set(selectedIds);

    return [
      // Selected payers first
      ...(this.physiciancategoryvalue || []),
      // Remaining payers
      ...allPayers.filter((item: any) => !selectedSet.has(item.ID)),
    ];
  }

  getPhysicianTooltip(): string {
    if (
      !this.physicianSelectedItems ||
      this.physicianSelectedItems.length === 0
    ) {
      return '';
    }

    return this.physicianSelectedItems.map((item: any) => item.Name).join(', ');
  }

  onPhysicianValueChanged(e: any) {
    const selectedIDs = e.value || [];

    //Update the selected items based on selected IDs
    this.physiciancategoryvalue = this.physicianSelectedItems.filter(
      (item: any) => selectedIDs.includes(item.ID),
    );

    this.physiciancategoryNewvalue = selectedIDs;
  }

  openPhysicianPopup() {
    this.physicianPopupVisible = true;
  }

  onChartInitialized(e) {
    this.chartInstance = e.component; // Store reference to the chart
  }

  customizeLabelText = (pointInfo: any) => {
    // Find the corresponding data object in TaTstatusDataSource
    const item = this.TaTstatusDataSource.find(
      (data) => data.Count === pointInfo.value,
    );

    // Format value with thousand separator
    const formattedValue = pointInfo.value.toLocaleString();

    const percentage = item ? item.Percent.toFixed(2) : '0.00';

    return `${formattedValue} (${percentage}%)`;
  };

  customizeFacilityLabelText(e: any) {
    return `${e.value}%`;
  }

  customizeTooltip = ({ valueText, seriesName }) => ({
    text: `${valueText}%`,
  });

  customizeFacilityTooltip(pointInfo: any) {
    const facilityName =
      pointInfo.point?.data?.FacilityName || pointInfo.argumentText;
    const percentValue = pointInfo.value;

    return {
      text: `${facilityName}`,
      // text: `${facilityName}: ${percentValue}%`
    };
  }

  customizeChartLabelText = (pointInfo: any) => {
    return pointInfo.value.toLocaleString(); // Formats with thousand separator
  };

  customizeCountPerDayLabelText = (pointInfo: any) => {
    return pointInfo.value.toLocaleString(); // Formats with thousand separator
  };

  // ======================== X-Axis value rotated and value custom==============
  formatXAxisText = (axisInfo: any): string => {
    const text = axisInfo.value;
    const parts = text.split(' ');
    const middleIndex = Math.ceil(parts.length / 2);
    const firstLine = parts.slice(0, middleIndex).join(' ');
    const secondLine = parts.slice(middleIndex).join(' ');
    return `${firstLine}\n${secondLine}`;
  };

  //tag-box

  onMultiTagDepartmentPreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.PhysicianDatasource.length;

    if (selectedItemsLength < totalCount) {
      this.physicianNewvalue = this.physicianvalue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.physicianNewvalue = [];
    }
  }

  onMultiTagDenialCategoryPreparing(
    args: DxTagBoxTypes.MultiTagPreparingEvent,
  ) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.DenailCategoryDatasource.length;

    if (selectedItemsLength < totalCount) {
      this.denialcategoryNewvalue = this.denialcategoryvalue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.denialcategoryNewvalue = [];
    }
  }

  onMultiTagPhysicianCategoryPreparing(
    args: DxTagBoxTypes.MultiTagPreparingEvent,
  ) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.PhysicianCategoryDatasource.length;

    if (selectedItemsLength < totalCount) {
      this.physiciancategoryNewvalue = this.physiciancategoryvalue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.physicianNewvalue = [];
    }
  }

  onMultiTagServiceCategoryPreparing(
    args: DxTagBoxTypes.MultiTagPreparingEvent,
  ) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.ServiceCategoryDatasource.length;

    if (selectedItemsLength < totalCount) {
      this.servicecategoryNewvalue = this.servicecategoryvalue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.servicecategoryNewvalue = [];
    }
  }

  onMultiTagPayerPreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.payerDatasource.length;

    if (selectedItemsLength < totalCount) {
      this.payerNewvalue = this.payervalue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.payerNewvalue = [];
    }
  }

  //======================Page on init ========================
  ngOnInit(): void {
    setTimeout(() => {
      this.get_initial_data();
    }, 500);
  }

  ngOnDestroy(): void {
    this.loadingVisible = false;
  }

  toggleGroups(): void {
    this.showGroups = !this.showGroups;
  }

  //===========show filter div by clicking showing div========
  Show_toggle_Groups_By_Div_click(): void {
    this.showGroups = true;
  }

  //=========MAking cutom datasource for facility datagrid and dropdown loADING=======
  makeAsyncDataSourceFromJson(jsonData: any) {
    return new CustomStore({
      loadMode: 'raw',
      key: 'ID',
      load: () => {
        return new Promise((resolve, reject) => {
          try {
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  }

  //=========== reorder list options to selected data to the top side ========
  reorderDataSource(selectedvalues: string, datsourceName: string) {
    // Filter the selected items
    const selectedItems = this[datsourceName].filter((item) =>
      this[selectedvalues].includes(item.ID),
    );

    console.log(selectedItems, 'selectedValues');
    const nonSelectedItems = this[datsourceName].filter(
      (item) => !this[selectedvalues].includes(item.ID),
    );

    // Store only the selected IDs in the correct `*Newvalue`
    switch (selectedvalues) {
      case 'payervalue':
        this.payerNewvalue = selectedItems.map((item) => item.ID);
        break;
      case 'physicianvalue':
        this.physicianNewvalue = selectedItems.map((item) => item.ID);
        break;
      case 'denialcategoryvalue':
        this.denialcategoryNewvalue = selectedItems.map((item) => item.ID);
        break;
      case 'servicecategoryvalue':
        this.servicecategoryNewvalue = selectedItems.map((item) => item.ID);
        break;
      case 'payervalue':
        this.payerNewvalue = selectedItems.map((item) => item.ID);
        break;
      case 'physiciancategoryvalue':
        this.physiciancategoryNewvalue = selectedItems.map((item) => item.ID);
        break;
    }

    nonSelectedItems.sort((a, b) => a.Name.localeCompare(b.Name));
    this[datsourceName] = [...selectedItems, ...nonSelectedItems];
  }
  //===========Function to handle selection change and sort the data==========
  onSelectionChanged(event: any, jsonData: any[], dataSourceKey: string): void {
    console.log('Original JSON Data:', jsonData);
    const selectedRows = event.selectedRowsData;
    const selectedRowIds = selectedRows.map((row) => row.ID);
    const unselectedRows = jsonData.filter(
      (row) => !selectedRowIds.includes(row.ID),
    );
    const reorderedData = [...selectedRows, ...unselectedRows];
    this[dataSourceKey] = this.makeAsyncDataSourceFromJson(reorderedData);
    console.log('Updated DataSource:', this[dataSourceKey]);
    this.dataGrid.instance.refresh();
  }

  //================= Initial Data Fetch =================
  get_initial_data() {
    let storedUserId = sessionStorage.getItem('paramsid');
    if (storedUserId && storedUserId !== 'undefined' && storedUserId !== null) {
      this.userId = storedUserId;
      this.getValuesOfInitData();
    } else {
      this.route.queryParams.subscribe((params: Params) => {
        let queryUserId = params['userId'];
        if (
          queryUserId &&
          queryUserId !== 'undefined' &&
          queryUserId !== null
        ) {
          this.userId = queryUserId;
          sessionStorage.setItem('paramsid', this.userId);
          this.getValuesOfInitData();
        } else {
          console.warn('No user data available, redirecting to login.');
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  //================= Fetch Dropdown Init Values =================

  getValuesOfInitData() {
    this.loadingVisible = true;
    this.service
      .get_Denial_Dashboard_InitData(this.userId)
      .subscribe((response: any) => {
        if (response.flag == '1') {
          this.dateForm.fromdate = response.DateFrom;
          this.dateForm.todate = response.DateTo;

          this.FacilityDataSource = response.Facility;
          this.modifiedFacilityDatasource = this.makeAsyncDataSourceFromJson(
            response.Facility,
          );
          this.facilityvalue = this.FacilityDataSource.filter(
            (item) => item.Default === '1',
          ).map((item) => item.ID);

          this.PhysicianDatasource = response.Department;
          this.DenailCategoryDatasource = response.DenialCategory;
          this.ServiceCategoryDatasource = response.CPTBlock;
          this.payerDatasource = response.Payer;
          this.PhysicianCategoryDatasource = response.PhysicianCategory;
        }

        // Load graph initially with action 1
        this.get_chart_datasource(1);
      });
  }

  //==================== Fetch Chart Data ====================
  get_chart_datasource(actionType: number = 1) {
    const startTime = performance.now();
    this.loadingVisible = true;
    this.showGroups = false;

    const payloadParams = {
      dateFrom: this.dateForm.fromdate,
      dateTo: this.dateForm.todate,
      denialCategory: this.denialcategoryNewvalue.join(','),
      facility: this.facilityvalue.join(','),
      physician: this.physicianNewvalue.join(','),
      serviceCategory: this.servicecategoryNewvalue.join(','),
      payer: this.payerNewvalue.join(','),
      physicianCategory: this.physiciancategoryNewvalue.join(','),
    };

    this.service
      .get_Prior_Dashboard_Production_Datasource(
        payloadParams.dateFrom,
        payloadParams.dateTo,
        payloadParams.denialCategory,
        payloadParams.facility,
        payloadParams.physician,
        payloadParams.serviceCategory,
        payloadParams.payer,
        payloadParams.physicianCategory,
      )
      .subscribe(
        (response: any) => {
          const endTime = performance.now();
          const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

          if (response.flag === '1') {
            this.ReguestSendCardValue =
              response.card?.RequestCount.toLocaleString() || [];
            this.ApprovalStatusChartData = response.ApprovalStatus || [];
            this.mainSeriesChartDatasource = response.EncounterWise || [];
            this.TaTstatusDataSource = response.TATWise || [];
            this.PayerWiseTATDatasource = response.PayerWiseTAT || [];
            this.FacilityWiseTATDatasource = response.FacilityWiseTAT || [];
            this.CountPerDaysData = response.DayWise || [];
          }

          // Log user activity
          const sessionID = sessionStorage.getItem('SessionID');
          const activityLogPayload = {
            sessionid: sessionID,
            action: actionType,
            dashboard: 'Authorization Dashboard - Production',
            duration: durationInSeconds,
            export: 0,
            PriorParameter: payloadParams,
          };

          this.service
            .dashboard_activity_LogData(activityLogPayload)
            .subscribe({
              next: () => console.log('Activity log saved'),
              error: (err) => console.error('Failed to save activity log', err),
            });

          this.loadingVisible = false;
        },
        (error) => {
          this.loadingVisible = false;
        },
      );
  }

  //================= Apply Button Click =================
  applyButtonClicked() {
    this.get_chart_datasource(8); // Apply click
  }

  onExportClick(e: any) {}

  //================== Export Graph ==================
  export() {
    this.exportLoadingVisible = true;

    const exportDiv1 = document.querySelector('.ExportDiv1') as HTMLElement;
    const exportDiv2 = document.querySelector('.ExportDiv2') as HTMLElement;
    const exportDiv3 = document.querySelector('.ExportDiv3') as HTMLElement;
    const exportDiv4 = document.querySelector('.ExportDiv4') as HTMLElement;
    const exportDiv5 = document.querySelector('.ExportDiv5') as HTMLElement;
    const reportName = 'Authorization Dashboard - Production';

    const startTime = performance.now();
    this.service
      .exportGraphData(reportName, [
        exportDiv1,
        exportDiv2,
        exportDiv3,
        exportDiv4,
        exportDiv5,
      ])
      .then(() => {
        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

        const payloadParams = {
          dateFrom: this.dateForm.fromdate,
          dateTo: this.dateForm.todate,
          denialCategory: this.denialcategoryNewvalue.join(','),
          facility: this.facilityvalue.join(','),
          physician: this.physicianNewvalue.join(','),
          serviceCategory: this.servicecategoryNewvalue.join(','),
          payer: this.payerNewvalue.join(','),
          physicianCategory: this.physiciancategoryNewvalue.join(','),
        };
        // Log export action
        const sessionID = sessionStorage.getItem('SessionID');
        const activityLogPayload = {
          sessionid: sessionID,
          action: 8,
          dashboard: 'Authorization Dashboard - Production',
          duration: durationInSeconds,
          export: 1,
          PriorParameter: payloadParams,
        };

        this.service.dashboard_activity_LogData(activityLogPayload).subscribe();

        this.exportLoadingVisible = false;
      })
      .catch((error) => {
        this.exportLoadingVisible = false;
        console.error('Export failed:', error);
      });
  }

  //================== Export Excel ==================
  exportExcel() {
    this.showGroups = false;
    this.exportLoadingVisible = true;

    const payloadParams = {
      dateFrom: this.dateForm.fromdate,
      dateTo: this.dateForm.todate,
      denialCategory: this.denialcategoryNewvalue.join(','),
      facility: this.facilityvalue.join(','),
      physician: this.physicianNewvalue.join(','),
      serviceCategory: this.servicecategoryNewvalue.join(','),
      payer: this.payerNewvalue.join(','),
      physicianCategory: this.physiciancategoryNewvalue.join(','),
    };

    const startTime = performance.now();
    this.service
      .get_Prior_Dashboard_Production_Export_Data(
        payloadParams.dateFrom,
        payloadParams.dateTo,
        payloadParams.denialCategory,
        payloadParams.facility,
        payloadParams.physician,
        payloadParams.serviceCategory,
        payloadParams.payer,
        payloadParams.physicianCategory,
      )
      .subscribe((response: any) => {
        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

        if (response && response.PriorData) {
          this.exportLoadingVisible = false;
          this.service.PriorexportToExcel(
            response.PriorData,
            'ExportedPriorProductionDashboardData',
            'Prior Data',
          );
        } else {
          notify(`${response.message}`, 'error', 3000);
          this.exportLoadingVisible = false;
        }

        // Log Excel export
        const sessionID = sessionStorage.getItem('SessionID');
        const activityLogPayload = {
          sessionid: sessionID,
          action: 8,
          dashboard: 'Authorization Dashboard - Production',
          duration: durationInSeconds,
          export: 1,
          PriorParameter: payloadParams,
        };

        this.service.dashboard_activity_LogData(activityLogPayload).subscribe();
      });
  }
}

@NgModule({
  imports: [
    CommonModule,
    CardAnalyticsModule,
    DxLoadIndicatorModule,
    DxFunnelModule,
    DxButtonModule,
    DxDropDownButtonModule,
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
    DxChartModule,
    DxPieChartModule,
    DxTagBoxModule,
    DxLoadPanelModule,
    DxDataGridModule,
    FormsModule,
    DxPopupModule,
  ],
  declarations: [AuthDashboardPageComponent],
  exports: [AuthDashboardPageComponent],
})
export class AuthDashboardPageModule {}
