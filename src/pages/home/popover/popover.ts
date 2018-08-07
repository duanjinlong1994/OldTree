import { Component } from '@angular/core';
import {App, IonicPage, ViewController, NavParams} from 'ionic-angular';
import { UserInfoPage } from'../user-info/user-info';
import { TaskPage } from'../../task/task';
import { TakePhotoPage } from '../../upload/take-photo/take-photo';
import { StatisticOfHomePage} from '../statistic-of-home/statistic-of-home'

/**
 * Generated class for the PopoverPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-popover',
    templateUrl: 'popover.html'
})
export class PopoverPage {

    // organizationId: number = -1;
    // projectId:number = -1;
    //
    // organData:Array<Object> = [];
    // projectData:Array<Object>;
    // collectionData:Array<Object>;

    constructor(private navParams: NavParams,
                public app:App,
                public viewCtrl: ViewController) {

        // this.organizationId = this.navParams.get('organizationId');
        // this.organData = this.navParams.get('organData');
        //
        // this.projectId = this.navParams.get('projectId');
        // this.projectData = this.navParams.get('projectData');
        //
        // this.collectionData=this.navParams.get('collectionData');

    }

    ngOnInit() {

    }




    SelectPageChanged(pageName :string){
        console.log(pageName);
        if(pageName==="UserInfoPage") {
            this.viewCtrl.dismiss();
            this.app.getRootNav().push(UserInfoPage);
        }
        else if(pageName==="TaskPage") {
            this.viewCtrl.dismiss();
            this.app.getRootNav().push(TaskPage);
        }
        else if(pageName==="TakePhotoPage") {
            this.viewCtrl.dismiss();
            this.app.getRootNav().push(TakePhotoPage,{
                // isPopoverToUpload:true,
                // organizationId:this.organizationId,
                // organData:this.organData,
                // projectId:this.projectId,
                // projectData:this.projectData,
                // collectionData:this.collectionData,
            });
        }
        else if(pageName==="StatisticPage") {
            this.viewCtrl.dismiss();
            this.app.getRootNav().push(StatisticOfHomePage);
        }
    }
}


