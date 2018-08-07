import { Component,Output,EventEmitter } from '@angular/core';
import { ViewController ,ToastController,AlertController,ActionSheetController} from 'ionic-angular';
import { NativeService } from "../../../providers/native-service/native-service";
import { NavController, NavParams } from 'ionic-angular';
import { Http,Headers ,RequestOptions } from '@angular/http';
import { HttpService } from '../../../providers/http-service/http-service';
import { AccountService } from '../../../providers/account-service/account-service';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera,CameraOptions} from '@ionic-native/camera';
/*
 Generated class for the TakePhoto page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-take-photo',
    templateUrl: 'take-photo.html',
})
export class TakePhotoPage {
    @Output() organizationOut = new EventEmitter();
    @Output() projectOut = new EventEmitter();
    @Output() collectionpointOut = new EventEmitter();
    organData:Array<Object> = [];
    projectData:Array<Object>;
    collectionData:Array<Object>;

    accountId = 0;
    isChange: boolean = false;//头像是否改变标识
    avatarPath: string = 'assets/camera.jpg';//用户默认头像
    imageBase64: string;//保存头像base64,用于上传
    litImage: string;
    longitude = 108.00;//经度
    latitude = 34.00;//纬度
    note:string = "";//备注信息
    isHomeToUpload:boolean = false;
    isTaskToUpload:boolean = false;

    //主页上传照片参数
    organizationId: number = -1;
    organizationName: string = "选择机构";
    projectId:number = -1;
    projectName:string = "选择树木";
    collectionPointId: number = -1;
    collectionPointName: string = "选择检测点";
    taskId:number = -1;

    constructor(public navCtrl: NavController,
                private viewCtrl: ViewController,
                public navParams: NavParams,
                public http: Http,
                public toastCtrl: ToastController,
                public alertCtrl:AlertController,
                public actionSheetCtrl :ActionSheetController,
                public camera: Camera,
                public geolocation: Geolocation,
                public accountService: AccountService,
                public httpService: HttpService,
                private nativeService: NativeService,
    ) {
        console.log(this.navParams.data);
        typeof("=====================isHomeToTask");
        console.log(typeof(this.navParams.get('isHomeToUpload')));
        if (typeof(this.navParams.get('isHomeToUpload'))!="undefined"){
            this.organizationId = this.navParams.get('organizationId');
            this.organizationName = this.navParams.get('organizationName');
            this.isHomeToUpload = this.navParams.get('isHomeToUpload');
            this.projectId = this.navParams.get('projectId');
            this.projectName = this.navParams.get('projectName');
            this.collectionPointName = this.navParams.get('collectionPointName');
            this.collectionPointId = this.navParams.get('collectionPointId');

            this.projectId = this.projectId;
            this.collectionPointId = this.collectionPointId;
        }else if(typeof(this.navParams.get('isTaskToUpload'))!="undefined"){
            this.organizationId = this.navParams.get('organizationId');
            this.organizationName = this.navParams.get('organizationName');
            this.isTaskToUpload = this.navParams.get('isTaskToUpload');
            this.projectId = this.navParams.get('projectId');
            this.projectName = this.navParams.get('projectName');
            this.projectId = this.projectId;
            this.taskId = this.navParams.get('taskNo');
            this.projectChange();
        }
        // else if(typeof(this.navParams.get('isPopoverToUpload'))!="undefined") {
        //     console.log(this.navParams.data);
        //     if(typeof(this.navParams.get('organizationId'))!="undefined") {
        //         this.organizationId = this.navParams.get('organizationId');
        //         this.organData = this.navParams.get('organData');
        //         this.getNameById(this.organizationId,'organ');
        //         console.log(this.organData);
        //         console.log(this.organizationId);
        //         console.log(this.organizationName);
        //         if(typeof(this.projectId)!="undefined")
        //         {
        //             this.projectId = this.navParams.get('projectId');
        //             this.projectData = this.navParams.get('projectData');
        //             this.getNameById(this.projectId,'proj');
        //             if (this.navParams.get('collectionData').length>0)
        //             {
        //                 this.collectionData=this.navParams.get('collectionData');
        //                 this.selectColleAlert(this.collectionData);
        //             }
        //             else {
        //                 this.projectChange();
        //             }
        //
        //         }
        //         else
        //         {
        //             this.organChange();
        //         }
        //     }
        //     else {
        //         this.getOrganization();
        //     }
        // }
        else{
            this.getOrganization();
        }

        this.geolocation.getCurrentPosition().then((resp) =>{
                this.latitude = resp.coords.latitude;
                this.longitude = resp.coords.longitude;
            },
            error=>{
                this.nativeService.showAlert('定位失败！','请检查是否打开手机定位');
            });

    }




    //初始化组织机构数据
    getOrganization() {

        let organizationId = (this.accountService.getAccount() as any).role['organizationId'];
        let url = this.httpService.getUrl()+"/getOrganization.do";
        // var url = this.appConfig.getUrl()+'/getOrganizations.do';
        let body= "organizationId="+organizationId;

        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'
        });
        let options = new RequestOptions({
            headers: headers
        });
        this.http.post(url,body,options).map(res =>res.json()).subscribe(data => {
            this.organData.push(data);
        });
    }
    organChange() {
        this.organizationOut.emit(this.organizationId);
        this.getNameById(this.organizationId,'organ');
        let url = this.httpService.getUrl()+"/getTreeListByOrgIdForApp.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "organizationId="+this.organizationId;
        let options = new RequestOptions({
            headers: headers
        });
        this.http.post(url,body,options).map(res => res.json()).subscribe(data =>{
            this.projectData = data;
            this.selectProjAlert(this.projectData);
        });

    }

    projectChange() {
        this.projectOut.emit(this.projectId);
        this.getNameById(this.projectId,'proj');
        let url = this.httpService.getUrl()+"/getDataPointListByProjectId.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "projectId="+this.projectId;
        let options = new RequestOptions({
            headers: headers
        });

        this.http.post(url,body,options).map(res => res.json()).subscribe(data =>{
            this.collectionData = data;
            this.selectColleAlert(this.collectionData);
        });
    }

    collectionPointChange() {
        this.collectionpointOut.emit(this.collectionPointId);
        this.getNameById(this.collectionPointId,'colle');
        console.log(this.collectionPointId+' '+this.projectId+' '+this.collectionPointId);
    }



    getPicture(type) {//1拍照,0从图库选择

        let options = {
            quality:50,
            targetWidth: 500,
            targetHeight: 500,
        };
        if (type == 1) {
            this.getPic();
        } else {
            this.nativeService.getPictureByPhotoLibrary(options).then(imageBase64 => {
                this.getPictureSuccess(imageBase64);
            });
        }
    }

    private getPictureSuccess(imageBase64) {

        let base64Image = 'data:image/jpeg;base64,' + imageBase64;

        this.avatarPath = base64Image;
        console.log(imageBase64);
        this.imageBase64 = <string>imageBase64;
        this.litImage = imageBase64;

    }

    uploadImage() {
        this.accountId = (this.accountService.getAccount() as any).accountId;
        if(typeof (this.imageBase64)==='undefined')
        {
            this.nativeService.showAlert('请添加一张照片');
        }
        else {
            // this.litImage = this.imageBase64;
            let url = this.httpService.getUrl() + "/saveImage.do";
            let headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            });
            let note = "任务上传图片";
            let body = "projectId=" + this.projectId + "&datacollectionpointId=" + this.collectionPointId + "&base64ImageData=" + this.imageBase64 + "&note=1&base64Litimg=" + this.litImage + "&longitude=" + this.longitude + "&latitude=" + this.latitude + "&accountID=" + this.accountId;
            if (this.isTaskToUpload) {
                body = "base64ImageData=" + this.imageBase64 + "&note=" + note + "&base64Litimg=" + this.litImage + "&longitude=" + this.longitude + "&latitude=" + this.latitude + "&accountID=" + this.accountId + "&alarmTaskId=" + this.taskId;
            }

            let options = new RequestOptions({
                headers: headers
            });
            this.http.post(url, body, options).subscribe(data => {
                this.isChange = true;
                // this.projectData = data;

                let toast = this.toastCtrl.create({
                    message: '上传成功！',
                    duration: 2000,
                    position: 'middle'
                });

                toast.present(toast).then();
            }, err => {
                let toast = this.toastCtrl.create({
                    message: '上传失败，请重新拍照！',
                    duration: 2000,
                    position: 'middle'
                });
                toast.present(toast).then(() => {
                    this.avatarPath = 'assets/camera.jpg';//用户默认头像
                });
            });


            if (!this.isChange) {
                this.nativeService.showLoading('正在上传....');
                this.avatarPath = 'assets/camera.jpg';
                // this.viewCtrl.dismiss({avatarPath: this.avatarPath});//这里可以把头像传出去.
            } else {
                this.dismiss();
            }
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    getPic(){

        const options: CameraOptions = {
            quality: 50,
            targetWidth: 500,
            targetHeight: 500,
            correctOrientation: true,
            encodingType: this.camera.EncodingType.JPEG,
            destinationType: this.camera.DestinationType.DATA_URL
        };
        this.camera.getPicture(options).then((imageData) => {
            let base64Image = 'data:image/jpeg;base64,' + imageData;
            this.imageBase64 = imageData;
            this.litImage = imageData;

            console.log(this.litImage);
            this.avatarPath = base64Image;

        }, (err) => {
        });
    }


    inputBlur() {
        console.log(this.note);
    }

    presentPhtotMethodAlert() {
        let phtotMethodAlert = this.alertCtrl.create();
        phtotMethodAlert.setTitle('Lightsaber color');
        phtotMethodAlert.addInput({
                type: 'radio',
                label: '拍摄',
                value: '0',
                checked: false
            }
        );
        phtotMethodAlert.addInput({
                type: 'radio',
                label: '从相册选择',
                value: '1',
                checked: false
            }
        );
        phtotMethodAlert.addButton('Cancel');
        phtotMethodAlert.addButton({
            text: 'OK',
            handler: data => {
                //    this.testRadioOpen = false;
                // this.testRadioResult = data;
            }
        });
        phtotMethodAlert.present();

    }

    selectPhotoMethod()
    {
        const actionSheet = this.actionSheetCtrl.create({
            title: '选择图片来源',
            buttons: [
                {
                    text: '拍摄',
                    handler: () => {
                        this.getPicture(1);
                        console.log('Destructive clicked');
                    }
                },{
                    text: '从相册选择',
                    handler: () => {
                        this.getPicture(0);
                        console.log('Archive clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    onSelectButtonClick()
    {
        this.selectOrganAlert(this.organData);
    }

    selectOrganAlert(items:Array<Object>)
    {
        let selectAlert =this.alertCtrl.create();
        selectAlert.setTitle('请选择机构');
        for(let item of items)
        {
            if(item['id']===this.organizationId){
                selectAlert.addInput({
                    type:'radio',
                    label:item['name'],
                    value:item['id'],
                    checked:true
                });
            }
            else {
                selectAlert.addInput({
                    type:'radio',
                    label:item['name'],
                    value:item['id'],
                    checked:false
                });
            }
        }
        selectAlert.addButton('取消');
        selectAlert.addButton({
            text:'选择',
            handler:data=>{
                console.log("----------------");
                console.log(data);
                this.organizationId=data;
                this.organChange();
            }
        });
        selectAlert.present();
    }

    selectProjAlert(items:Array<Object>)
    {
        console.log(items);
        let selectAlert =this.alertCtrl.create();
        selectAlert.setTitle('请选择树木');
        for(let item of items)
        {
            if(item['treeid']===this.projectId){
                selectAlert.addInput({
                    type:'radio',
                    label:item['cname'],
                    value:item['treeid'],
                    checked:true
                });
            }
            else {
                selectAlert.addInput({
                    type:'radio',
                    label:item['cname'],
                    value:item['treeid'],
                    checked:false
                });
            }
        }
        selectAlert.addButton('取消');
        selectAlert.addButton({
            text:'选择',
            handler:data=>{
                console.log("----------------");
                console.log(data);
                this.projectId=data;
                this.projectChange();
            }
        });
        selectAlert.present();
    }

    selectColleAlert(items:Array<Object>)
    {
        console.log(items);
        let selectAlert =this.alertCtrl.create();
        selectAlert.setTitle('请选择测试点');
        for(let item of items)
        {
            if(item['id']===this.collectionPointId){
                selectAlert.addInput({
                    type:'radio',
                    label:item['siteName'],
                    value:item['id'],
                    checked:true
                });
            }
            else {
                selectAlert.addInput({
                    type:'radio',
                    label:item['siteName'],
                    value:item['id'],
                    checked:false
                });
            }
        }
        selectAlert.addButton('取消');
        selectAlert.addButton({
            text:'选择',
            handler:data=>{
                console.log("----------------");
                console.log(data);
                this.collectionPointId=data;
                this.collectionPointChange();
            }
        });
        selectAlert.present();
    }

    getNameById(id:any,type:string){
        console.log(type+" "+id);
        if(type=='organ')
        {
            console.log('coming in organ!');
            for(let item of this.organData)
            {
                console.log(item['name']);
                if(id==item['id'])
                {
                    this.organizationName=item['name'];
                    break;
                }
            }
        }
        else if(type=='proj')
        {
            for(let item of this.projectData)
            {
                if(id==item['treeid'])
                {
                    this.projectName=item['cname'];
                    break;
                }
            }
        }
        else if(type=='colle')
        {
            for(let item of this.collectionData)
            {

                console.log(id+"+++++++++");
                console.log(item['id']);
                if(id==item['id'])
                {
                    this.collectionPointName=item['siteName'];
                    break;
                }
            }
            console.log(this.collectionPointName);
        }

    }

}
