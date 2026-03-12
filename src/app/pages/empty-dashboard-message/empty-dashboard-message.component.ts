import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'app-empty-dashboard-message',
  templateUrl: './empty-dashboard-message.component.html',
  styleUrls: ['./empty-dashboard-message.component.scss'],
})
export class EmptyDashboardMessageComponent {}
@NgModule({
  imports: [CommonModule],
  declarations: [EmptyDashboardMessageComponent],
  exports: [EmptyDashboardMessageComponent],
})
export class EmptyDashboardMessageModule {}
