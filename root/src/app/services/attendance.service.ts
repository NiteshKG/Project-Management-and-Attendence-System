import { Injectable } from "@angular/core";
import { Project } from "./project.service";

@Injectable({
  providedIn: 'root',
})

export class AttendanceService{
  constructor(private project : Project){};
  startDay(){
    const startTime = Date.now();
    const email = this.project.getCurrentUserEmail();
    if (!email) return;
    const key = `attendanceStart_${email}`;
    localStorage.setItem(key, startTime.toString());
  }
 
  endDay(){
    const email = this.project.getCurrentUserEmail();
    if (!email) return;
    const key = `attendanceStart_${email}`; 
    const start = localStorage.getItem(key);
    if(!start) 
      return null;
    const end = Date.now();
    const durationms = end - Number(start);
    const record = {
      date: new Date().toLocaleString(),
      
      duration: this.formatTime(durationms),
      status: durationms > 0 ? true : false
    }
    
    const key1 = `attendanceRecords_${email}`; 
    const old = JSON.parse(localStorage.getItem(key1) || '[]' );
    old.push(record);
    localStorage.setItem(key1,JSON.stringify(old));

    localStorage.removeItem(key);

    return record;

  }

  formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const min = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const sec = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${min}:${sec}`;
  }

  isDayRunning() {
    const email = this.project.getCurrentUserEmail();
    if (!email) return false;
    const key = `attendanceStart_${email}`;
    return !!localStorage.getItem(key);
  }

}