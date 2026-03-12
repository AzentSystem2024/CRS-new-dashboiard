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
import CustomStore from 'devextreme/data/custom_store';
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
import { DataService } from 'src/app/services';
import { animate, style, transition, trigger } from '@angular/animations';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DxTagBoxTypes } from 'devextreme-angular/ui/tag-box';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.scss'],
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
export class FinanceDashboardComponent implements OnInit {
  @ViewChild('insuranceTagBox', { static: false }) insuranceTagBox: any;

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
  insurancePopupVisible = false;
  pipe = new PercentPipe('en-US');

  dateForm = {
    fromdate: '',
    todate: '',
    AsOnDate: '',
  };
  isTakenBackAmountAvailable: boolean = false;
  vibleExportBtn: boolean = true;
  SearchOnDatasource: any;
  searchOnvalue: any;
  EncountrTypeDatasource: any;
  encountertypevalue: any;
  encountertypeNewvalue: any[] = [];
  insuranceDataSource: any;
  insuranceValue: any;
  insuranceNewValue: any[] = [];
  DepartmentDatasource: any;
  DepartmentValue: any;
  DepartmentNewValue: any[] = [];
  facilityvalue: any;
  modifiedFacilityDatasource: any;
  FacilityDataSource: any;
  CaseTypeDatasource: any;
  caseTypeValue: any;

  userId: any;
  loadingVisible: boolean = false;
  exportLoadingVisible: boolean = false;
  showGroups: boolean = true;

  chartInstance: any;
  //===========graph datasource===========
  BarChartDataSource: any;
  pieChartDatasource: any;
  InsuranceSubmissionRevenueMOMDatasource: any;
  displayMode: any = 'full';

  insuranceDataSource1: any;

  insuranceSelectedItems: any[] = [];
  customMultiTagText: string = '';

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

  constructor(
    public service: DataService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const dashboardID = '2';
    const parameter = 'Payer';

    this.insuranceDataSource1 = new DataSource<any>({
      load: () =>
        new Promise((resolve, reject) => {
          this.service.get_Parameter_List(dashboardID, parameter).subscribe({
            next: (response: any) => {
              const allPayers = response?.Parameters ?? [];
              const sorted = this.sortInsuranceDataSource(allPayers);
              resolve(sorted);
            },
            error: (error) => reject(error.message),
          });
        }),
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.get_initial_data();
    }, 500);
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

    this.service.get_Finance_Dashboard_InitData(this.userId).subscribe({
      next: (response: any) => {
        if (response) {
          this.SearchOnDatasource = response.SearchOn;
          this.EncountrTypeDatasource = response.EncounterType;
          this.insuranceDataSource = response.Insurance;
          this.DepartmentDatasource = response.Department;
          this.FacilityDataSource = response.Facility;
          this.modifiedFacilityDatasource = this.makeAsyncDataSourceFromJson(
            response.Facility,
          );

          this.dateForm = {
            fromdate: response.DateFrom,
            todate: response.DateTo,
            AsOnDate: response.DateAsOn,
          };

          this.searchOnvalue =
            this.SearchOnDatasource.find((obj: any) => obj.Default === '1')
              ?.ID ?? ' ';

          this.facilityvalue = this.FacilityDataSource.filter(
            (item) => item.Default === '1',
          ).map((item) => item.ID);
        }

        this.get_graph_DataSource(1);
      },
      error: (err) => {
        console.error(err);
        notify('Failed to load initial data.', 'error', 3000);
        this.loadingVisible = false;
      },
    });
  }

