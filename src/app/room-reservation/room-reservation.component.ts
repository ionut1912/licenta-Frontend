import { FormControl } from '@angular/forms';
import { TransferService } from './../_services/TransferService.service';

import { RoomService } from './../_services/RoomService.service';

import { ImageService } from './../_services/ImageService.service';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Room } from '../clases/Room';
import { FnParam } from '@angular/compiler/src/output/output_ast';




@Component({
  selector: 'app-room-reservation',
  templateUrl: './room-reservation.component.html',
  styleUrls: ['./room-reservation.component.css']
})
export class RoomReservationComponent implements OnInit {

  constructor(private route:ActivatedRoute,private roomService:RoomService,private TransferService:TransferService) { }
  roomid!: number;
  rooms!: Room;
  checkin!: Date;
  checkout!: Date;
  date1!: FormControl;
  date2!: FormControl;

 ngOnInit():void{

    this.roomid = this.route.snapshot.params['id'];

    this.rooms=new Room();
    this.roomService.findAllById(this.roomid).subscribe(room=>{
      this.rooms=room;
    });
 
   this.date1=new FormControl(new Date(this.getCheckin()));
  this.date2=new FormControl(new Date(this.getCheckout()));
  }
 

 getCheckin():Date{
  this.checkin=this.TransferService.checkin;
  return this.checkin;
}
getCheckout():Date{
  this.checkout=this.TransferService.checkout;
  return this.checkout;
}
}