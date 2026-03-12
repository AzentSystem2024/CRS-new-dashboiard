import { CommonModule, PercentPipe } from '@angular/common';
import {
  Component,
  HostListener,
  NgModule,
  OnDestroy,
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
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  DxTagBoxComponent,
  DxTagBoxTypes,
} from 'devextreme-angular/ui/tag-box';

@Component({
  selector: 'app-revenue-dashboard-page',
  templateUrl: './revenue-dashboard-page.component.html',
  styleUrls: ['./revenue-dashboard-page.component.scss'],
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
export class RevenueDashboardPageComponent implements OnInit, OnDestroy {
  @ViewChild('insuranceTagBox', { static: false })
  insuranceTagBox!: DxTagBoxComponent;

  @ViewChild(DxTreeViewComponent, { static: false })
  treeView: DxTreeViewComponent;

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

  loadingVisible: boolean = false;
  exportLoadingVisible: boolean = false;
  vibleExportBtn: boolean = true;
  SearchOnDatasource: any;
  searchOnvalue: any;
  facilityvalue: any[] = [];
  FacilityDataSource: any;
  insurancePopupVisible = false;
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
  insuranceDataSource: any;
  insuranceValue: any[] = [];
  insuranceNewValue: any[] = [];
  departmentDataSource: any;
  departmentValue: any[] = [];
  departmentNewValue: any[] = [];
  showGroups: boolean = true;
  caseWiseRevenueExport: boolean = false;

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

  // =======================Demo Chart DataSources===================
  RemittanceRejectionPercentDatasource: any;
  CaseTypeRejectionDataSource: any;
  DenialGroupdataSource: any;
  DenialCategoryRejectionDataSource: any;
  BlockWiseRejectionDataSource: any;
  RejectionAccountabilityDataSource: any;
  ToptenInsuranceRejectedDataSource: any;
  TopTenFacilityRejectedDataSource: any;
  TopTenCodeRejectedDataSource: any;
  TopTenDepartmentWiseRejectedDataSource: any;
  TopTenDoctorWiseRejectedDataSource: any;
  modifiedFacilityDatasource: any;
  dateForm = {
    fromdate: '',
    todate: '',
  };

  isloggedIn: any;
  ParamsUserId: any;
  chartInstance: any;
  isZoomedInChart1 = false;
  dashboardID: any;
  // insurancePopupVisible:boolean = false;
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
    private dataservice: DataService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  onChartInitialized(e) {
    this.chartInstance = e.component;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.get_initial_data();
    }, 500);
    this.draggableFunction('dragg1');
  }

  ngOnDestroy(): void {
    this.loadingVisible = false;
  }

  onInsuranceSelectionChanged(e: any) {
    console.log(e);
    this.insuranceSelectedItems = e.selectedRowsData;
    this.insuranceValue = e.selectedRowKeys;
    this.insuranceNewValue = this.insuranceValue.map((item: any) => item.ID);
  }

  handleInsuranceClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  openInsurancePopup() {
    this.insurancePopupVisible = true;

    if (this.insuranceDataSource1?.length > 0) {
      this.sortInsuranceDataSource();
      return;
    }

    const dashboardID = '6';
    const parameter = 'Payer';

    this.service
      .get_Parameter_List(dashboardID, parameter)
      .subscribe((res: any) => {
        this.insuranceDataSource1 = res.Parameters;
        this.sortInsuranceDataSource();
      });
  }

  private sortInsuranceDataSource() {
    const selectedIds = this.insuranceValue.map((item: any) => item.ID);
    const selectedSet = new Set(selectedIds);

    this.insuranceDataSource1 = [
      // Selected rows first in order of payerNewvalue
      ...this.insuranceValue,
      // Then remaining unselected rows
      ...this.insuranceDataSource1.filter(
        (item: any) => !selectedSet.has(item.ID),
      ),
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

  zoomChart(chartId: string): void {
    const allCharts = document.querySelectorAll('.ChartContent'); // Select all chart containers
    const targetChart = document.getElementById(chartId); // Get the chart to zoom

    if (!targetChart) {
      console.error(`Chart with ID '${chartId}' not found.`);
      return;
    }

    // Apply zoom-in effect to the target chart
    targetChart.classList.add('zoomed-in');

    this.caseWiseRevenueExport = true;
    this.isZoomedInChart1 = true;

    // Blur other charts
    allCharts.forEach((chart) => {
      if (chart.id !== chartId) {
        chart.classList.add('blurred');
      }
    });

    // Exit zoom when clicking outside
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.ChartContent')) {
        this.zoomOut(allCharts, targetChart);
        document.body.removeEventListener('click', handleOutsideClick);
        this.caseWiseRevenueExport = false;
        this.isZoomedInChart1 = false;
      }
    };

    document.body.addEventListener('click', handleOutsideClick);
  }

  // Function to handle zoom-out
  zoomOut(allCharts: NodeListOf<Element>, targetChart: HTMLElement): void {
    targetChart.classList.remove('zoomed-in');
    targetChart.querySelector('.close-button')?.remove();
    allCharts.forEach((chart) => chart.classList.remove('blurred'));
    this.caseWiseRevenueExport = false;
    this.isZoomedInChart1 = false;
  }

  draggableFunction(containerId: string): void {
    const container = document.getElementById(containerId); // Parent container (e.g., a row of items)
    if (!container) {
      console.error(`Container with ID '${containerId}' not found`);
      return;
    }

    const draggables = container.querySelectorAll('.ChartContent'); // Select only items within the current row
    if (!draggables.length) {
      console.error(
        `No draggable elements found in container '${containerId}'`,
      );
      return;
    }

    // Add dragstart event to each draggable item
    draggables.forEach((item) => {
      item.addEventListener('dragstart', (e: DragEvent) => {
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', (e.target as HTMLElement).id);
        }
      });
    });

    // Add dragover event to allow dropping within the current container
    container.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
    });

    // Add drop event to handle reordering within the same container
    container.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();

      const draggedId = e.dataTransfer?.getData('text/plain');
      const draggedElement = document.getElementById(draggedId || '');
      const targetElement = (e.target as HTMLElement).closest('.ChartContent'); // Ensure the correct item is targeted

      // Ensure both dragged and target elements belong to the same container
      if (
        draggedElement &&
        targetElement &&
        targetElement.id !== draggedElement.id &&
        container.contains(draggedElement) &&
        container.contains(targetElement)
      ) {
        const children = Array.from(container.children); // Get all children of the current container

        const draggedIndex = children.indexOf(draggedElement);
        const targetIndex = children.indexOf(targetElement);

        // Reorder elements based on drag direction
        if (draggedIndex < targetIndex) {
          container.insertBefore(draggedElement, targetElement.nextSibling);
        } else {
          container.insertBefore(draggedElement, targetElement);
        }
      }
    });
  }

  //tag-box

  onMultiTagEncounterTypePreparing(args: DxTagBoxTypes.MultiTagPreparingEvent) {
    const selectedItemsLength = args.selectedItems.length;
    console.log(selectedItemsLength, 'selectedItemsLength');
    const totalCount = this.EncountrTypeDatasource.length;
    console.log(totalCount, 'total count');

    if (selectedItemsLength < totalCount) {
      this.encountertypeNewvalue = this.encountertypevalue;
      args.cancel = true;
    } else {
      args.text = `All`;
      this.encountertypeNewvalue = [];
    }
  }

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
    console.log('hiiiiiiiiiiiiii');
    const selectedItemsLength = args.selectedItems.length;
    console.log(selectedItemsLength, 'selectedItemsLength');
    const totalCount = this.insuranceDataSource.length;
    console.log(totalCount, 'total count');

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

  //=========== reorder list options to selected data to the top side ========
  reorderDataSource(selectedvalues: string, datsourceName: string) {
    // Filter the selected items
    const selectedItems = this[datsourceName].filter((item) =>
      this[selectedvalues].includes(item.ID),
    );
    const nonSelectedItems = this[datsourceName].filter(
      (item) => !this[selectedvalues].includes(item.ID),
    );

    switch (selectedvalues) {
      case 'blockValue':
        this.blockNewValue = selectedItems.map((item) => item.ID);
        break;
      case 'encountertypevalue':
        this.encountertypeNewvalue = selectedItems.map((item) => item.ID);
        break;
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
      (row) => !selectedRowIds.includes(row.ID),
    );
    const reorderedData = [...selectedRows, ...unselectedRows];
    this[dataSourceKey] = this.makeAsyncDataSourceFromJson(reorderedData);
    console.log('Updated DataSource:', this[dataSourceKey]);
    this.dataGrid.instance.refresh();
  }

  // ======================== X-Axis value rotated and value custom==============
  formatXAxisText = (axisInfo: any): string => {
    const text = axisInfo.value;
    // const truncatedText = text.length > 14 ? text.slice(0, 14) : text;
    const parts = text.split(' ');
    const middleIndex = Math.ceil(parts.length / 2);
    const firstLine = parts.slice(0, middleIndex).join(' ');
    const secondLine = parts.slice(middleIndex).join(' ');
    return `${firstLine}\n${secondLine}`;
  };

  //===================Custom label for pie chart ===========
  customizeLabel(arg) {
    const value = arg.valueText;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M (${arg.percentText})`;
    } else {
      return `${(value / 1000).toFixed(2)}K (${arg.percentText})`;
    }
  }

  //=======Custom label for Million Values of chart ========
  MillioncustomizeLabel = (args: any): string => {
    const value = args.value;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} M`;
    } else if (value > 0) {
      return `${(value / 1000).toFixed(2)} K`;
    }
    return `${value}`; // Show as is if less than 1000
  };

  customizeTooltip = ({
    valueText,
    percent,
  }: {
    valueText: string;
    percent: number;
  }) => ({
    text: `${valueText} - ${this.pipe.transform(percent, '1.2-2')}`,
  });

  //======================top 10 insurance tooltip===================
  top10InsuranceDataCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.InsuranceName}`,
    };
  }
  //======================top 10 code tooltip===================
  top10CodeDataCustomizeTooltip(arg: any) {
    console.log('arg data', arg);
    return {
      text: `${arg.point.data.CPTName}`,
    };
  }
  //======================top 10 facility tooltip===================
  top10FacilityDataCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.FacilityName}`,
    };
  }

  //======================top 10 clinician tooltip===================
  top10ClinicianDataCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.ClinicianName}`,
    };
  }

  //======================top 10 department tooltip===================
  top10DepartmentDataCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Department}`,
    };
  }
  //======================Denial Category tooltip===================
  DenialCategoryDataCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Category}`,
    };
  }
  //======================Block Wise tooltip===================
  BlockWiseDataCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Block}`,
    };
  }
  //======================rejection acountability tooltip===================
  RejectionAccountabilityDataCustomizeTooltip(arg: any) {
    return {
      text: `${arg.point.data.Accountability}`,
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

  // Reuse this helper method in your component
  formatAmount(value: number): string {
    if (value < 1_000_000) {
      return (
        (value / 1_000).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' K'
      );
    } else {
      return (
        (value / 1_000_000).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
        ' M'
      );
    }
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
    this.service.getInitData(this.userId).subscribe((response: any) => {
      if (response) {
        this.SearchOnDatasource = response.SearchOn || [];
        this.EncountrTypeDatasource = response.EncounterType || [];
        this.RejectionIndexDatasource = response.RejectionIndex || [];
        this.DenailCategoryDatasource = response.DenialCategory || [];
        this.blockDataSource = response.Block || [];
        this.insuranceDataSource = response.Insurance || [];
        this.departmentDataSource = response.Department || [];
        this.FacilityDataSource = response.Facility || [];
        this.modifiedFacilityDatasource = this.makeAsyncDataSourceFromJson(
          response.Facility,
        );

        this.dateForm = {
          fromdate: response.DateFrom,
          todate: response.DateTo,
        };

        this.searchOnvalue =
          this.SearchOnDatasource.find((obj: any) => obj.Default === '1')?.ID ||
          ' ';
        this.rejectionIndexvalue =
          this.RejectionIndexDatasource.find((obj: any) => obj.Default === '1')
            ?.ID || ' ';
        this.denialcategoryvalue = this.DenailCategoryDatasource.filter(
          (item) => item.Default === '1',
        ).map((item) => item.ID);
        this.encountertypevalue = this.EncountrTypeDatasource.filter(
          (item) => item.Default === '1',
        ).map((item) => item.ID);
        this.blockValue =
          this.blockDataSource
            .filter((item) => item.Default === '1')
            .map((item) => item.ID) || '';
        this.facilityvalue = this.FacilityDataSource.filter(
          (item) => item.Default === '1',
        ).map((item) => item.ID);
        this.insuranceValue = this.insuranceDataSource
          .filter((item) => item.Default === '1')
          .map((item) => item.ID);
        this.departmentValue = this.departmentDataSource
          .filter((item) => item.Default === '1')
          .map((item) => item.ID);
      }
      this.get_graph_DataSource(1);
    });
  }

  //================== Fetch data of graph datasource ====================
  get_graph_DataSource(action: number = 1) {
    const startTime = performance.now();
    this.showGroups = false;
    this.loadingVisible = true;

    const { fromdate, todate } = this.dateForm;

    const payloadParams = {
      searchValue: this.searchOnvalue,
      dateFrom: fromdate,
      dateTo: todate,
      rejectionIndex: this.rejectionIndexvalue,
      encounterType: this.encountertypeNewvalue.join(','),
      block: this.blockNewValue.join(','),
      facility: this.facilityvalue.join(','),
      insurance: this.insuranceNewValue.join(','),
      department: this.departmentNewValue.join(','),
    };

    this.dataservice
      .get_Revenue_Home_Dashboard_Datasource(
        payloadParams.searchValue,
        payloadParams.dateFrom,
        payloadParams.dateTo,
        payloadParams.rejectionIndex,
        payloadParams.encounterType,
        payloadParams.block,
        payloadParams.facility,
        payloadParams.insurance,
        payloadParams.department,
      )
      .subscribe((response: any) => {
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        if (response.flag === '1') {
          const cardData = response.summary;

          this.ClaimAmount = this.formatAmount(cardData.ClaimedAmount);
          this.remittedAmt = this.formatAmount(cardData.RemittedAmount);
          this.remittedPercnt = cardData.RemittedPercent;
          this.paidAmt = this.formatAmount(cardData.PaidAmount);
          this.paidPrcnt = cardData.PaidPercent;
          this.deniedAmt = this.formatAmount(cardData.RejectedAmount);
          this.deniedPrcnt = cardData.RejectedPercent;
          this.balanceAmt = this.formatAmount(cardData.BalanceAmount);
          this.balancePrcnt = cardData.BalancePercent;
          this.remittancePrcnt = cardData.RemittedPercent;
          this.rejectionPrcnt = cardData.RejectedPercent;

          this.RemittanceRejectionPercentDatasource = response.MonthWise;
          this.CaseTypeRejectionDataSource = response.CaseWise;
          this.DenialGroupdataSource = response.GroupWise;
          this.DenialCategoryRejectionDataSource = response.CategoryWise;
          // this.BlockWiseRejectionDataSource = response.BlockWise;
          this.RejectionAccountabilityDataSource = response.AccountabilityWise;

          this.ToptenInsuranceRejectedDataSource = response.InsuranceWise.map(
            (insurance) => {
              if (!insurance.InsuranceShortName) {
                const nameParts = insurance.InsuranceName.split(' ');
                const shortName = nameParts.slice(0, 2).join(' ');
                return { ...insurance, InsuranceShortName: shortName };
              }
              return insurance;
            },
          );

          this.TopTenFacilityRejectedDataSource = response.FacilityWise;
          this.TopTenCodeRejectedDataSource = response.CodeWise;
          this.TopTenDepartmentWiseRejectedDataSource = response.DepartmentWise;
          this.TopTenDoctorWiseRejectedDataSource = response.ClinicianWise.map(
            (clinician) => {
              if (!clinician.ClinicianShortName && clinician.ClinicianName) {
                const nameParts = clinician.ClinicianName.trim().split(/\s+/);
                clinician.ClinicianShortName = nameParts.slice(0, 2).join(' ');
              }
              return clinician;
            },
          );
        } else {
          notify(`${response.message}`, 'error', 3000);
        }

        this.logDashboardActivity(action, duration, payloadParams, 0);
        this.loadingVisible = false;
      });
  }

  //================== Log dashboard activity ==================
  logDashboardActivity(
    action: number,
    duration: string,
    payloadParams: any,
    exportFlag: number = 0,
  ) {
    const sessionID = sessionStorage.getItem('SessionID');

    const activityLogPayload = {
      sessionid: sessionID,
      action,
      dashboard: 'Revenue Dashboard',
      duration,
      export: exportFlag,
      DenialParameter: payloadParams,
    };

    this.service.dashboard_activity_LogData(activityLogPayload).subscribe({
      next: () => console.log('Activity log saved with action:', action),
      error: (err) => console.error('Failed to save activity log', err),
    });
  }

  //===================== Apply Button Clicked ========================
  applyButtonClicked() {
    this.get_graph_DataSource(8);
  }

  //=================== PDF Export Function ====================
  export() {
    this.exportLoadingVisible = true;
    const exportDiv1 = document.querySelector('.ExportDiv1') as HTMLElement;
    const exportDiv2 = document.querySelector('.ExportDiv2') as HTMLElement;
    const reportName = 'Revenue Dashboard';
    const start = performance.now();

    this.service
      .exportGraphData(reportName, [exportDiv1, exportDiv2])
      .then(() => {
        this.exportLoadingVisible = false;
        const end = performance.now();
        const duration = ((end - start) / 1000).toFixed(2);

        const payloadParams = {
          searchValue: this.searchOnvalue,
          dateFrom: this.dateForm.fromdate,
          dateTo: this.dateForm.todate,
          rejectionIndex: this.rejectionIndexvalue,
          encounterType: this.encountertypeNewvalue.join(','),
          block: this.blockNewValue.join(','),
          facility: this.facilityvalue.join(','),
          insurance: this.insuranceNewValue.join(','),
          department: this.departmentNewValue.join(','),
        };

        this.logDashboardActivity(8, duration, payloadParams, 1);
      })
      .catch((error) => {
        this.exportLoadingVisible = false;
        console.error('Export failed:', error);
      });
  }

  onExportClick(e: any) {}

  //================== Excel Export Function ==================
  exportExcel() {
    console.log('excel export');
    this.showGroups = false;
    this.exportLoadingVisible = true;

    const { fromdate, todate } = this.dateForm;

    this.service
      .get_Revenue_Dashboard_Export_Data(
        this.searchOnvalue,
        fromdate,
        todate,
        this.rejectionIndexvalue,
        this.encountertypeNewvalue.join(','),
        this.blockNewValue.join(','),
        this.facilityvalue.join(','),
        this.insuranceNewValue.join(','),
        this.departmentNewValue.join(','),
      )
      .subscribe((response: any) => {
        this.exportLoadingVisible = false;

        if (response && response.data) {
          this.service.PriorexportToExcel(
            response.data,
            'ExportedRevenueDashboardData',
            'data',
          );

          const payloadParams = {
            searchValue: this.searchOnvalue,
            dateFrom: fromdate,
            dateTo: todate,
            rejectionIndex: this.rejectionIndexvalue,
            encounterType: this.encountertypeNewvalue.join(','),
            block: this.blockNewValue.join(','),
            facility: this.facilityvalue.join(','),
            insurance: this.insuranceNewValue.join(','),
            department: this.departmentNewValue.join(','),
          };

          const duration = '0';
          this.logDashboardActivity(8, duration, payloadParams, 1);
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
  declarations: [RevenueDashboardPageComponent],
  exports: [RevenueDashboardPageComponent],
})
export class RevenueDashboardPageModule {}
