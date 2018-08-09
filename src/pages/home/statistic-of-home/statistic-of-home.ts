import { Component ,ElementRef ,ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController,AlertController } from 'ionic-angular';
import { HttpService } from "../../../providers/http-service/http-service";
import { NativeService } from'../../../providers/native-service/native-service'
import { Http, Headers, RequestOptions } from "@angular/http";
import HighCharts from 'highcharts';
/**
 * Generated class for the StatisticOfHomePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-statistic-of-home',
  templateUrl: 'statistic-of-home.html',
})
export class StatisticOfHomePage {
    @ViewChild('chart')        public chartEl        : ElementRef;
    @ViewChild('chartOfPM25')  public chartOfPM25El  : ElementRef;
    @ViewChild('chartOfPM10')  public chartOfPm10El  : ElementRef;
    @ViewChild('chartOfNoise') public chartOfNoiseEl : ElementRef;
    @ViewChild('chartOfAirTemper') public chartOfAirTemperEl : ElementRef;
    @ViewChild('chartOfAirHum') public chartOfAirHumEl : ElementRef;
    @ViewChild('chartOfInclin') public chartOfInclinEl : ElementRef;
    private _chart: any;
    pointName : string = "";
    projectName : string = "";
    cName : string="";
    siteName : string ="";
    deviceId  : number = -1;
    deviceData: object = null;
    projectId : number = -1;
    collectId : number = -1;

    // 判断需要显示的图标
    isPM25Display          : boolean = false;
    isPM10Display          : boolean = false;
    isNoiseDisplay         : boolean = false;
    isConWaterLevelDisplay : boolean = false;
    isFixWaterLevelDisplay : boolean = false;
    isWellDisplay          : boolean = false;
    isAirTemperDisplay     : boolean = false;
    isAirHumDisplay        : boolean = false;
    isInclinDisplay        : boolean = false;

    AirHumButton    : boolean = true;
    AirTempButton   : boolean = true;
    //统计开始时间、结束时间
    startTime     : string = "";
    endTime       : string = "";
    //打开关闭时间选择窗口
    changeTimePic : boolean ;

    //highChart的tickInterval
    tickInterval  : number = 0;

    //确定查询时间类型
    timeChangeInterVal: string = "天";
    categoriesOfNoise : Array<string>;
    categoriesOfPm25  : Array<string>;
    categoriesOfPm10  : Array<string>;
    categoriesOfLX    : Array<string>;
    categoriesOfGD    : Array<string>;
    categoriesOfWell  : Array<string>;
    categoriesOfAirTemper:  Array<string>;//空气温度
    categoriesOfSoilTemper: Array<string>;//土壤温度
    categoriesOfAirHum:     Array<string>;//空气湿度
    categoriesOfSoilMo:     Array<string>;//土壤湿度
    categoriesOfInclin:     Array<string>;//树木倾斜度
    categoriesOfSoilPH:     Array<string>;//土壤 PH值

    Xcategories        = [];
    XCategoriesOfPm10  = [];
    XCategoriesOfNoise = [];
    XCategoriesOfPm25  = [];
    XCategoriesOfAirTemper= [];
    XCategoriesOfSoilTemper= [];
    XCategoriesOfAirHum= [];
    XCategoriesOfSoilMo= [];
    XCategoriesOfInclin= [];
    XCategoriesOfSoilPH= [];

    YDateTimes         = [];
    //时间查询周期
    timePic     = 0;
    //统计类型
    statisticType:number = -1;


    constructor(public  navCtrl: NavController,
                public  navParams: NavParams,
                private viewCtrl: ViewController,
                private http: Http,
                private alertCtrl: AlertController,
                private httpService: HttpService,
                private nativeService:NativeService,
    ) {
        console.log(this.navParams.data);
        // this.projectName = this.navParams.data[0].projectName;
        // if(this.navParams.data[0].siteName){
        //     this.pointName=this.navParams.data[0].siteName;
        // }else{
        //     this.pointName=this.navParams.data[0].name;
        // }
        // console.log(this.pointName);
        // this.deviceId  = this.navParams.data[0].deviceId;
        // this.collectId = this.navParams.data[0].id;
         this.setUpTime();
    }

    ionViewDidLoad() {
        // this.getDeviceById(this.deviceId).then(data =>{
        //     this.deviceData = data;
        //     console.log(this.deviceData);
        //     this.chartDisplay();
        // });
    }

    // 退出当前页面
    dismiss (){
          this.viewCtrl.dismiss().then();
    }

    getDeviceById(deviceId) {
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let options = new RequestOptions({
            headers: headers
        });
        let url = this.httpService.getUrl()+"/getDeviceByIdForApp.do";
        let body= "deviceId="+deviceId;
        return new Promise((resolve,reject) => {
            this.http.post(url, body, options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                },err => {
                    reject(err);
                });
        });
    }

    //页面图表显示；
    chartDisplay() {
        console.log((this.deviceData as any).model);

        if((this.deviceData as any).systemId == 0) {
            if((this.deviceData as any).noiseEquipted){
                this.isNoiseDisplay = true;
                this.QueryOfNoise();
                // this.QueryOfNoise();
            }

            if((this.deviceData as any).pm10equipted){
                this.isPM10Display = true;
                this.QueryOfPm10();
                // this.QueryOfNoise();
            }

            if((this.deviceData as any).pm25equipted){
                this.isPM25Display = true;
                this.QueryOfPm25();
                // this.QueryOfNoise();
            }

        }else if((this.deviceData as any).systemId == 1){
            if((this.deviceData as any).continuationequipted){
                this.isConWaterLevelDisplay = true;
                this.QueryOfConWaterLevel();
            }

            if((this.deviceData as any).fixationequipted){
                this.isFixWaterLevelDisplay = true;
                this.QueryOfFixWaterLevel();
            }

            if((this.deviceData as any).wellequipted){
                this.isWellDisplay = true;
                this.QueryOfWell();
            }
        } else if((this.deviceData as any).systemId == 2){
            if((this.deviceData as any).tempEquipted){
              //  this.isAirTemperDisplay = true;
                this.QueryOfAirTemperature();
            }

            if((this.deviceData as any).humidityEquipted){
              //  this.isAirHumDisplay = true;
                this.QueryOfAirHumidity();
            }

            if((this.deviceData as any).inclinationEquipted){
                this.isInclinDisplay = true;
                this.QueryOfInclination();
            }
        }
    }


    //统计默认显示一天的数据
    setUpTime() {
        this.startTime = this.getBeforeDate(7)+" 00:00:00";
        this.endTime = this.getBeforeDate(0)+" 23:59:59";

        console.log("start"+this.startTime);
    }

    //获取当前日期之前before天
    getBeforeDate(before){
        let n = before;
        let d = new Date();
        let year = d.getFullYear();
        let mon=d.getMonth()+1;
        let day=d.getDate();
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



    QueryOfNoise() {
                let  xcategories = [];
                let  categoriesOfNoise = [];
                let startTime:String = this.startTime;
                let endTime:String = this.endTime;
                console.log(startTime +"   "+endTime);
                //console.log(this.collectionPoint);
                let url =this.httpService.getUrl()+"/getNoiseByPointID.do";
                let headers = new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded'
                });
                let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;
                console.log(body);
                let options = new RequestOptions({
                    headers: headers
                });


                this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{
                    //显示图表
                    setTimeout(()=>{
                        if (data){
                            if (data.length > 1){
                                this.tickInterval = data.length / 2;
                            }else {
                                this.tickInterval = 1;
                            }

                            for (let i = 0 ;i < data.length; i ++){

                                let dt = new Date(data[i].time);
                                let xAxisDate = dt.toLocaleString();
                                xcategories.push(xAxisDate);
                                let yAxisDate = data[i].noise;
                                categoriesOfNoise.push(yAxisDate);
                            }
                            this.XCategoriesOfNoise = xcategories;
                            this.categoriesOfNoise = categoriesOfNoise;
                            this.QueryOfNoiseChart();
                            this.QueryOfNoiseChart();
                        }else {
                            console.log("null");
                        }
                    },2000);

                });



            }

    QueryOfPm25() {
        this.nativeService.showLoading("正在加载数据...")
        let  xcategories = [];
        let  categoriesOfPm25 = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);
        let url ="http://47.92.34.161:80/NoiseDust/getPm25ByPointID.do";//  this.httpService.getUrl()+"/getPm25ByPointID.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId=2176"+"&startTime="+startTime+"&endTime="+endTime;//+this.collectId
        console.log(body);
        let options = new RequestOptions({
            headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{

            this.nativeService.hideLoading();
            //显示图表
            console.log("=============pm2.5===========");
            console.log(data);
            if (data[0]!==null){
                if (data.length > 1){
                    this.tickInterval = data.length / 2;
                }else {
                    this.tickInterval = 1;
                }
                for (let i = 0 ;i < data.length; i ++){
                    let  dt = new Date(data[i].time);
                    let xAxisDate = dt.toLocaleString();
                    xcategories.push(xAxisDate);
                    let yAxisDate = data[i].pm25;
                    categoriesOfPm25.push(yAxisDate);
                }
                this.XCategoriesOfPm25 = xcategories;
                this.categoriesOfPm25 = categoriesOfPm25;
                this.QueryOfPm25Chart();
            }else {
                this.searchFail();
            }
        });
    }

    QueryOfPm10() {

        this.nativeService.showLoading("正在加载数据...");
        let  xcategories = [];
        let  categoriesOfPm10 = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);

        let url ="http://47.92.34.161:80/NoiseDust/getPm10ByPointID.do";// this.httpService.getUrl()+"/getPm10ByPointID.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId=2176"+"&startTime="+startTime+"&endTime="+endTime;//+this.collectId
        console.log(body);
        let options = new RequestOptions({
            headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{
            //显示图表
            this.nativeService.hideLoading();
            console.log("=============pm10===========");
            console.log(data);
            if (data[0]!==null) {
                if (data.length > 1){
                    this.tickInterval = data.length / 2;
                }else {
                    this.tickInterval = 1;
                }

                for (let i = 0 ;i < data.length; i ++){

                    let  dt = new Date(data[i].time);
                    let xAxisDate = dt.toLocaleString();
                    // let yDateTime = dt.toUTCString();
                    xcategories.push(xAxisDate);
                    // this.YDateTimes.push(yDateTime);
                    let yAxisDate = data[i].pm10;
                    categoriesOfPm10.push(yAxisDate);
                }
                this.XCategoriesOfPm10 = xcategories;
                this.categoriesOfPm10 = categoriesOfPm10;
                this.QueryOfPm10Chart();
            }else {
                this.searchFail();
            }

        });

    }


    QueryOfConWaterLevel() {

        let  xcategories = [];
        let  categoriesOfLX = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);
        let url = this.httpService.getUrl()+"/getContinuationByPointID.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;
        console.log(body);
        let options = new RequestOptions({
            headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{

            if (data.warn === null) {
                this.searchFail();
            }else {
                //显示图表
                if (data.length > 1){
                    this.tickInterval = data.length / 2;
                }else {
                    this.tickInterval = 1;
                }
                for (var i = 0 ;i < data.length; i ++){

                    var  dt = new Date(data[i].dmonitorDate);
                    var xAxisDate = dt.toLocaleString();
                    xcategories.push(xAxisDate);
                    var yAxisDate = data[i].warn;
                    categoriesOfLX.push(yAxisDate);
                }
                this.Xcategories = xcategories;
                this.categoriesOfLX = categoriesOfLX;
                this.QueryOfLXChart();
            }

        });



    }

    QueryOfFixWaterLevel() {

        let  xcategories = [];
        let  categoriesOfGD = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);
        let url = this.httpService.getUrl()+"/getGDByPointID.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;
        console.log(body);
        let options = new RequestOptions({
            headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{
            console.log(data);
            if (data.status === null) {
                this.searchFail();
            }else {
                //显示图表
                if (data.length > 1){
                    this.tickInterval = data.length / 2;
                }else {
                    this.tickInterval = 1;
                }
                for (var i = 0 ;i < data.length; i ++){

                    var  dt = new Date(data[i].time);
                    var xAxisDate = dt.toLocaleString();
                    xcategories.push(xAxisDate);
                    var yAxisDate = data[i].status;
                    categoriesOfGD.push(yAxisDate);
                }
                this.Xcategories = xcategories;
                this.categoriesOfGD = categoriesOfGD;
                this.QueryOfGDChart();
            }

        });
    }

    QueryOfWell() {

        let xcategories = [];
        let categoriesOfWell = [];
        let startTime:String = this.startTime;
        let endTime:String = this.endTime;
        console.log(startTime +"   "+endTime);

        let url = this.httpService.getUrl()+"/getJGByPointID.do";
        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;
        console.log(body);
        let options = new RequestOptions({
            headers: headers
        });


        this.http.post(url,body,options).map(res =>res.json()).subscribe(data =>{
            //显示图表
            console.log(data);
            setTimeout(()=>{
                if (data.time!=null){
                    if (data.length > 1){
                        this.tickInterval = data.length / 2;
                    }else {
                        this.tickInterval = 1;
                    }

                    for (let i = 0 ;i < data.length; i ++){

                        console.log(data);
                        let dt = new Date(data[i].time);
                        let xAxisDate = dt.toLocaleString();
                        xcategories.push(xAxisDate);
                        let yAxisDate = data[i].status;
                        categoriesOfWell.push([xAxisDate,yAxisDate]);
                    }
                    this.Xcategories = xcategories;
                    this.categoriesOfWell = categoriesOfWell;
                    console.log(categoriesOfWell);
                    this.QueryOfWellChart();
                }else {
                    this.searchFail();
                }
            },2000);

        });

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
        let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;
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
                categoriesOfTemperature.push(yAxisDate);
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
        let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;
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
        let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;
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
        let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;    console.log(body);
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
        let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;
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
        let body = "pointId="+this.collectId+"&startTime="+startTime+"&endTime="+endTime;
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

    ngOnInit(){

    }

    QueryOfWellChart(){
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
                text: '单个数据采集点的井盖状态图',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                tickInterval:this.Xcategories.length / 2,
                categories:this.Xcategories
            },
            yAxis : {
                lineWidth: 1,
                title : {
                    text : '井盖状态'
                },
                gridLineWidth:0,
                labels: {
                    formatter:function(){
                        if(this.value ==0) {
                            return"关闭";
                        }else if(this.value ==1) {
                            return"打开";
                        }
                    }

                }
            },
            tooltip: {
                formatter: function() {
                    let yStatus = "关闭";
                    if(this.y==0){
                        yStatus="关闭";
                    }else if(this.y ==1) {
                        yStatus="打开";
                    }
                    return '<b>' + this.series.name + '</b><br/>时间：'+this.x +'<br/>井盖状态：'+ yStatus;
                }
            },
            plotOptions: {
                area: {
                    // fillColor: {
                    //     linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                    //     // stops: [
                    //     //     [0, this.highcharts.getOptions().colors[0]],
                    //     //     [1, highchart.Color(highchart.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    //     // ]
                    // },
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                           [0, 'rgb(51,161,201)'],
                           [1, 'rgba(51,161,201,0)']
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
                    step: true,
                    name: '数据采集点的井盖状态',
                    data: this.categoriesOfWell
                }]
        };
        if (this.chartEl && this.chartEl.nativeElement) {
            opts.chart = {
                type: 'line',
                renderTo: this.chartEl.nativeElement,
                zoomType: 'x',
                marginRight: 10,
                marginTop:20,
                spacingBottom: 0 ,
                position: {
                    x: 0,
                    y: -30
                }};
            this._chart = new HighCharts.Chart(opts);
            this._chart.redraw;
        }
    }


    QueryOfNoiseChart() {
        let opts: any = {

            lang: {
                resetZoom:"重置图片",
            },
            title: {
                text: '噪音统计',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                // type: 'datetime',
                //dateTimeLabelFormats:true,
                //tickInterval:this.XCategoriesOfNoise.length / 2 ,
                //showLastLabel:true,
                //categories:this.XCategoriesOfNoise
                type: 'datetime',
                tickInterval:this.XCategoriesOfNoise.length / 2,
                categories:this.XCategoriesOfNoise
            },
            yAxis : {
                floor: 30,
                ceiling: 200,
                title : {
                    text : '(dB)'
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
                    // fillColor: {
                    //     linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                    //     // stops: [
                    //     //     [0, this.highcharts.getOptions().colors[0]],
                    //     //     [1, highchart.Color(highchart.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    //     // ]
                    // },
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                           [0, 'rgb(51,161,201)'],
                           [1, 'rgba(51,161,201,0)']
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
                    name: '噪音',
                    data: this.categoriesOfNoise
                }]
        };




        if (this.chartOfNoiseEl && this.chartOfNoiseEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartOfNoiseEl.nativeElement,
                zoomType: 'x',
                marginRight: 10,
                marginTop:20,
                height:200 ,
                spacingBottom: 0 ,
              };
            this._chart = new HighCharts.Chart(opts);
            this._chart.redraw;
        }
    }

    QueryOfPm25Chart() {
        let opts: any = {

            lang: {
                resetZoom:"重置图片"
            },
            title: {
                text: '',
                align: 'center',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                // type: 'datetime',
                //dateTimeLabelFormats:true,
                //showLastLabel:true,
                //tickInterval:this.XCategoriesOfPm25.length / 2,
                //categories:this.XCategoriesOfPm25
                type: 'datetime',
                tickInterval:this.XCategoriesOfPm25.length / 2,
                categories:this.XCategoriesOfPm25
            },
            yAxis : {
                min : 0,
                title : {
                    text: 'Pm2.5'
                },
                plotLines : [
                    {
                        value : 0,
                        width : 1,
                        color : '#808080'
                    },
                    {
                        color:'#00E400',            //线的颜色，定义为红色
                        //dashStyle:'solid',     //默认是值，这里定义为长虚线
                        value:35,              //定义在那个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
                        width:1,               //标示线的宽度，2px
                        label:{
                            text:'一级（优）',     //标签的内容
                            align:'left',                //标签的水平位置，水平居左,默认是水平居中center
                            x:10,                         //标签相对于被定位的位置水平偏移的像素，重新定位，水平居左10px
                            style:{
                                fontSize:'12px',
                            }
                        }
                    },
                    {
                        color:'#FFFF00',
                        value:75,
                        width:1,
                        label:{
                            text:'二级（良）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',

                            }
                        }
                    },
                    {
                        color:'#FF7E00',
                        value:115,
                        width:1,
                        label:{
                            text:'三级（轻度污染）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',

                            }
                        }
                    },
                    {
                        color:'#FF0000',
                        value:150,
                        width:1,
                        label:{
                            text:'四级（中度污染）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',
                                //fontWeight:'bold'
                            }
                        }
                    },
                    {
                        color:'#99004C',
                        value:250,
                        width:1,
                        label:{
                            text:'五级（重度污染）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',
                                //fontWeight:'bold'
                            }
                        }
                    },
                    {
                        color:'#7E0023',
                        value:500,
                        width:1,
                        label:{
                            text:'六级（严重污染）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',
                                //fontWeight:'bold'
                            }
                        }
                    }
                ]
            },
            plotOptions: {
                area: {
                    // fillColor: {
                    //     linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                    //     // stops: [
                    //     //     [0, highchart.getOptions().colors[0]],
                    //     //     [1, highchart.Color(highchart.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    //     // ]
                    // },
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                           [0, 'rgb(51,161,201)'],
                           [1, 'rgba(51,161,201,0)']
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
            // tooltip :
            //     {
            //         formatter : function()
            //         {
            //             return this.x + '</br>'
            //                 + highchart.numberFormat(this.y, 2);
            //         }
            //     },
            series:
                [{
                    type: 'area',
                    name: 'PM2.5',
                    data: this.categoriesOfPm25
                }]
        };
        if (this.chartOfPM25El && this.chartOfPM25El.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartOfPM25El.nativeElement,
                zoomType: 'x',
                marginRight: 10,
                marginTop:20,
                height:200 ,
                spacingBottom: 0            };
            this._chart = new HighCharts.Chart(opts);
            this._chart.redraw;
        }
    }

    QueryOfPm10Chart() {
        let opts: any = {

            lang: {
                resetZoom:"重置图片"
            },
            title: {
                text: '',
                align: 'center',
                // x: -20
            },
            xAxis: {
                type: 'datetime',
                tickInterval:this.XCategoriesOfPm10.length / 2,
                categories:this.XCategoriesOfPm10
            },
            yAxis : {
                min : 0,
                title : {
                    text: '（um/m³）',
                    align: 'center',
                },
                plotLines : [
                    {
                        value : 0,
                        width : 1,
                        color : '#808080'
                    },{
                        color:'#00E400',            //线的颜色，定义为红色
                        //dashStyle:'solid',     //默认是值，这里定义为长虚线
                        value:35,              //定义在那个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
                        width:1,               //标示线的宽度，2px
                        label:{
                            text:'一级（优）',     //标签的内容
                            align:'left',                //标签的水平位置，水平居左,默认是水平居中center
                            x:10,                         //标签相对于被定位的位置水平偏移的像素，重新定位，水平居左10px
                            style:{
                                fontSize:'12px',
                                //fontWeight:'bold'
                            }
                        }
                    },
                    {
                        color:'#FFFF00',
                        value:75,
                        width:1,
                        label:{
                            text:'二级（良）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',
                                //fontWeight:'bold'
                            }
                        }
                    },
                    {
                        color:'#FF7E00',
                        value:115,
                        width:1,
                        label:{
                            text:'三级（轻度污染）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',
                                //fontWeight:'bold'
                            }
                        }
                    },
                    {
                        color:'#FF0000',
                        value:150,
                        width:1,
                        label:{
                            text:'四级（中度污染）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',
                                //fontWeight:'bold'
                            }
                        }
                    },
                    {
                        color:'#99004C',
                        value:250,
                        width:1,
                        label:{
                            text:'五级（重度污染）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',
                                //fontWeight:'bold'
                            }
                        }
                    },
                    {
                        color:'#7E0023',
                        value:500,
                        width:1,
                        label:{
                            text:'六级（严重污染）',
                            align:'left',
                            x:10,
                            style:{
                                fontSize:'12px',
                                //fontWeight:'bold'
                            }
                        }
                    }
                ]
            },
            plotOptions: {
                area: {
                    // fillColor: {
                    //     linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                    //     // stops: [
                    //     //     [0, highchart.getOptions().colors[0]],
                    //     //     [1, highchart.Color(highchart.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    //     // ]
                    // },
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                           [0, 'rgb(51,161,201)'],
                           [1, 'rgba(51,161,201,0)']
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
            // tooltip :
            //     {
            //         formatter : function()
            //         {
            //             return this.x + '</br>';
            //                 // + this.highcharts.numberFormat(this.y, 2);
            //         }
            //     },
            series:
                [{
                    type: 'area',
                    name: 'Pm10',
                    data: this.categoriesOfPm10
                }]
        };
        if (this.chartOfPm10El && this.chartOfPm10El.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartOfPm10El.nativeElement,
                zoomType: 'x',
                spacingBottom: 0,
                marginTop:20,
                height:200 ,
                marginRight : 10,
            };
            // this._chart = this.highcharts;
            this._chart = new HighCharts.Chart(opts);
            // this.QueryOfPm10();
            this._chart.redraw;
        }
    }

    QueryOfGDChart() {
        let opts: any = {

            lang: {
                resetZoom:"重置图片"
            },
            title: {
                text: '固定水位',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                categories:this.Xcategories
            },

            yAxis : {
                lineWidth: 1,
                title : {
                    text : '固定设备状态'
                },
                gridLineWidth:0,
                labels: {
                    formatter:function(){
                        if(this.value ==0) {
                            return"正常";
                        }else if(this.value ==1) {
                            return"报警";
                        }
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    let yStatus = "";
                    if(this.y==0){
                        yStatus="正常";
                    }else if(this.y ==1) {
                        yStatus="报警";
                    }
                    return '<b>' + this.series.name + '</b><br/>时间：'+this.x +'<br/>固定设备状态：'+ yStatus;
                }
            },
            series:
                [{
                    step: true,
                    name: '数据采集点的固定设备状态',
                    data: this.categoriesOfGD
                }]
        };
        if (this.chartEl && this.chartEl.nativeElement) {
            opts.chart = {
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
    }

    QueryOfLXChart() {
        let opts: any = {

            lang: {
                resetZoom:"重置图片",
            },
            title: {
                text: '连续水位实时数据',
                align: 'center',
                verticalAlign: 'bottom',
                // x: -20
            },
            credits : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                categories:this.Xcategories
            },
            yAxis : {
                floor: 30,
                ceiling: 200,
                title : {
                    text : '连续水位值(m)'
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
                    name: '连续水位',
                    data: this.categoriesOfLX
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
                            [0, 'rgb(51,161,201)'],
                            [1, 'rgba(51,161,201,0)']
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
        if (this.chartOfAirTemperEl && this.chartOfAirTemperEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartOfAirTemperEl.nativeElement,
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
                    data: this.categoriesOfLX
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
                            [0, 'rgb(51,161,201)'],
                            [1, 'rgba(51,161,201,0)']
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
        if (this.chartOfAirHumEl && this.chartOfAirHumEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartOfAirHumEl.nativeElement,
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
                    data: this.categoriesOfLX
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
        if (this.chartOfInclinEl && this.chartOfInclinEl.nativeElement) {
            opts.chart = {
                type: 'spline',
                renderTo: this.chartOfInclinEl.nativeElement,
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
                            [0, 'rgb(51,161,201)'],
                            [1, 'rgba(51,161,201,0)']
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
                    data: this.categoriesOfLX
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

    showchartOfAirTemper(){
        this.AirTempButton=false;
        this.isAirTemperDisplay=true;
        this.QueryOfPm25();
    }

    showchartOfAirHum(){
        this.AirHumButton=false;
        this.isAirHumDisplay=true;
        this.QueryOfPm10();
    }




}