  //================== Fetch data of graph datasource ====================
  async get_graph_DataSource(action: number = 1) {
    const startTime = performance.now();
    this.loadingVisible = true;
    this.showGroups = false;

    const { fromdate, todate, AsOnDate } = this.dateForm;

    const payloadParams = {
      searchValue: this.searchOnvalue,
      dateFrom: fromdate,
      dateTo: todate,
      asOnDate: AsOnDate,
      encounterType: this.encountertypeNewvalue.join(','),
      facility: this.facilityvalue.join(','),
      insurance: this.insuranceNewValue.join(','),
      department: this.DepartmentNewValue.join(','),
    };

    this.service
      .get_Finance_Home_Dashboard_Datasource(
        payloadParams.searchValue,
        payloadParams.dateFrom,
        payloadParams.dateTo,
        payloadParams.asOnDate,
        payloadParams.encounterType,
        payloadParams.facility,
        payloadParams.insurance,
        payloadParams.department,
      )
      .subscribe({
        next: (response: any) => {
          const endTime = performance.now();
          const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

          if (response && response.flag === '1') {
            this.BarChartDataSource = (response.claimanalysis || []).map(
              (item: any) => {
                const paidPercentage =
                  item.RemittedAmount > 0
                    ? (item.PaidAmount / item.RemittedAmount) * 100
                    : 0;

                return {
                  ...item,
                  PaidPercentage: Number(paidPercentage.toFixed(2)),
                };
              },
            );

            this.pieChartDatasource = response.claimeageing;

            this.InsuranceSubmissionRevenueMOMDatasource = response.RevenueMonth;

            this.isTakenBackAmountAvailable =
              response.claimanalysis?.some(
                (item) => item.TakenBackAmount >= 0,
              ) ?? false;
          } else {
            notify(`${response.message}`, 'error', 3000);
          }

          this.logDashboardActivity(
            action,
            durationInSeconds,
            payloadParams,
            0,
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

  onInsuranceSelectionChanged(e: any) {
    console.log(e);
    this.insuranceSelectedItems = e.selectedRowsData;
    this.insuranceValue = e.selectedRowKeys;
    this.insuranceNewValue = this.insuranceValue.map((item: any) => item.ID);
  }

  onInsuranceDropdownOpened() {
    this.insurancePopupVisible = true;
  }

  handleInsuranceClick(event: MouseEvent) {
    // Prevent the dropdown from opening
    event.preventDefault();
    event.stopPropagation();
    this.openInsurancePopup();
  }

  private sortInsuranceDataSource(allPayers: any[]) {
    const selectedIds = this.insuranceValue?.map((item: any) => item.ID) || [];
    const selectedSet = new Set(selectedIds);

    return [
      // Selected payers first
      ...(this.insuranceValue || []),
      // Remaining payers
      ...allPayers.filter((item: any) => !selectedSet.has(item.ID)),
    ];
  }

  getInsuranceTooltip(): string {
    if (
      !this.insuranceSelectedItems ||
      this.insuranceSelectedItems.length === 0
    ) {
      return '';
    }

    return this.insuranceSelectedItems.map((item: any) => item.Name).join(', ');
  }

  onInsuranceValueChanged(e: any) {
    const selectedIDs = e.value || [];

    //Update the selected items based on selected IDs
    this.insuranceValue = this.insuranceSelectedItems.filter((item: any) =>
      selectedIDs.includes(item.ID),
    );

    this.insuranceNewValue = selectedIDs;
  }

  openInsurancePopup() {
    this.insurancePopupVisible = true;
  }

  onChartInitialized(e) {
    this.chartInstance = e.component;
  }

  onMultiTagEncounterTypePreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.EncountrTypeDatasource.length;

    if (selectedItemsLength < totalCount) {
      this.encountertypeNewvalue = this.encountertypevalue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.encountertypeNewvalue = [];
    }
  }

  onMultiTagDepartmentPreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.DepartmentDatasource.length;

    if (selectedItemsLength < totalCount) {
      this.DepartmentNewValue = this.DepartmentValue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.DepartmentNewValue = [];
    }
  }

  onMultiTagInsurancePreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    const totalCount = this.insuranceDataSource.length;

    if (selectedItemsLength < totalCount) {
      this.insuranceNewValue = this.insuranceValue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.insuranceNewValue = [];
    }
  }

  //===========show filter div by clicking showing div========
  Show_toggle_Groups_By_Div_click(): void {
    this.showGroups = true;
  }
  //================= hide and show filter div ===============
  toggleGroups(): void {
    this.showGroups = !this.showGroups;
  }
  //===================Custom label for pie chart ===========
  customizeLabel(arg) {
    return `${arg.point.data.Percentage}%`;
  }

  customizeTooltip = (args: any) => {
    return {
      text: `${this.MillioncustomizeLabel(args)}`,
    };
  };

  //=============== Custom Label for Bard chart =============
  MillioncustomizeLabel = (args: any): string => {
    const value = args.value;
    const seriesName = args.seriesName; // which bar: Paid, Claimed, etc.
    const data = args.point?.data;
    // ===== format value =====
    let formattedValue = '';
    if (value >= 1000000) {
      formattedValue = `${(value / 1000000).toFixed(2)} M`;
    } else if (value > 0) {
      formattedValue = `${(value / 1000).toFixed(2)} K`;
    } else {
      formattedValue = `${value}`;
    }
    // ===== show % only for Paid bar =====
    if (seriesName === 'Paid' && data?.PaidPercentage !== undefined) {
      return `${formattedValue} (RR : ${data.PaidPercentage}%)`;
    }

    return formattedValue;
  };

  customizeLabelText(pointInfo: any) {
    const value = pointInfo.value;

    if (value === 0) {
      return ''; // Skip label for zero value
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} M`;
    } else if (value > 0) {
      return `${(value / 1000).toFixed(2)} K`;
    }
    return `${value}`; // Show as is if less than 1000
  }
  //================== custom tooltip =====================
  TotalcustomizeChartToolTip = (info: any) => {
    const total = Object.entries(info.point.data)
      .filter(([key, _]) => key !== 'MonthName')
      .reduce((sum, [_, value]) => sum + Number(value), 0);

    let formattedTotal = '';
    if (total >= 1_000_000) {
      formattedTotal = `${(total / 1_000_000).toFixed(2)} M`;
    } else if (total >= 1_000) {
      formattedTotal = `${(total / 1_000).toFixed(2)} K`;
    } else {
      formattedTotal = total.toFixed(2);
    }

    return {
      text: `Total: ${formattedTotal}`,
    };
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
      this[selectedvalues].includes(item.ID),
    );
    const nonSelectedItems = this[datsourceName].filter(
      (item) => !this[selectedvalues].includes(item.ID),
    );

    // Store only the selected IDs in the correct `*Newvalue`
    switch (selectedvalues) {
      case 'encountertypevalue':
        this.encountertypeNewvalue = selectedItems.map((item) => item.ID);
        break;
      case 'DepartmentValue':
        this.DepartmentNewValue = selectedItems.map((item) => item.ID);
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

  barChartcustomizeTooltip = (pointInfo: any) => {
    const data = pointInfo.point.data;

    return {
      text: `
        Recovery Rate: ${data.PaidPercentage}%
      `,
    };
  };

  //================== Log dashboard activity ==================
  logDashboardActivity(
    action: number,
    duration: string,
    payloadParams: any,
    exportFlag: number = 0,
  ) {
    const sessionID = sessionStorage.getItem('SessionID');

    const activityLogPayload: any = {
      sessionid: sessionID,
      action,
      dashboard: 'Finance Dashboard',
      duration: duration,
      export: exportFlag,
      FinanceParameter: payloadParams,
    };

    this.service.dashboard_activity_LogData(activityLogPayload).subscribe({
      next: () => console.log('Activity log saved with action:', action),
      error: (err) => console.error('Failed to save activity log', err),
    });
  }

  //===================== Apply Button Clicked ========================
  applyButtonClicked() {
    this.get_graph_DataSource(8); // Refreshed
  }

  onExportClick(e) {}

  //=================== PDF Export Function ====================
  export() {
    this.exportLoadingVisible = true;
    const exportDiv1 = document.querySelector('.ExportDiv1') as HTMLElement;
    const exportDiv2 = document.querySelector('.ExportDiv2') as HTMLElement;
    const exportDiv3 = document.querySelector('.ExportDiv3') as HTMLElement;
    const exportDiv4 = document.querySelector('.ExportDiv4') as HTMLElement;
    const reportName = 'Finance Dashboard';

    const start = performance.now();

    this.service
      .exportGraphData(reportName, [
        exportDiv1,
        exportDiv2,
        exportDiv3,
        exportDiv4,
      ])
      .then(() => {
        this.exportLoadingVisible = false;
        const end = performance.now();
        const duration = ((end - start) / 1000).toFixed(2);

        const payloadParams = {
          searchValue: this.searchOnvalue,
          dateFrom: this.dateForm.fromdate,
          dateTo: this.dateForm.todate,
          asOnDate: this.dateForm.AsOnDate,
          encounterType: this.encountertypeNewvalue.join(','),
          facility: this.facilityvalue.join(','),
          insurance: this.insuranceNewValue.join(','),
          department: this.DepartmentNewValue.join(','),
        };

        this.logDashboardActivity(8, duration, payloadParams, 1); // Closed + Export
      })
      .catch((error) => {
        this.exportLoadingVisible = false;
        console.error('Export failed:', error);
      });
  }

  //================== Excel Export Function ==================
  exportExcel() {
    console.log('excel export');
    this.showGroups = false;
    this.exportLoadingVisible = true;

    const { fromdate, todate, AsOnDate } = this.dateForm;

    this.service
      .get_Finance_Dashboard_Export_Data(
        this.searchOnvalue,
        fromdate,
        todate,
        AsOnDate,
        this.encountertypeNewvalue.join(','),
        this.facilityvalue.join(','),
        this.insuranceNewValue.join(','),
        this.DepartmentNewValue.join(','),
      )
      .subscribe((response: any) => {
        this.exportLoadingVisible = false;

        if (response && response.AgedReceivables && response.ClaimAnalysis) {
          this.service.exportToExcel(
            response.AgedReceivables,
            response.ClaimAnalysis,
            'ExportedFinanceDashboardData',
            'Aged Receivables',
            'Claim Analysis',
          );

          const payloadParams = {
            searchValue: this.searchOnvalue,
            dateFrom: fromdate,
            dateTo: todate,
            asOnDate: AsOnDate,
            encounterType: this.encountertypeNewvalue.join(','),
            facility: this.facilityvalue.join(','),
            insurance: this.insuranceNewValue.join(','),
            department: this.DepartmentNewValue.join(','),
          };

          const duration = '0'; // Optional: Calculate duration if needed
          this.logDashboardActivity(8, duration, payloadParams, 1); // Closed + Export
        } else {
          notify(`${response.message}`, 'error', 3000);
        }
      });
  }
}

@NgModule({
  imports: [
    CommonModule,
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
  declarations: [FinanceDashboardComponent],
  exports: [FinanceDashboardComponent],
})
export class FinanceDashboardModule {}
