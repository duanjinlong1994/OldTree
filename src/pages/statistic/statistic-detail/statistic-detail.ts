import { Component,Output,EventEmitter ,OnInit ,ElementRef ,ViewChild } from '@angular/core';
import { PopoverController ,NavController, NavParams, AlertController } from 'ionic-angular';
import { ViewController } from 'ionic-angular';
import { Http, Headers ,RequestOptions } from '@angular/http';
import HighCharts from 'highcharts';
// import { ChartComponent } from "angular2-highcharts";
import { HttpService } from '../../../providers/http-service/http-service';
import { AccountService } from '../../../providers/account-service/account-service';
// import { PopoverPage } from '../popover/popover';

@Component({
  selector: 'page-statistic-detail',
  templateUrl: 'statistic-detail.html',
})
export class StatisticDetailPage implements OnInit{
    public timeCount: number = 0;
    @ViewChild('chart') public chartEl: ElementRef;
    private _chart: any;
    chartDisplay: boolean = false;

    //highCharts使用
    options:Object;

    organization:string = "";
    project:string = "";
    collectionPoint:string = "";
    organData:Array<Object>= [];
    projectData:Array<Object>;
    collectionData:Array<Object>;

    @Output() organizationOut = new EventEmitter();
    @Output() projectOut = new EventEmitter();
    @Output() collectionpointOut = new EventEmitter();

    title: string = "一天";
    //统计开始时间、结束时间
    startTime: string = "";
    endTime: string = "";
    //打开关闭时间选择窗口
    changeTimePic: boolean ;

    //highChart的tickInterval
    tickInterval: number = 0;

    //确定查询时间类型
    timeChangeInterVal: string = "天";
    categoriesOfAirTemper:  Array<string>; // 空气温度
    categoriesOfSoilTemper: Array<string>; // 土壤温度
    categoriesOfAirHum:     Array<string>; // 空气湿度
    categoriesOfSoilMo:     Array<string>; // 土壤湿度
    categoriesOfInclin:     Array<string>; // 树木倾斜度
    categoriesOfSoilPH:     Array<string>; // 土壤 PH值
    Xcategories = [];
    YDateTimes = [];
    //时间查询周期
    timePic = 0;
    //统计类型
    statisticType:number = -1;


    //Task传进来的数据接收
    isTaskToStatistic:boolean = false;
    organizationId: any = 0;
    organizationName: string = "";
    prjId: any = 0;
    prjName: any = "";
    constructor(public navCtrl: NavController,
                public popCtrl: PopoverController,
                private viewCtrl: ViewController,
                public navParams: NavParams,
                public alertCtrl: AlertController,
                public http: Http,
                public httpService: HttpService,
                public accountService: AccountService,
    ) {

        console.log(this.navParams.data);
        this.statisticType = this.navParams.get('type');
        this.timePic = 0;
        if (typeof(this.navParams.get('isTaskToStatistic'))!=="undefined"){
            this.organizationId = this.navParams.get('organizationId');
            this.organizationName = this.navParams.get('organizationName');
            this.isTaskToStatistic = this.navParams.get('isTaskToStatistic');
            if(this.isTaskToStatistic !== true) {
                this.getOrganization();
            }
            this.prjId = this.navParams.get('projectId');
            this.prjName = this.navParams.get('projectName');
            this.project = this.prjId;
            console.log(this.organizationName);

            this.projectChange();
        }else {
            this.getOrganization();
        }
        this.setUpTime(0);
    }

