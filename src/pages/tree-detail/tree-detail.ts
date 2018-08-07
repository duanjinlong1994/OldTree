import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Headers, RequestOptions, Http} from '@angular/http';
import { HttpService } from '../../providers/http-service/http-service';
import { TreeDetail } from '../../model/TreeDetail';
/**
 * Generated class for the TreeDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-tree-detail',
  templateUrl: 'tree-detail.html',
})
export class TreeDetailPage {


  treeInfoDetail: TreeDetail;
  oldtreeinfoId: any;
  age: any;
  status: any;
  height: any;
  diameter: any;
  avgcrown: any;
  sncrown: any;
  ewcrown: any;
  recordingtime: any;
  blorg: string;
  number: any;
  cname: string;
  nickname: string;
  lname: string;
  sectionname: string;
  genusname: string;
  address: any;
  level: any;
  type: string;
  altitude: any;
  createtime: any;
  orgId: number;
  longitude: string;
  latitude: string;
  treeId: any;
  item: any;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public httpService: HttpService,
              public http: Http,
  ) {
    this.treeId = this.navParams.data['treeInfoId'];
    this.getTreeInfoById(this.treeId);
  }

  ionViewDidLoad() {


  }

  getTreeInfoById(treeid: any) {
    let url = this.httpService.getUrl()+"/getTreeInfo.do";
    let body= "treeId="+treeid;

    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'
    });
    let options = new RequestOptions({
      headers: headers
    });
    this.http.post(url,body,options).map(res =>res.json()).subscribe(data => {
        console.log(data);
        if(data != null) {
          this.number = data['number'];
          this.type = data['type'];
          this.level = data['level'];
          this.cname = data['cname'];
          this.nickname = data['nickname'];
          this.lname = data['lname'];
          this.latitude = data['latitude'];
          this.longitude = data['longitude'];
          this.sectionname = data['sectionname'];
          this.genusname = data['genusname'];
          this.address = data['adress'];
          this.altitude = data['altitude'];
          this.createtime = data['createtime'];
          this.blorg = data['blorg'];
          this.diameter = data['diameter'];
          this.avgcrown = data['avgcrown'];
          this.sncrown = data['sncrown'];
          this.recordingtime = data['recordingtime'];
        }
    });
  }

}
