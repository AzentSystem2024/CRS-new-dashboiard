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
  DxTreeViewComponent,
  DxPopupModule,
  DxTreeMapModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import { trigger, transition, style, animate } from '@angular/animations';
import { DxTagBoxTypes } from 'devextreme-angular/ui/tag-box';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-e&m-dashboard-page',
  templateUrl: './e&m-dashboard-page.component.html',
  styleUrls: ['./e&m-dashboard-page.component.scss'],
  providers: [DataService],
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
export class EandMDashboardPageComponent implements OnInit {
  @ViewChild('clinicianTagBox', { static: false }) clinicianTagBox: any;

  @ViewChild(DxTreeViewComponent, { static: false })
  treeView: DxTreeViewComponent;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  @HostListener('window:resize')
  onResize() {
    this.chartSize = { width: window.innerWidth * 0.008 };

    if (this.chartInstance) {
      this.chartInstance.option('size', { width: this.chartSize.width });
    }
  }
  chartSize = { width: window.innerWidth * 0.44 };
  clinicianPopupVisible = false;
  pipe = new PercentPipe('en-US');

  loadingVisible: boolean = false;
  exportLoadingVisible: boolean = false;
  vibleExportBtn: boolean = true;
  searchOnvalue: any = '';
  facilityvalue: any[] = [];
  FacilityDataSource: any;

  EncountrTypeDatasource: any;
  DenailCategoryDatasource: any;
  denialcategoryvalue: any[] = [];
  encountertypevalue: any[] = [];
  encountertypeNewvalue: any[] = [];
  DateFrom: any = new Date();
  DateTo: any = new Date();
  RejectionIndexDatasource: any;
  rejectionIndexvalue: any;
  blockDataSource: any;
  blockValue: any[] = [];
  blockNewValue: any[] = [];
  regionDataSource: any;
  RegionValue: any[] = [];
  ProviderTypeDatasource: any;
  ProviderTypevalue: any[] = [];
  clinicianDataSource: any;
  clinicianValue: any[] = [];
  clinicianNewValue: any[] = [];
  departmentDataSource: any;
  departmentValue: any[] = [];
  departmentNewValue: any[] = [];
  showGroups: boolean = true;

  //=================card data variables=====================
  ClaimsmrydataObj: any;
  claimData: any;
  //====================Variables for card data=================
  ClaimAmount: any = 0;
  claimPrcnt: any = 100;
  remittedAmt: any = 0;
  remittedPercnt: any = 0;
  paidAmt: any = 0;
  paidPrcnt: any = 0;
  deniedAmt: any = 0;
  deniedPrcnt: any = 0;
  balanceAmt: any = 0;
  balancePrcnt: any = 0;

  remittancePrcnt: any = 0;
  rejectionPrcnt: any = 0;
  userId: any;

  BlockWiseRejectionDataSource: any;
  modifiedFacilityDatasource: any;
  dateForm = {
    fromdate: '',
    todate: '',
  };

  // ===== chart datasource variables ===============
  OverallENMLevelsDatasource: any;
  OverallENMMonthsDatasource: any;
  TopTenDiagnosisContribution: any[];
  DepartmentDatasource: any[];
  RealizabilityEnmDatasource: any[];

  algorithms: any = ['squarified'];

  categoryDatasource: any;
  categoryValue: any;
  levelDatasource: any;
  levelValue: any;
  selectedLevelName: any;

  isloggedIn: any;
  ParamsUserId: any;
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

  displayMode: any = 'full';
  showPageSizeSelector = true;

  clinicianDataSource1: any;

