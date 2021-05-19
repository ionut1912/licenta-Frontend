import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {ReservationService} from '../_services/ReservationService.service';
import {TokenStorageService} from '../_services/token-storage.service';
import {UserService} from '../_services/UserService.service';
import {UserData} from '../clases/UserData';
import {Reservation} from '../clases/Reservation';

import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DialogDataExampleDialog} from '../userdata/userdata.component';



export interface EditRezervationData {
  rezervationId:number,
  Name:string;
  Email:string;
  RoomType:string;
  Checkin:Date;
  Checkout:Date,
  dataSource:MatTableDataSource<Reservation>

}
export interface DeleteReervationData {
  rezervationId:number,
  dataSource:MatTableDataSource<Reservation>
}
@Component({
  selector: 'app-view-reservations',
  templateUrl: './view-reservations.component.html',
  styleUrls: ['./view-reservations.component.css']
})
export class ViewReservationsComponent implements OnInit {
  userDetails: UserData = new UserData();
  columns: string[] = ['reservationid','name', 'email', 'roomtype', 'checkin', 'checkout', 'action'];
  rezervationInfo: Reservation[] = [];
  reservation:Reservation=new Reservation();
  date1:FormControl[]=[];
  date2:FormControl[]=[];
  constructor(private  reservationService: ReservationService, private  tokenStorage: TokenStorageService, private  userService: UserService,public  dialog:MatDialog) {

  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  id!: number;
  rezervationNotDeleted:Reservation[]=[];

  public dataSource=new MatTableDataSource<Reservation>();

  ngOnInit(): void {
    this.userService.getUserData(this.tokenStorage.getUsername()).subscribe(userInfo => {
      this.userDetails = userInfo;

      this.reservationService.getRezervationByUserId(this.userDetails.userid).subscribe(rezervation => {
        this.rezervationInfo=rezervation;
        this.rezervationNotDeleted= this.rezervationInfo.filter(x=>!x.deleted);

        this.dataSource = new MatTableDataSource(this.rezervationNotDeleted);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

      });


    });
  }




  edit(id: number, name: string, email:string , roomtype: string, checkin: Date, checkout: Date): void {
    this.id = id;
    this.reservation=<Reservation> {
      rezervationid: this.id,
      name: name,
      email: email,
      roomtype: roomtype,
      checkin: checkin,
      checkout: checkout
    };
    const dialogRef=this.dialog.open(EditRezervationComponent,{
      data:{
        rezervationId:id,
        Name:name,
        Email:email,
        RoomType:roomtype,
        Checkin:checkin,
        Checkout:checkout,
        dataSource:this.dataSource


      }

    });
dialogRef.afterClosed().subscribe(information=>{

  this.dataSource=new MatTableDataSource(information);
});


  }

  delete(rezervationid: number) {
    this.id=rezervationid;
    const dialogRef=this.dialog.open(DeleteRezervationComponent,{
      data:{
        rezervationId:rezervationid,
        dataSource:this.dataSource
      }

    });
    dialogRef.afterClosed().subscribe(information=> {

      this.dataSource = new MatTableDataSource(information);
    });
  }




}

@Component({
  selector: 'edit-rezervation',
  templateUrl: 'edit-rezervation.html',
})

export class EditRezervationComponent {
  date1!: FormControl;
  date2!: FormControl;
  rezervation: Reservation=new Reservation();
  rezervations:Reservation[]=[];
  user:UserData=new UserData();
  constructor(public dialogRef: MatDialogRef<ViewReservationsComponent>, @Inject(MAT_DIALOG_DATA) public data: EditRezervationData,public userService:UserService, public  rezervationService: ReservationService, public dialog: MatDialog,public  tokenStorage:TokenStorageService) {
    this.date1 = new FormControl(new Date(data.Checkin));
    this.date2 = new FormControl(new Date(data.Checkout));

  }
  onSubmit(): void{
    this.rezervation = <Reservation> ({
      name: this.data.Name,
      email: this.data.Email,
      roomtype: this.data.RoomType,
      checkin: new Date(this.date1.value),
      checkout: new Date(this.date2.value)
    });


    this.rezervationService.modifyRezervation(this.data.rezervationId, this.rezervation).subscribe(rezdata=>{
      this.refresh();
      this.dialogRef.close();

      const dialogRef2 = this.dialog.open(DialogDataExampleDialog, {
        data: {
          text: 'Rezervarea',
          text2: 'modificata',
          text3: 'a',
          dataSource:this.data.dataSource
        }
      });

    });

  }
refresh():void{
    this.userService.getUserData(this.tokenStorage.getUsername()).subscribe(userInformation=> {
      this.user = userInformation;
this.rezervationService.getRezervationByUserId(this.user.userid).subscribe(rezervationInfo=>{
  this.data.dataSource=new MatTableDataSource(rezervationInfo);
    });
    });
}

}
@Component({
  selector: 'delete-rezervation',
  templateUrl: 'delete-rezervation.html',
})

export class DeleteRezervationComponent {
  rezervation: Reservation = new Reservation();
  user: UserData = new UserData();

  constructor(public userService: UserService, public tokenStorage: TokenStorageService, public dialogRef: MatDialogRef<ViewReservationsComponent>, @Inject(MAT_DIALOG_DATA) public data: DeleteReervationData, public dialog1: MatDialog, public  rezervationService: ReservationService) {


  }


  nu(): void {
    this.dialogRef.close();
  }

  da(): void {

    this.rezervation = <Reservation> ({
      rezervationid: this.data.rezervationId
    });
    this.rezervationService.deleteRezervation(this.data.rezervationId, this.rezervation).subscribe(() => {
      this.refresh();
      this.dialogRef.close();
      const ref = this.dialog1.open(DialogDataExampleDialog, {
        data: {
          text: 'Rezervarea',
          text2: 'stearsa',
          text3: 'a'
        }
      });
    });
  }

  refresh(): void {
    this.userService.getUserData(this.tokenStorage.getUsername()).subscribe(userInformation => {
      this.user = userInformation;
      this.rezervationService.getRezervationByUserId(this.user.userid).subscribe(rezervationInfo => {
        this.data.dataSource = new MatTableDataSource(rezervationInfo);
      });
    });
  }
}



