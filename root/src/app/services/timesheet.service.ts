import { Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root',
})

export class TimeSheet{
  
  startTask(task: any) {
    if (task.isRunning) return;

    task.isRunning = true;
    task.startTime = Date.now();
  }

  stopTask(task: any) {
    if (!task.isRunning) return;

    const now = Date.now();
    const diff = now - task.startTime;

    task.elapsedTime += diff;

    const newLog = {
      start: task.startTime,
      end: now,
      duration: diff
    };

    const logs = task.logs || [];
    logs.push(newLog);
    task.logs = logs;

    task.startTime = null;
    task.isRunning = false;
  }

  


  getDisplayTime(task: any): number {
    if (task.isRunning) {
      return task.elapsedTime + (Date.now() - task.startTime);
    }
    return task.elapsedTime;
  }

  formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const min = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const sec = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${min}:${sec}`;
  }

}