  clinicianSelectedItems: any[] = [];
  customMultiTagText: string = '';
  constructor(
    public service: DataService,
    private dataservice: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const dashboardID = '8';
    const parameter = 'Clinician';

    this.clinicianDataSource1 = new DataSource<any>({
      load: () =>
        new Promise((resolve, reject) => {
          this.service.get_Parameter_List(dashboardID, parameter).subscribe({
            next: (response: any) => {
              const allPayers = response?.Parameters ?? [];
              const sorted = this.sortClinicianDataSource(allPayers);
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

  // // ========== level dropdown value change event ========
  // onLevelChange(event: any): void {
  //   const selectedId = event.value;
  //   const selectedItem = this.levelDatasource.find(
  //     (item) => item.ID === selectedId
  //   );
  //   this.selectedLevelName = selectedItem ? selectedItem.Name : '';
  // }

  onClinicianSelectionChanged(e: any) {
    console.log(e);
    this.clinicianSelectedItems = e.selectedRowsData;
    this.clinicianValue = e.selectedRowKeys;
    this.clinicianNewValue = this.clinicianValue.map((item) => item.ID);
  }

  onInsuranceDropdownOpened() {
    this.clinicianPopupVisible = true;
  }

  openClinicianPopup() {
    this.clinicianPopupVisible = true;
  }

  handleClinicianClick(event: MouseEvent) {
    // Prevent the dropdown from opening
    event.preventDefault();
    event.stopPropagation();
    this.openClinicianPopup();
  }

  private sortClinicianDataSource(allPayers: any[]) {
    const selectedIds = this.clinicianValue?.map((item: any) => item.ID) || [];
    const selectedSet = new Set(selectedIds);

    return [
      // Selected payers first
      ...(this.clinicianValue || []),
      // Remaining payers
      ...allPayers.filter((item: any) => !selectedSet.has(item.ID)),
    ];
  }
  getClinicianTooltip(): string {
    if (
      !this.clinicianSelectedItems ||
      this.clinicianSelectedItems.length === 0
    ) {
      return '';
    }

    return this.clinicianSelectedItems.map((item: any) => item.Name).join(', ');
  }

  onClinicianValueChanged(e: any) {
    const selectedIDs = e.value || [];

    //Update the selected items based on selected IDs
    this.clinicianValue = this.clinicianSelectedItems.filter((item: any) =>
      selectedIDs.includes(item.ID)
    );

    this.clinicianNewValue = selectedIDs;
  }

  onChartInitialized(e) {
    this.chartInstance = e.component; // Store reference to the chart
  }

  customizeChartPoint = (pointInfo: any) => {
    const levelColors: { [key: string]: string } = {
      'Level-1': '#1DB2F5',
      'Level-2': '#F5564A',
      'Level-3': '#97C95C',
      'Level-4': '#FFC720',
      'Level-5': '#EB3573',
    };

    return {
      color: levelColors[pointInfo.argument] || '#CCCCCC', // fallback color
    };
  };

  onMultiTagBlockPreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    console.log(selectedItemsLength, 'selectedItemsLength');
    const totalCount = this.BlockWiseRejectionDataSource.length;
    console.log(totalCount, 'total count');

    if (selectedItemsLength < totalCount) {
      this.blockNewValue = this.blockValue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.blockNewValue = [];
    }
  }

  onMultiTagDepartmentPreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    console.log(selectedItemsLength, 'selectedItemsLength');
    const totalCount = this.departmentDataSource.length;
    console.log(totalCount, 'total count');

    if (selectedItemsLength < totalCount) {
      this.departmentNewValue = this.departmentValue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.departmentNewValue = [];
    }
  }

  onMultiTagInsurancePreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    console.log(selectedItemsLength, 'selectedItemsLength');
    const totalCount = this.clinicianDataSource.length;
    console.log(totalCount, 'total count');

    if (selectedItemsLength < totalCount) {
      this.clinicianNewValue = this.clinicianValue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.clinicianNewValue = [];
    }
  }

  //===========show filter div by clicking showing div========
  Show_toggle_Groups_By_Div_click(): void {
    this.showGroups = true;
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
      case 'departmentValue':
        this.departmentNewValue = selectedItems.map((item) => item.ID);
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

  // ======================== X-Axis value rotated and value custom==============
  formatXAxisText = (axisInfo: any): string => {
    let text = axisInfo.value;

    // Artificial padding for short labels (not recommended for real UX)
    if (text.length < 10) {
      text = text.padEnd(10, ' ');
    }

    const parts = text.split(' ');
    const middleIndex = Math.ceil(parts.length / 2);
    const firstLine = parts.slice(0, middleIndex).join(' ');
    const secondLine = parts.slice(middleIndex).join(' ');

    return `${firstLine}\n${secondLine}`;
  };
  //===================Custom label for pie chart ===========
  customizeLabel = (pointInfo: any) => {
    return `${pointInfo.valueText}%`;
  };

  customizeLabelText(e: any) {
    return `${e.value}%`;
  }
  PieChartcustomizeLabel(arg) {
    const value = arg.valueText;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M (${arg.percentText})`;
    } else {
      return `${(value / 1000).toFixed(2)}K (${arg.percentText})`;
    }
  }

  //======= Custom label for Million Values of chart ========
  MillioncustomizeLabel = (args: any): string => {
    const value = args.value;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} M`;
    } else if (value > 0) {
      return `${(value / 1000).toFixed(2)} K`;
    }
    return `${value}`; // Show as is if less than 1000
  };
  // =================== customise tooltio =================
  diagnosiscustomizeTooltip = (arg: any) => {
    const formattedValue = new Intl.NumberFormat('en-US').format(arg.value);
    return {
      text: `${arg.node.data.Diagnosis}: ${formattedValue}`,
    };
  };

  // =====department data tooltip =====================
  DepartmentCustomizeTooltip = (info: any) => {
    const data = info.point.data;
    let count = 0;

    switch (info.seriesName) {
      case 'Level 2':
        count = data.Level2Count;
        break;
      case 'Level 3':
        count = data.Level3Count;
        break;
      case 'Level 4':
        count = data.Level4Count;
        break;
      case 'Level 5':
        count = data.Level5Count;
        break;
    }

    return {
      text: `<b>${info.seriesName}</b><br>Count: ${count}<br>Percent: ${info.value}%`,
    };
  };

  //======================top 10 insurance tooltip===================
  DailyFootFallCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.MonthName}`,
    };
  }
  //======================top 10 facility tooltip===================
  OPFootFallBasedCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Time}`,
    };
  }
  //======================top 10 code tooltip===================
  ERFootFallBasedCustomizeTooltip(arg: any) {
    console.log('arg data', arg);
    return {
      text: `${arg.point.data.Time}`,
    };
  }

  //======================top Performing Doctor tooltip===================
  topPerformingDoctorCustomizeTooltip(arg: any) {
    console.log('arg data', arg);
    return {
      text: `${arg.point.data.ClinicianName}`,
    };
  }

  //======================top 10 clinician tooltip===================
  topPerformingDepartmentCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Department}`,
    };
  }
  //======================Denial Category tooltip===================
  topFootFallDepartmentCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Department}`,
    };
  }

  toggleGroups(): void {
    this.showGroups = !this.showGroups;
  }

  customTagTemplate = (itemData: any) => {
    return `<span>${itemData.Name}</span>`;
  };

  //==================MAking cutom datasource for facility datagrid and dropdown loADING=======
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

  //===============Format the date fetch from date picker of ui ==================
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().substr(-4);
    return `${year}/${month}/${day}`;
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
      .get_EnM_Dashboard_InitData(this.userId)
      .subscribe((response: any) => {
        if (response) {
          this.clinicianDataSource = response.Cliniician;
          this.departmentDataSource = response.Department;
          this.FacilityDataSource = response.Facility;
          this.categoryDatasource = response.EnmCategory;
          this.levelDatasource = response.EnmLevel;
          this.modifiedFacilityDatasource = this.makeAsyncDataSourceFromJson(
            response.Facility
          );

          this.dateForm.fromdate = response.DateFrom;
          this.dateForm.todate = response.DateTo;

          this.facilityvalue = this.FacilityDataSource.filter(
            (item) => item.Default === '1'
          ).map((item) => item.ID);
          this.clinicianValue = this.clinicianDataSource
            .filter((item) => item.Default === '1')
            .map((item) => item.ID);
          this.departmentValue = this.departmentDataSource
            .filter((item) => item.Default === '1')
            .map((item) => item.ID);
          this.categoryValue =
            this.categoryDatasource.find((item) => item.Default === '1')?.ID ||
            '';
          this.levelValue =
            this.levelDatasource.find((item) => item.Default === '1')?.ID || '';
        }

        this.get_graph_DataSource(1); // Opened
      });
  }

  //================== Fetch data of graph datasource ====================
  get_graph_DataSource(action: number = 1) {
    const startTime = performance.now();
    this.showGroups = false;
    this.loadingVisible = true;

    this.DateFrom = this.dateForm.fromdate;
    this.DateTo = this.dateForm.todate;

    const payloadParams = {
      dateFrom: this.DateFrom,
      dateTo: this.DateTo,
      facility: this.facilityvalue.join(','),
      clinician: this.clinicianNewValue.join(','),
      department: this.departmentNewValue.join(','),
      category: this.categoryValue ?? '',
      level: this.levelValue ?? '',
    };

    this.dataservice
      .get_EnM_Home_Dashboard_Datasource(
        payloadParams.dateFrom,
        payloadParams.dateTo,
        payloadParams.facility,
        payloadParams.clinician,
        payloadParams.department,
        payloadParams.category,
        payloadParams.level
      )
      .subscribe({
        next: (response: any) => {
          const endTime = performance.now();
          const duration = ((endTime - startTime) / 1000).toFixed(2);

          if (response.flag === '1') {
            const selectedItem = this.levelDatasource.find(
              (item) => item.ID === this.levelValue
            );
            this.selectedLevelName = selectedItem ? selectedItem.Name : '';

            this.OverallENMLevelsDatasource = response.OverallENMLevels;
            this.OverallENMMonthsDatasource = response.OverallENMMonths;
            this.DepartmentDatasource = response.DeptWiseEnm;
            this.RealizabilityEnmDatasource = response.RealizabilityEnm;
            this.TopTenDiagnosisContribution = response.DiagnosisEnm;
          } else {
            notify(`${response.message}`, 'error', 3000);
          }

          this.logDashboardActivity(action, duration, payloadParams, 0);
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
      dashboard: 'E&M Dashboard',
      duration,
      export: exportFlag,
      EnMParameter: payloadParams,
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
    const exportDiv5 = document.querySelector('.ExportDiv5') as HTMLElement;
    const exportDiv6 = document.querySelector('.ExportDiv6') as HTMLElement;
    const reportName = 'E&M Dashboard';

    const start = performance.now();

    this.service
      .exportGraphData(reportName, [
        exportDiv1,
        exportDiv2,
        exportDiv3,
        exportDiv4,
        exportDiv5,
        exportDiv6,
      ])
      .then(() => {
        this.exportLoadingVisible = false;
        const end = performance.now();
        const duration = ((end - start) / 1000).toFixed(2);

        const payloadParams = {
          dateFrom: this.dateForm.fromdate,
          dateTo: this.dateForm.todate,
          facility: this.facilityvalue.join(','),
          clinician: this.clinicianNewValue.join(','),
          department: this.departmentNewValue.join(','),
          category: this.categoryValue ?? '',
          level: this.levelValue ?? '',
        };

        this.logDashboardActivity(8, duration, payloadParams, 1); // Export
      })
      .catch((error) => {
        this.exportLoadingVisible = false;
        console.error('Export failed:', error);
      });
  }

  //================== Excel Export Function ==================
  exportExcel() {
    this.exportLoadingVisible = true;
    this.showGroups = false;

    this.service
      .get_EAndM_Dashboard_Export_Data(
        this.searchOnvalue,
        this.dateForm.fromdate,
        this.dateForm.todate,
        this.rejectionIndexvalue,
        this.encountertypeNewvalue.join(','),
        this.blockNewValue.join(','),
        this.facilityvalue.join(','),
        this.clinicianNewValue.join(','),
        this.departmentNewValue.join(',')
      )
      .subscribe((response: any) => {
        this.exportLoadingVisible = false;

        if (response && response.data) {
          this.service.PriorexportToExcel(
            response.data,
            'ExportedE&MDashboardData',
            'data'
          );

          const payloadParams = {
            dateFrom: this.dateForm.fromdate,
            dateTo: this.dateForm.todate,
            facility: this.facilityvalue.join(','),
            clinician: this.clinicianNewValue.join(','),
            department: this.departmentNewValue.join(','),
            category: this.categoryValue ?? '',
            level: this.levelValue ?? '',
          };

          this.logDashboardActivity(8, '0', payloadParams, 1); // Export
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
    DxTreeMapModule,
  ],
  declarations: [EandMDashboardPageComponent],
  exports: [EandMDashboardPageComponent],
})
export class CeoDashboardPageModule {}
