import { CommonModule, PercentPipe } from '@angular/common';
import {
  Component,
  HostListener,
  NgModule,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
} from 'devextreme-angular';
import { CardAnalyticsModule } from 'src/app/components/library/card-analytics/card-analytics.component';
import { DataService } from 'src/app/services';
import CustomStore from 'devextreme/data/custom_store';
import { DxTagBoxTypes } from 'devextreme-angular/ui/tag-box';
import notify from 'devextreme/ui/notify';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-auth-dashboard-operation',
  templateUrl: './auth-dashboard-operation.component.html',
  styleUrls: ['./auth-dashboard-operation.component.scss'],
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
export class AuthDashboardOperationComponent implements OnInit {
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

  pipe = new PercentPipe('en-US');

  dateForm = {
    fromdate: '',
    todate: '',
  };
  vibleExportBtn: boolean = true;
  Departmentvalue: any[];
  DepartmentNewvalue: any[] = [];
  DepartmentDatasource: any;
  denialcategoryvalue: any[];
  denialcategoryNewvalue: any[] = [];
  DenailCategoryDatasource: any;
  ServiceCategoryDatasource: any[];
  AuthTATEfficiencyDatasource: any[];
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

  mainSeriesChartDatasource: any;
  TaTstatusDataSource: any;
  CountPerDaysData: any;

  ApprovalStatusChartData: any;

  DenialCategoryChartData: any;

