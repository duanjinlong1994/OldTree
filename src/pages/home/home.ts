import { Component, Output, EventEmitter, OnInit ,} from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ToastController, App, Events ,PopoverController} from 'ionic-angular';
import { Http, Headers, RequestOptions } from "@angular/http";
import { HttpService } from '../../providers/http-service/http-service';
import { MapPage } from './map/map';
import { Storage} from '@ionic/storage';
import { DevicePage } from './device/device';
import { UserInfoPage } from './user-info/user-info';
import { StatisticOfHomePage } from './statistic-of-home/statistic-of-home';
import { AccountService } from '../../providers/account-service/account-service';
import { TakePhotoPage } from '../upload/take-photo/take-photo';
import { TreeDetailPage } from '../tree-detail/tree-detail';
import { TaskPage } from '../task/task';
import { OrganizationServiceProvider } from "../../providers/organization-service/organization-service";
import { PopoverPage } from './popover/popover'
import 'rxjs/add/operator/map';

/**
 * Generated class for the HomePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [OrganizationServiceProvider]
})
export class HomePage implements OnInit{

    @Output() organizationOut = new EventEmitter();
    @Output() projectOut = new EventEmitter();
    organization:string;
    project:string;
    organData:Array<Object> = [];
    projectData:Array<Object> = [];
    collectionData:Array<Object> = [];
    attentionPoints:Array<Object> = [];//关注采集点列表

    organizationId: any=0;
    organizationName: string="选择网格";
    projectName: string="选择古树";
    projectId:any=0;
    isisis:any=0;
    projectlevel:string="";
    sitename:string="";
    prjId: any=0;
    prjName: any="";
    collectionId: any=0;
    collectionName: string="选择采集点";
    OldTreeData:Array<Object> = [];      //古树信息
    OldTreeData1:Array<Object> = [];      //古树信息
    chooseTreeData:Array<Object> = [];
    chooseTreeNum:any="- -";
    chooseTreeName:any="- -";
    chooseTreelevel:any="- - -";
    showCollectionPoint:boolean = false;
    icon:string;
    isAttention:boolean = false;

    isTaskToStatistic:boolean = false;
    showNoise:boolean = false;
    showWaterlevel:boolean = false;
    showOldTree:boolean = false;
    showAll:boolean = false;
    isOrganchoose:boolean = false;
    ischoosefirst:boolean = false;
    ischoosesencond:boolean = false;
    isProject:boolean = false;
    isCollectionPoint:boolean = false;
    ischooseitem:boolean = false;
    pageSize: number = 0;
    pageNum: number = 0;
    pageOther: number = 0;
    isScroll: boolean = true;
    //noinspection TypeScriptUnresolvedVariable



    collectionPointShow: string = "noise";

    title:string = "";
    accountId: number = -1;

    // 测试树形结构

    menu:Array<object> = [];


    constructor(public navParams: NavParams,
                public app: App,
                public menuCtrl: MenuController,
                public nav: NavController,
                public http: Http,
                public events: Events,
                public storage: Storage,
                public organService: OrganizationServiceProvider,
                private toastCtrl: ToastController,
                public httpService: HttpService,
                private accountService: AccountService,
                public popoverCtrl: PopoverController,
    ){
        // 订阅组织机构选中事件
      events.subscribe('organ:select',item => {
        console.log("订阅事件");
      //   console.log(item);
        this.organization = item.id;
   //     this.organChange();
      });
    }


    //初始化数据
    setUp() {
        this.OldTreeData = [];   //古树

        this.showNoise = this.accountService.getSysType() == 0? true:false;
        this.showWaterlevel = this.accountService.getSysType() == 1? true:false;
        this.showOldTree = this.accountService.getSysType() == 2? true:false;   //假设古树的项目类型为2
        this.showAll = this.accountService.getSysType() == 3? true:false;

        console.log("showNoise"+this.showNoise)

        if(this.showOldTree){
            this.collectionPointShow="OldTree";
        }
    }
    //
    // doRefresh(refresher) {
    //     setTimeout(() => {
    //         this.getOrganization();
    //         console.log('Async operation has ended');
    //         refresher.complete();
    //     }, 2000);
    // }

    doInfinite(infiniteScroll){
        console.log('Begin async operation');

        setTimeout(()=>{
            this.pageNum++;
            console.log(this.pageNum);
            if(this.pageNum<this.pageSize){
                for(var i = 0;i<10;i++){
                    this.OldTreeData.push(this.OldTreeData1[i+this.pageNum*10]);
                }
            }else if(this.pageNum==this.pageSize){
                for(var i = 0;i<this.pageOther;i++){
                    this.OldTreeData.push(this.OldTreeData1[i+this.pageNum*10]);
                }
            }else{
                infiniteScroll.enable(false);
            }

            console.log('Async operation has ended');
            infiniteScroll.complete();
        },500);
    }

    private popToastView(message: string, duration: number){
        this.toastCtrl.create({
            message : message,
            duration : duration,
            position : 'bottom',
            dismissOnPageChange : true,
        }).present();
    }

    ischoose(num) {
        console.log("ischoose : "+num);
        if(num == "0"){
            if(this.isProject){
                this.isProject = !this.isProject;
            }
            if(this.isCollectionPoint){
                this.isCollectionPoint = !this.isCollectionPoint;
            }
            this.isOrganchoose = !this.isOrganchoose;
        }else if(num == "1"){
            if(this.isOrganchoose){
                this.isOrganchoose = !this.isOrganchoose;
            }
            if(this.isCollectionPoint){
                this.isCollectionPoint = !this.isCollectionPoint;
            }
            if(this.ischoosefirst){
                this.isProject = !this.isProject;
            }
        }else if(num == "2"){
            if(this.isProject){
                this.isProject = !this.isProject;
            }
            if(this.isOrganchoose){
                this.isOrganchoose = !this.isOrganchoose;
            }
            if(this.ischoosefirst&&this.ischoosesencond){
                this.isCollectionPoint = !this.isCollectionPoint;
            }
        }
    }

    getOrganization() {
        let organizationId = (this.accountService.getAccount() as any).role['organizationId'];
        let url = this.httpService.getUrl()+"/getOrganizationTreeDataForApp.do";
        let body= "organizationId="+organizationId;

        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'
        });
        let options = new RequestOptions({
            headers: headers
        });
        this.http.post(url,body,options).map(res =>res.json()).subscribe(data => {
            this.organData.push(data);
            if(data.length != 0) {

                this.menu = [];
            }
            this.menu.push(data);

            if(typeof((this.accountService.getAccount() as any).accountId) !="undefined"){
                this.accountId = (this.accountService.getAccount() as any).accountId;
                this.selectAccountAttentionPoints(this.accountId);
            }

        });
        this.getOrgan(1,1);
    }

    ionViewDidLoad() {
        this.setUp();
        this.title = "选择操作";
        this.icon = "ios-heart-outline";
        console.log(this.navParams.data);

        this.getOrganization();
    }


    openMenu(): void{
        this.menuCtrl.open();
    }

    changeUserInfo(){
        //使用getRootNav方法可以去掉子页面的tabs

        this.app.getRootNav().push(UserInfoPage);
    }

    ngOnInit() {

    }

    selectOrgan(item) {

        // this.organization = (this.organService.getSelectedOrganization() as any).id;
        // this.organChange();
    }

    organChange(organid,organame) {

        //this.organizationId = organid;
        if(organid == "000" && organame =="全部"){
            this.getOrgan(1,1);
            this.isOrganchoose = false;
            this.ischoosefirst = false;
            this.isProject = false;
            this.prjId = "";
            this.chooseTreeNum = "- -";
            this.chooseTreeName = "- -";
            this.chooseTreeData = [];
            this.chooseTreelevel = "- - -";
            this.showCollectionPoint = false;
            this.organizationName = "全部";
            this.projectName = "选择古树";
            this.collectionName = "选择采集点";
        }

        else{
            let url = this.httpService.getUrl()+"/getTreeListByOrgIdForApp.do";
            let headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            });
            let body = "organizationId="+organid;
            let options = new RequestOptions({
                headers: headers
            });

            this.http.post(url,body,options).map(res => res.json()).subscribe(data =>{
                console.log("organchange:");
                console.log(data);
                this.projectData = data;
            });
            this.organizationName = organame;
            this.organization = organid;
            this.isOrganchoose = false;
            this.ischoosefirst = true;
            this.isProject = true;
        }


    }
    getOrgan(organid,num){
        let url = this.httpService.getUrl()+"/getTreeListByOrgIdForApp.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "organizationId="+organid;
        let options = new RequestOptions({
            headers: headers
        });

        this.http.post(url,body,options).map(res => res.json()).subscribe(data =>{
            console.log("OldTreeData:");
            this.pageSize = data.length / 10;
            this.pageOther = data.length % 10;
            console.log("OldTreeData : "+data);
            console.log("pageSize:"+this.pageSize+"pageOther"+this.pageOther);
            // if(num <= this.pageSize){
            //    for(var i = num*10;i<num*10+10;i++){
            //         this.OldTreeData.push(data[i]);
            //     }
            //     console.log(this.OldTreeData);
            // }
            // else{
            //     for(var i = num*10;i<num*10+this.pageOther;i++){
            //         this.OldTreeData.push(data[i]);
            //     }
            //     console.log(this.OldTreeData);
            // }

            // console.log("OldTreeData(1-6):");
            // for(var j = 0;j<45;j++){
            //     console.log(data[j]);
            //  }
            this.OldTreeData1 = data;
            
            for(var i = 0;i<10;i++){
                this.OldTreeData.push(this.OldTreeData1[i]);
            }

        });
    }

    projectChange(projectid,projectname) {

        let url = this.httpService.getUrl()+"/getDataPointListByProjectId.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "projectId="+projectid;
        let options = new RequestOptions({
            headers: headers
        });
        this.http.post(url,body,options).map(res => res.json()).subscribe(data =>{
            // console.log(data);
            this.collectionData = data;
            console.log("2");
            if(this.collectionData.length == 0){
                console.log("collectionData=null"+this.collectionData);
                this.projectName = projectname;
                this.QueryOfHome(projectid);
                this.collectionName = "无";
                this.isProject = false;
                this.isCollectionPoint = false;
            }
            else{
                this.projectId = projectid;
                this.projectName = projectname;
                this.prjName = "--" + this.projectName;
                this.projectlevel = data.level;
                this.isProject = false;
                this.isCollectionPoint = true;
                this.ischoosesencond = true;
            }
        });

        // this.projectName = projectname;
        // this.isProject = false;
        // this.isCollectionPoint = true;
        //console.log("1");
        /*     if(this.collectionData.length == 0){
         console.log("collectionData=null"+this.collectionData);
         this.QueryOfHome(projectid);
         this.collectionName = "无";
         this.isCollectionPoint = false;
         }*/
    }

    collectionChange(collectid,collectname){
        this.QueryOfHome(collectid);
        this.collectionName = collectname;
        this.isCollectionPoint = false;
    }

    QueryOfHome(collectid) {

        //this.projectOut.emit(this.project);
        this.setUp();
        let url = this.httpService.getUrl()+"/getDataPointListByProjectId.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "projectId="+collectid;
        let options = new RequestOptions({
            headers: headers
        });

        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{

            this.showCollectionPoint = true;
            this.collectionData = data;
            this.sitename = data.siteName;
            this.project = collectid;
            console.log("collectionData"+this.collectionData);

            for (let i = 0; i < this.collectionData.length; i ++){
                // console.log(this.collectionData[i].deviceId);
                console.log("123123");
                this.getDeviceTypeById((this.collectionData[i] as any).deviceId,i);
            }
            console.log("this.OldTreeData1"+this.OldTreeData);
        });
    }

    getMessage(item){
        this.chooseTreeData = item;
        this.chooseTreeNum=this.projectId;
        this.chooseTreeName=this.projectName;
        this.chooseTreelevel=this.projectlevel;
        this.ischooseitem = !this.ischooseitem;
        this.isisis = item.treeid;
        console.log(item);
    }

    getDeviceTypeById(Id,i){
        let url = this.httpService.getUrl()+"/getDeviceByIdForApp.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "deviceId="+Id;
        let options = new RequestOptions({
            headers: headers
        });

        this.http.post(url,body,options).map(res =>res.json()).subscribe(result =>{

            if(result.systemId == 2){
                //假设古树的编号为2
                this.OldTreeData.push(this.collectionData[i]);
                console.log("this.OldTreeData2"+this.collectionData[i]);
            } else if(result.dev_model == ''){

            }
        });
    }


    // 判断是否关注
    array_contain(array, obj){
      for (let i = 0; i < array.length; i++){
        if (array[i].deviceId == obj.deviceId)//如果要求数据类型也一致，这里可使用恒等号===
            return true;
      }
      return false;
    }

    selectAccountAttentionPoints(accountId){
        this.attentionPoints = [];
        let url = this.httpService.getUrl()+"/getAccountAttentionPoints.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "accountId="+accountId;
        let options = new RequestOptions({
            headers: headers
        });
        this.http.post(url,body,options).map(res =>res.json()).subscribe(result =>{
            this.attentionPoints = result;

            console.log("+++++++++attention+++++++++");
            console.log(this.attentionPoints);

        },err =>{

        });
    }

    gotoDeviceInfo(id){
        if(this.showCollectionPoint){
            this.app.getRootNav().push(DevicePage,id).then();
        }else{
            this.popToastView("请先选择需查看的采集点！",2500);
        }

    }

    gotoTreeDetail(item) {
        if(this.showCollectionPoint){
            this.app.getRootNav().push(TreeDetailPage,item).then();
        }else{
            this.popToastView("请先选择需查看的采集点！",2500);
        }

    }


    gotoMap(latitude :number,longitude :number,projectName :string,pointName :string){
        this.app.getRootNav().push(MapPage,[latitude,longitude,projectName,pointName]);
    }
   
    gotoStatistic(point){
        
        if(this.showCollectionPoint){
            this.app.getRootNav().push(StatisticOfHomePage,[point]);
        }else{
            this.popToastView("请先选择需查看的采集点！",2500);
        }
    }


    gotoUpload(item){
        if(this.showCollectionPoint){
            let orgName = "";
            for (let i =0;i<this.organData.length;i++){
                if ((this.organData[i] as any).id == this.organization){
                    orgName = (this.organData[i] as any).name;
                }
            }
            console.log(item);
            this.app.getRootNav().push(TakePhotoPage,{
                isHomeToUpload:true,
                data:item,
                projectId:this.project,
                projectName:item.cName,
                collectionPointName:item.siteName,
                collectionPointId:item.id,
                organizationId:this.organization,
                organizationName:item.organizationName});
        }else{
            this.popToastView("请先选择需查看的采集点！",2500);
        }
    }

    gotoTask(item){
        if(this.showCollectionPoint){
            let orgName = "";
            for (let i =0;i<this.organData.length;i++){
                if ((this.organData[i] as any).id == this.organization){
                    orgName = (this.organData[i] as any).name;
                }
            }

            let prjName = "";
            for (let i =0;i<this.projectData.length;i++){
                if ((this.projectData[i] as any).id == this.project){
                    prjName = (this.projectData[i] as any).cname;
                }
            }

            this.app.getRootNav().push(TaskPage,{
                isHomeToTask:true,
                organizationId:this.organization,
                organizationName:item['organizationName'],
                prjId:this.project,
                prjName:item['cName']
            });
        }else{
            this.popToastView("请先选择需查看的采集点！",2500);
        }


    }
    addAttention(item) {


        this.accountId = (this.accountService.getAccount() as any).accountId;

        let url = this.httpService.getUrl()+"/setAccountAttentionPoint.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "accountId="+this.accountId+"&pointId="+(item as any).id;
        let options = new RequestOptions({
            headers: headers
        });
        this.http.post(url,body,options).subscribe(result =>{
            // this.attentionPoints = result;
            // console.log(this.attentionPoints);
            console.log("关注成功！！！！");
            this.selectAccountAttentionPoints(this.accountId);
        },err =>{

        });
    }

    delAttention(item) {

        this.accountId = (this.accountService.getAccount() as any).accountId;

        let url = this.httpService.getUrl()+"/delAccountAttentionPoint.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "accountId="+this.accountId+"&pointId="+(item as any).id ;
        let options = new RequestOptions({
            headers: headers
        });
        this.http.post(url,body,options).subscribe(result =>{
            // this.attentionPoints = result;
            // console.log(this.attentionPoints);
            this.selectAccountAttentionPoints(this.accountId);
            console.log("取消关注成功！！！！");
        },err =>{

        });
    }

    removeElement(arr, ele){
        let result  = [];
        if(arr instanceof Array){
            if(ele instanceof Array){
                result = arr.filter(function(item){
                    var isInEle = ele.some(function(eleItem){
                        return item === eleItem;
                    });
                    return !isInEle
                })
            }else{
                result = arr.filter(function(item){
                    return item !== ele
                })
            }
        }else{
            console.log('parameter error of function removeElement');
        }
        return result;
    }

    presentPopover(ev) {
        let popover = this.popoverCtrl.create(PopoverPage, {
            organizationId:this.organization,
            organData:this.organData,
            projectId:this.project,
            projectData:this.projectData,
            collectionData:this.collectionData,
        });
        console.log(this.organData);
        popover.present({
            ev: ev
        });
    }

}

