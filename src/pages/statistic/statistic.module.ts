import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StatisticPage } from './statistic';
import { StatisticDetailPage } from './statistic-detail/statistic-detail';
import { PopoverPage } from './popover/popover';
@NgModule({
  declarations: [
    StatisticPage, StatisticDetailPage, PopoverPage
  ],
  imports: [

    IonicPageModule.forChild(StatisticPage),
  ],
  exports: [
    StatisticPage, StatisticDetailPage
  ],
  entryComponents: [StatisticDetailPage, PopoverPage],
})
export class StatisticPageModule {}