    //初始化组织机构数据
    getOrganization() {

                let organizationId = (this.accountService.getAccount() as any).role['organizationId'];
                let url = this.httpService.getUrl()+"/getOrganization.do";
                // var url = this.appConfig.getUrl()+'/getOrganizations.do';
                let body= "organizationId="+organizationId;

                console.log((this.accountService.getAccount() as any).role['organizationId']);
                let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'
                });
                let options = new RequestOptions({
                    headers: headers
                });
                this.http.post(url,body,options).map(res =>res.json()).subscribe(data => {
                    // alert(data['name']);

                    console.log(data);
                    this.organData.push(data);
                });
            }
    //初始化操作

    setUpTime(timeInterval) {
        this.startTime = this.getBeforeDate(timeInterval)+" 00:00:00";
        this.endTime = this.getBeforeDate(0)+" 23:59:59";
    }

    organChange() {
        this.organizationOut.emit(this.organization);
        let url = this.httpService.getUrl()+"/getTreeListByOrgIdForApp.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "organizationId="+this.organization;
        let options = new RequestOptions({
            headers: headers
        });


        this.http.post(url,body,options).map(res => res.json()).subscribe(data =>{
            console.log(data);
            this.projectData = data;
        });
    }

    projectChange() {
        this.projectOut.emit(this.project);
        let url = this.httpService.getUrl()+"/getDataPointListByProjectId.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "projectId="+this.project;
        let options = new RequestOptions({
            headers: headers
        });


        this.http.post(url,body,options).map(res => res.json()).subscribe(data =>{
            // console.log(data);
            this.collectionData = data;
        });
    }

    collectionPointChange() {
        this.collectionpointOut.emit(this.collectionPoint);
        this.statistic();
    }

    statistic() {

        switch (this.statisticType){
            case 0:
                this.QueryOfAirTemperature();
                break;
            case 1:
                this.QueryOfSoilTemperature();
                break;
            case 2:
                this.QueryOfAirHumidity();
                break;
            case 3:
                this.QueryOfSoilMoisture();
                break;
            case 4:
                this.QueryOfInclination();
                break;
            case 5:
                this.QueryOfSoilPH();
                break;
        }
    }

    changeTime(myEvent) {
        this.showRadio();

    }

    showRadio() {
        let alert = this.alertCtrl.create();
        alert.setTitle('选择时间');

        alert.addInput({
            type: 'radio',
            label: '一天',
            value: '0',
            checked: true
        });
        alert.addInput({
            type: 'radio',
            label: '三天',
            value: '2',
        });

        alert.addInput({
            type: 'radio',
            label: '一周',
            value: '6'
        });



        alert.addButton('Cancel');
        alert.addButton({
            text: 'OK',
            handler: data => {
                this.changeTimePic = false;
                this.timePic = data;
                if (this.timePic == 0){
                    this.timeChangeInterVal = "天";
                    this.title = "一天";
                }else if(this.timePic == 2){
                    this.timeChangeInterVal = "三天";
                    this.title = "三天";
                }else {
                    this.timeChangeInterVal = "周";
                    this.title = "一周"
                }
                console.log(this.timePic);
                this.setUpTime(this.timePic);
                console.log("start"+this.startTime);
                console.log("end"+this.endTime);

                this.changeTimePic = true;
                this.statistic();

            }
        });
        alert.present().then(() =>{
            // this.changeTimePic = true;
            // this.statistic();
        });
    }


    getTimeBefore(){
        if (this.timeChangeInterVal == "天"){
            this.timeCount ++;
            console.log(this.timeCount);
            this.setUpTime(this.timeCount);
        }else if(this.timeChangeInterVal == "三天") {
            this.timeCount = this.timeCount+3;
            console.log(this.timeCount);
            this.setUpTime(this.timeCount);
        }else {
            this.timeCount = this.timeCount + 7;
            console.log(this.timeCount);
            this.setUpTime(this.timeCount);
        }
        this.statistic();
    }
    getTimeAfter(){

        let alert = this.alertCtrl.create({
            title: '查询失败',
            subTitle: '日期选择超出当前日期！',
            buttons: ['返回'],
        });

        if (this.timeChangeInterVal == "天"){
            if (this.timeCount >0) {
                this.timeCount --;
                this.setUpTime(this.timeCount);
            }else {
                alert.present().then();
            }
        }else if(this.timeChangeInterVal == "三天") {
            if (this.timeCount > 3) {
                this.timeCount = this.timeCount - 3;
                this.setUpTime(this.timeCount);
            }else {
                alert.present().then();
            }
        }else {
            if (this.timeCount > 7) {
                this.timeCount = this.timeCount - 7;
                this.setUpTime(this.timeCount);
            }else {
                alert.present().then();
            }
        }
        this.statistic();
    }

    getBeforeDate(before){
        var n = before;
        var d = new Date();
        var year = d.getFullYear();
        var mon=d.getMonth()+1;
        var day=d.getDate();
        if(day <= n){
            if(mon>1) {
                mon=mon-1;
            }
            else {
                year = year-1;
                mon = 12;
            }
        }
        d.setDate(d.getDate()-n);
        year = d.getFullYear();
        mon=d.getMonth()+1;
        day=d.getDate();
        let s = year+"-"+(mon<10?('0'+mon):mon)+"-"+(day<10?('0'+day):day);
        return s;
    }




    QueryOfAirTemperature() {

        let  xcategories = [];
        let  categoriesOfTemperature = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);

        //console.log(this.collectionPoint);
        let url = this.httpService.getUrl()+"/getTempByPointID.do";
        let headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId="+this.collectionPoint+"&startTime="+startTime+"&endTime="+endTime;
        console.log(body);
        let options = new RequestOptions({
          headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{  //可替换为：    this.httpService.getAirTemperature(body).then(data=>{
          //显示图表
          setTimeout(()=>{
            if (data.length > 0){
              if (data.length > 1){
                this.tickInterval = data.length / 2;
              }else {
                this.tickInterval = 1;
              }

              for (let i = 0 ;i < data.length; i ++){
                //   let dt = new Date(data[i]['time']);
                // let yAxisDate = data[i]['noise'];
                let dt = new Date(data[i].time);
                let xAxisDate = dt.toLocaleString();
                xcategories.push(xAxisDate);
                let yAxisDate = data[i].temperature;
                categoriesOfTemperature.push([xcategories,yAxisDate]);
              }
              this.Xcategories = xcategories;
              this.categoriesOfAirTemper = categoriesOfTemperature;
              this.QueryOfAirTemperChart();
              this.QueryOfAirTemperChart();
            }else {
              console.log("null");
            }
          },2000);

        });

      }//空气温度

    QueryOfSoilTemperature() {

        let  xcategories = [];
        let  categoriesOfTemperature = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);

        //console.log(this.collectionPoint);
        let url = this.httpService.getUrl()+"/getSoilTemperatureByPointID.do";
        let headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId="+this.collectionPoint+"&startTime="+startTime+"&endTime="+endTime;
        console.log(body);
        let options = new RequestOptions({
          headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{  //可替换为：    this.httpService.getSoilTemperature(body).then(data=>{
          setTimeout(()=>{
            if (data){
              if (data.length > 1){
                this.tickInterval = data.length / 2;
              }else {
                this.tickInterval = 1;
              }

              for (let i = 0 ;i < data.length; i ++){
                //   let dt = new Date(data[i]['time']);
                // let yAxisDate = data[i]['noise'];
                let dt = new Date(data[i].time);
                let xAxisDate = dt.toLocaleString();
                xcategories.push(xAxisDate);
                let yAxisDate = data[i].temperature;
                categoriesOfTemperature.push([xcategories,yAxisDate]);
              }
              this.Xcategories = xcategories;
              this.categoriesOfSoilTemper = categoriesOfTemperature;
              this.QueryOfSoilTemperChart();
              this.QueryOfSoilTemperChart();
            }else {
              console.log("null");
            }
          },2000);

        });

      } //土壤温度

    QueryOfAirHumidity() {

        let  xcategories = [];
        let  categoriesOfAirHum = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);

        //console.log(this.collectionPoint);
        let url = this.httpService.getUrl()+"/getHumidityByPointID.do";
        let headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId="+this.collectionPoint+"&startTime="+startTime+"&endTime="+endTime;
        console.log(body);
        let options = new RequestOptions({
          headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{  //可替换为：    this.httpService.getAirHumidity(body).then(data=>{
          //显示图表
          setTimeout(()=>{
            if (data.length > 0){
              if (data.length > 1){
                this.tickInterval = data.length / 2;
              }else {
                this.tickInterval = 1;
              }

              for (let i = 0 ;i < data.length; i ++){
                //   let dt = new Date(data[i]['time']);
                // let yAxisDate = data[i]['noise'];
                let dt = new Date(data[i].time);
                let xAxisDate = dt.toLocaleString();
                xcategories.push(xAxisDate);
                let yAxisDate = data[i].humidity;
                categoriesOfAirHum.push(yAxisDate);
              }
              this.Xcategories = xcategories;
              this.categoriesOfAirHum = categoriesOfAirHum;

              console.log(this.categoriesOfAirHum);
              this.QueryOfAirHumChart();
              this.QueryOfAirHumChart();
            }else {
              console.log("null");
            }
          },2000);

        });

      }//空气湿度

    QueryOfSoilMoisture() {

        let  xcategories = [];
        let  categoriesOfSoilMo = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);

        //console.log(this.collectionPoint);
        let url = this.httpService.getUrl()+"/getSoilMoistureByPointID.do";
        let headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId="+this.collectionPoint+"&startTime="+startTime+"&endTime="+endTime;    console.log(body);
        let options = new RequestOptions({
          headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{  //可替换为：    this.httpService.getSoilMoisture(body).then(data=>{
          setTimeout(()=>{
            if (data){
              if (data.length > 1){
                this.tickInterval = data.length / 2;
              }else {
                this.tickInterval = 1;
              }

              for (let i = 0 ;i < data.length; i ++){
                //   let dt = new Date(data[i]['time']);
                // let yAxisDate = data[i]['noise'];
                let dt = new Date(data[i].time);
                let xAxisDate = dt.toLocaleString();
                xcategories.push(xAxisDate);
                let yAxisDate = data[i].temperature;
                categoriesOfSoilMo.push([xcategories,yAxisDate]);
              }
              this.Xcategories = xcategories;
              this.categoriesOfSoilMo = categoriesOfSoilMo;
              this.QueryOfSoilMoChart();
              this.QueryOfSoilMoChart();
            }else {
              console.log("null");
            }
          },2000);

        });

      }//土壤湿度

    QueryOfInclination() {

        let  xcategories = [];
        let  categoriesOfInclin = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);

        //console.log(this.collectionPoint);
        let url = this.httpService.getUrl()+"/getInclinationByPointID.do";
        let headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId="+this.collectionPoint+"&startTime="+startTime+"&endTime="+endTime;
        console.log(body);
        let options = new RequestOptions({
          headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{  //可替换为：    this.httpService.getInclination(body).then(data=>{
          //显示图表
          setTimeout(()=>{
            if (data.length > 0){
              if (data.length > 1){
                this.tickInterval = data.length / 2;
              }else {
                this.tickInterval = 1;
              }

              for (let i = 0 ;i < data.length; i ++){
                //   let dt = new Date(data[i]['time']);
                // let yAxisDate = data[i]['noise'];
                let dt = new Date(data[i].time);
                let xAxisDate = dt.toLocaleString();
                xcategories.push(xAxisDate);
                let yAxisDate = data[i].inclination;
                categoriesOfInclin.push(yAxisDate);
              }
              this.Xcategories = xcategories;
              this.categoriesOfInclin = categoriesOfInclin;
              this.QueryOfInclinationChart();
              this.QueryOfInclinationChart();
            }else {
              console.log("null");
            }
          },2000);

        });

      }//树木倾斜度

    QueryOfSoilPH() {

        let  xcategories = [];
        let  categoriesOfSoilPH = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);

        //console.log(this.collectionPoint);
        let url = this.httpService.getUrl()+"/getSoilPHByPointID.do";
        let headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId="+this.collectionPoint+"&startTime="+startTime+"&endTime="+endTime;
        console.log(body);
        let options = new RequestOptions({
          headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{  //可替换为：    this.httpService.getSoilPH(body).then(data=>{
          setTimeout(()=>{
            if (data){
              if (data.length > 1){
                this.tickInterval = data.length / 2;
              }else {
                this.tickInterval = 1;
              }

              for (let i = 0 ;i < data.length; i ++){
                //   let dt = new Date(data[i]['time']);
                // let yAxisDate = data[i]['noise'];
                let dt = new Date(data[i].time);
                let xAxisDate = dt.toLocaleString();
                xcategories.push(xAxisDate);
                let yAxisDate = data[i].temperature;
                categoriesOfSoilPH.push(yAxisDate);
              }
              this.Xcategories = xcategories;
              this.categoriesOfSoilTemper = categoriesOfSoilPH;
              this.QueryOfSoilPHChart();
              this.QueryOfSoilPHChart();
            }else {
              console.log("null");
            }
          },2000);

        });

      } //土壤 PH值

    dismiss(){
      this.viewCtrl.dismiss();
    }



    ngOnInit(){

    }
    QueryOfAirTemperChart() {
        let opts: any = {

            lang: {
                printChart:"打印图表",
                downloadJPEG: "下载JPEG 图片" ,
                downloadPDF: "下载PDF文档"  ,
                downloadPNG: "下载PNG 图片"  ,
                downloadSVG: "下载SVG 矢量图" ,
                exportButtonTitle: "导出图片" ,
                resetZoom:"重置图片"
            },
            title: {
                text: '空气温度实时数据',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                tickInterval:this.Xcategories.length / 2 ,
                categories:this.Xcategories
            },
            yAxis : {
                floor: 0,
                ceiling: 200,
                title : {
                    text : '空气温度'
                },
                plotLines : [
                    {
                        value : 0,
                        width : 1,
                        color : '#808080'
                    },
                ]
            },
            // tooltip : {
            //     formatter : function()
            //     {
            //         return '<b>' +  this.highcharts.numberFormat(this.y, 2) + '</b><br>'
            //             + this.x + '<br>';
            //     }
            // },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, 'rgb(124,181,236)'],
                            [1, 'rgba(124,181,236,0)']
                        ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            series:
                [{
                    type: 'area',
                    name: '空气温度',
                    data: this.categoriesOfAirTemper
                }]
        };
        if (this.chartEl && this.chartEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartEl.nativeElement,
                zoomType: 'x',
                marginRight: 10,
                spacingBottom: 0 ,
                marginTop:20,
                height:200 ,
                position: {
                    x: 0,
                    y: -30
                }};
            this._chart = new HighCharts.Chart(opts);
        }

    } //空气温度

    QueryOfSoilTemperChart() {
        let opts: any = {

            lang: {
                printChart:"打印图表",
                downloadJPEG: "下载JPEG 图片" ,
                downloadPDF: "下载PDF文档"  ,
                downloadPNG: "下载PNG 图片"  ,
                downloadSVG: "下载SVG 矢量图" ,
                exportButtonTitle: "导出图片" ,
                resetZoom:"重置图片"
            },
            title: {
                text: '土壤温度实时数据',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                tickInterval:this.Xcategories.length / 2 ,
                categories:this.Xcategories
            },
            yAxis : {
                floor: 30,
                ceiling: 200,
                title : {
                    text : '土壤温度'
                },
                plotLines : [
                    {
                        value : 0,
                        width : 1,
                        color : '#808080'
                    },
                ]
            },
            // tooltip : {
            //     formatter : function()
            //     {
            //         return '<b>' +  this.highcharts.numberFormat(this.y, 2) + '</b><br>'
            //             + this.x + '<br>';
            //     }
            // },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        // stops: [
                        //     [0, this.highcharts.getOptions().colors[0]],
                        //     [1, highchart.Color(highchart.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        // ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            series:
                [{
                    type: 'area',
                    name: '土壤温度',
                    data: this.categoriesOfSoilTemper
                }]
        };
        if (this.chartEl && this.chartEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartEl.nativeElement,
                zoomType: 'x',
                marginRight: 10,
                spacingBottom: 0 ,
                marginTop:20,
                position: {
                    x: 0,
                    y: -30
                }};
            this._chart = new HighCharts.Chart(opts);
        }

    }  //土壤温度

    QueryOfAirHumChart() {
        let opts: any = {

            lang: {
                printChart:"打印图表",
                downloadJPEG: "下载JPEG 图片" ,
                downloadPDF: "下载PDF文档"  ,
                downloadPNG: "下载PNG 图片"  ,
                downloadSVG: "下载SVG 矢量图" ,
                exportButtonTitle: "导出图片" ,
                resetZoom:"重置图片"
            },
            title: {
                text: '空气湿度实时数据',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                tickInterval:this.Xcategories.length / 2 ,
                categories:this.Xcategories
            },
            yAxis : {
                floor: 10,
                ceiling: 200,
                title : {
                    text : '空气湿度'
                },
                plotLines : [
                    {
                        value : 0,
                        width : 1,
                        color : '#808080'
                    },
                ]
            },
            // tooltip : {
            //     formatter : function()
            //     {
            //         return '<b>' +  this.highcharts.numberFormat(this.y, 2) + '</b><br>'
            //             + this.x + '<br>';
            //     }
            // },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, 'rgb(124,181,236)'],
                            [1, 'rgba(124,181,236,0)']
                        ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            series:
                [{
                    type: 'area',
                    name: '空气湿度',
                    data: this.categoriesOfAirHum
                }]
        };
        if (this.chartEl && this.chartEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartEl.nativeElement,
                zoomType: 'x',
                marginRight: 10,
                spacingBottom: 0 ,
                marginTop:20,
                height:200 ,
                position: {
                    x: 0,
                    y: -30
                }};
            this._chart = new HighCharts.Chart(opts);
        }

    }  //空气湿度

    QueryOfSoilMoChart() {
        let opts: any = {

            lang: {
                printChart:"打印图表",
                downloadJPEG: "下载JPEG 图片" ,
                downloadPDF: "下载PDF文档"  ,
                downloadPNG: "下载PNG 图片"  ,
                downloadSVG: "下载SVG 矢量图" ,
                exportButtonTitle: "导出图片" ,
                resetZoom:"重置图片"
            },
            title: {
                text: '土壤湿度实时数据',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                tickInterval:this.Xcategories.length / 2 ,
                categories:this.Xcategories
            },
            yAxis : {
                floor: 30,
                ceiling: 200,
                title : {
                    text : '土壤湿度'
                },
                plotLines : [
                    {
                        value : 0,
                        width : 1,
                        color : '#808080'
                    },
                ]
            },
            // tooltip : {
            //     formatter : function()
            //     {
            //         return '<b>' +  this.highcharts.numberFormat(this.y, 2) + '</b><br>'
            //             + this.x + '<br>';
            //     }
            // },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        // stops: [
                        //     [0, this.highcharts.getOptions().colors[0]],
                        //     [1, highchart.Color(highchart.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        // ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            series:
                [{
                    type: 'area',
                    name: '土壤湿度',
                    data: this.categoriesOfSoilMo
                }]
        };
        if (this.chartEl && this.chartEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartEl.nativeElement,
                zoomType: 'x',
                marginRight: 10,
                spacingBottom: 0 ,
                marginTop:20,
                position: {
                    x: 0,
                    y: -30
                }};
            this._chart = new HighCharts.Chart(opts);
        }

    }  //土壤湿度

    QueryOfInclinationChart() {
        let opts: any = {

            lang: {
                printChart:"打印图表",
                downloadJPEG: "下载JPEG 图片" ,
                downloadPDF: "下载PDF文档"  ,
                downloadPNG: "下载PNG 图片"  ,
                downloadSVG: "下载SVG 矢量图" ,
                exportButtonTitle: "导出图片" ,
                resetZoom:"重置图片"
            },
            title: {
                text: '树木倾斜度实时数据',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                tickInterval:this.Xcategories.length / 2 ,
                categories:this.Xcategories
            },
            yAxis : {
                floor: 30,
                ceiling: 200,
                title : {
                    text : '树木倾斜度'
                },
                plotLines : [
                    {
                        value : 0,
                        width : 1,
                        color : '#808080'
                    },
                ]
            },
            // tooltip : {
            //     formatter : function()
            //     {
            //         return '<b>' +  this.highcharts.numberFormat(this.y, 2) + '</b><br>'
            //             + this.x + '<br>';
            //     }
            // },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        // stops: [
                        //     [0, this.highcharts.getOptions().colors[0]],
                        //     [1, highchart.Color(highchart.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        // ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            series:
                [{
                    type: 'area',
                    name: '树木倾斜度',
                    data: this.categoriesOfInclin
                }]
        };
        if (this.chartEl && this.chartEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartEl.nativeElement,
                zoomType: 'x',
                marginRight: 10,
                spacingBottom: 0 ,
                marginTop:20,
                position: {
                    x: 0,
                    y: -30
                }};
            this._chart = new HighCharts.Chart(opts);
        }

    }  //树木倾斜度

    QueryOfSoilPHChart() {
        let opts: any = {

            lang: {
                printChart:"打印图表",
                downloadJPEG: "下载JPEG 图片" ,
                downloadPDF: "下载PDF文档"  ,
                downloadPNG: "下载PNG 图片"  ,
                downloadSVG: "下载SVG 矢量图" ,
                exportButtonTitle: "导出图片" ,
                resetZoom:"重置图片"
            },
            title: {
                text: '土壤 PH值实时数据',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                tickInterval:this.Xcategories.length / 2 ,
                categories:this.Xcategories
            },
            yAxis : {
                floor: 20,
                ceiling: 200,
                title : {
                    text : '土壤 PH值'
                },
                plotLines : [
                    {
                        value : 0,
                        width : 1,
                        color : '#808080'
                    },
                ]
            },
            // tooltip : {
            //     formatter : function()
            //     {
            //         return '<b>' +  this.highcharts.numberFormat(this.y, 2) + '</b><br>'
            //             + this.x + '<br>';
            //     }
            // },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, 'rgb(124,181,236)'],
                            [1, 'rgba(124,181,236,0)']
                        ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            series:
                [{
                    type: 'area',
                    name: '土壤 PH值',
                    data: this.categoriesOfSoilPH
                }]
        };
        if (this.chartEl && this.chartEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartEl.nativeElement,
                zoomType: 'x',
                marginRight: 10,
                spacingBottom: 0 ,
                marginTop:20,
                position: {
                    x: 0,
                    y: -30
                }};
            this._chart = new HighCharts.Chart(opts);
        }


    }   //土壤 PH值
    public ngOnDestroy() {

    }

    searchFail() {
        let alert = this.alertCtrl.create({
            title: '查询失败',
            subTitle: '该时段无数据！',
            buttons: ['返回'],
        });

        alert.present().then();
    }

}