  userId: string;
  ReguestSendCardValue: any;
  pieChartDatasource: any;
  chartInstance: any;

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
    private route: ActivatedRoute
  ) {
    this.userId = sessionStorage.getItem('paramsid');
    if (this.userId != 'undefined' && this.userId != '' && this.userId > '0') {
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  onChartInitialized(e) {
    this.chartInstance = e.component; // Store reference to the chart
  }

  //======================Page on init ========================
  ngOnInit(): void {
    setTimeout(() => {
      this.get_initial_data();
    }, 500);
  }

  //tag-box

  onMultiTagDepartmentPreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.DepartmentDatasource.length;

    if (selectedItemsLength < totalCount) {
      this.DepartmentNewvalue = this.Departmentvalue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.DepartmentNewvalue = [];
    }
  }

  onMultiTagServiceCategoryPreparing(
    args: DxTagBoxTypes.MultiTagPreparingEvent
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

  //===========show filter div by clicking showing div========
  Show_toggle_Groups_By_Div_click(): void {
    this.showGroups = true;
  }

  customizeFacilityLabelText(e: any) {
    return `${e.value}%`;
  }

  //===================Custom label for pie chart ===========
  customizeLabel(arg) {
    const formattedValue = arg.value.toLocaleString();
    return `${formattedValue} (${arg.percentText})`;
  }

  customizeLabelText = (pointInfo: any) => {
    // Find the corresponding data object in TaTstatusDataSource
    const item = this.TaTstatusDataSource.find(
      (data) => data.Count === pointInfo.value
    );

    const formattedValue = pointInfo.value.toLocaleString();

    const percentage = item ? item.Percent.toFixed(2) : '0.00';

    return `${formattedValue} (${percentage}%)`;
  };

  customizeChartLabelText = (pointInfo: any) => {
    return pointInfo.value.toLocaleString(); // Formats with thousand separator
  };

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
      this[selectedvalues].includes(item.ID)
    );
    const nonSelectedItems = this[datsourceName].filter(
      (item) => !this[selectedvalues].includes(item.ID)
    );

    switch (selectedvalues) {
      case 'Departmentvalue':
        this.DepartmentNewvalue = selectedItems.map((item) => item.ID);
        break;
      case 'encountertypevalue':
        this.servicecategoryNewvalue = selectedItems.map((item) => item.ID);
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
      (row) => !selectedRowIds.includes(row.ID)
    );
    const reorderedData = [...selectedRows, ...unselectedRows];
    this[dataSourceKey] = this.makeAsyncDataSourceFromJson(reorderedData);
    console.log('Updated DataSource:', this[dataSourceKey]);
    this.dataGrid.instance.refresh();
  }

  toggleGroups(): void {
    this.showGroups = !this.showGroups;
  }
  //================== Call initial value fetching ==========
  get_initial_data() {
    const storedUserId = sessionStorage.getItem('paramsid');

    if (storedUserId && storedUserId !== 'undefined') {
      this.setUserIdAndFetchData(storedUserId);
    } else {
      this.route.queryParams.subscribe((params: Params) => {
        const queryUserId = params['userId'];
        if (queryUserId && queryUserId !== 'undefined') {
          sessionStorage.setItem('paramsid', queryUserId);
          this.setUserIdAndFetchData(queryUserId);
        } else {
          console.warn('No user data available, redirecting to login.');
          this.loadingVisible = false;
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  private setUserIdAndFetchData(userId: string) {
    this.userId = userId;
    this.getValuesOfInitData();
  }

  //===================== Fetch init dataSource =========================
  getValuesOfInitData() {
    this.loadingVisible = true;

    this.service
      .get_Denial_Dashboard_InitData(this.userId)
      .subscribe((response: any) => {
        if (response.flag === '1') {
          this.dateForm = {
            fromdate: response.DateFrom,
            todate: response.DateTo,
          };

          this.FacilityDataSource = response.Facility;
          this.modifiedFacilityDatasource = this.makeAsyncDataSourceFromJson(
            response.Facility
          );
          this.facilityvalue = this.FacilityDataSource.filter(
            (item) => item.Default === '1'
          ).map((item) => item.ID);

          this.DepartmentDatasource = response.Department;
          this.ServiceCategoryDatasource = response.CaseType;
        }

        this.get_chart_datasource(1); // Opened
      });
  }

  //================== Fetch data of chart datasource ====================
  get_chart_datasource(action: number = 1) {
    const startTime = performance.now();
    this.loadingVisible = true;
    this.showGroups = false;

    const { fromdate, todate } = this.dateForm;

    const payloadParams = {
      fromdate,
      todate,
      facility: this.facilityvalue.join(','),
      department: this.DepartmentNewvalue.join(','),
      serviceCategory: this.servicecategoryNewvalue.join(','),
    };

    this.service
      .get_Prior_Dashboard_Opreations_Datasource(
        payloadParams.fromdate,
        payloadParams.todate,
        payloadParams.facility,
        payloadParams.department,
        payloadParams.serviceCategory
      )
      .subscribe({
        next: (response: any) => {
          const endTime = performance.now();
          const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

          if (response.flag === '1') {
            this.ReguestSendCardValue =
              response.card.RequestCount.toLocaleString();
            this.ApprovalStatusChartData = response.ApprovalStatus;
            this.mainSeriesChartDatasource = response.EncounterWise;
            this.pieChartDatasource = response.ServiceWise;
            this.TaTstatusDataSource = response.TATWise;
            this.AuthTATEfficiencyDatasource = response.AuthTATEfficiency || [];
          } else {
            notify(`${response.message}`, 'error', 3000);
          }

          this.logDashboardActivity(
            action,
            durationInSeconds,
            payloadParams,
            0
          );
          this.loadingVisible = false;
        },
        error: (err) => {
          notify('Failed to load dashboard data.', 'error', 3000);
          console.error(err);
          this.loadingVisible = false;
        },
      });
  }

  //================== Log dashboard activity ==================
  logDashboardActivity(
    action: number,
    duration: string,
    payloadParams: any,
    exportFlag: number = 0
  ) {
    const sessionID = sessionStorage.getItem('SessionID');

    const activityLogPayload: any = {
      sessionid: sessionID,
      action,
      dashboard: 'Authorization Dashboard - Operation',
      duration,
      export: exportFlag,
      PriorParameter: payloadParams, // Keeping same param name for consistency
    };

    this.service.dashboard_activity_LogData(activityLogPayload).subscribe({
      next: () => console.log('Activity log saved with action:', action),
      error: (err) => console.error('Failed to save activity log', err),
    });
  }

  //===================== Apply Button Clicked ========================
  applyButtonClicked() {
    this.get_chart_datasource(8); // Refreshed
  }

  //================== Export PDF ==================
  export() {
    this.exportLoadingVisible = true;

    const exportDiv1 = document.querySelector('.ExportDiv1') as HTMLElement;
    const exportDiv2 = document.querySelector('.ExportDiv2') as HTMLElement;
    const exportDiv3 = document.querySelector('.ExportDiv3') as HTMLElement;
    const exportDiv4 = document.querySelector('.ExportDiv4') as HTMLElement;
    const exportDiv5 = document.querySelector('.ExportDiv5') as HTMLElement;
    const reportName = 'Authorization Dashboard-Operaion';
    const start = performance.now();

    this.service
      .exportGraphData(reportName, [
        exportDiv1,
        exportDiv2,
        exportDiv3,
        exportDiv4,
        exportDiv5,
      ])
      .then(() => {
        this.exportLoadingVisible = false;
        const end = performance.now();
        const duration = ((end - start) / 1000).toFixed(2);

        const payloadParams = {
          fromdate: this.dateForm.fromdate,
          todate: this.dateForm.todate,
          facility: this.facilityvalue.join(','),
          department: this.DepartmentNewvalue.join(','),
          serviceCategory: this.servicecategoryNewvalue.join(','),
        };

        this.logDashboardActivity(8, duration, payloadParams, 1); // Export
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

    const { fromdate, todate } = this.dateForm;
    const facility = this.facilityvalue.join(',');
    const department = this.DepartmentNewvalue.join(',');
    const serviceCategory = this.servicecategoryNewvalue.join(',');

    this.service
      .get_Prior_Dashboard_Opreations_Export_Data(
        fromdate,
        todate,
        facility,
        department,
        serviceCategory
      )
      .subscribe((response: any) => {
        this.exportLoadingVisible = false;

        if (response && response.PriorData) {
          this.service.PriorexportToExcel(
            response.PriorData,
            'ExportedPriorOperationDashboardData',
            'Prior Data'
          );

          const payloadParams = {
            fromdate,
            todate,
            facility,
            department,
            serviceCategory,
          };

          this.logDashboardActivity(8, '0', payloadParams, 1); // Export
        } else {
          notify(`${response.message}`, 'error', 3000);
        }
      });
  }

  onExportClick(e: any) {}
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
  ],
  declarations: [AuthDashboardOperationComponent],
  exports: [AuthDashboardOperationComponent],
})
export class AuthDashboardOperationModule {}
