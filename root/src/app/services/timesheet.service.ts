import { Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root',
})

export class TimeSheet{

  startTask(task: any) {
    if (task.isRunning) return;

    return {
    ...task,
    isRunning: true,
    startTime: Date.now(),
    totalTime: task.totalTime || 0
  };
  }

  stopTask(task: any) {
    if (!task.isRunning) return;

    const now = Date.now();
    const diff = now - task.startTime;

    return {
    ...task,
    isRunning: false,
    startTime: null,
    totalTime: (task.totalTime || 0) + diff,
    logs: [
      ...(task.logs || []),
      {
        startTime: task.startTime,
        endTime: now,
        duration: diff
      }
    ]
  };
  }


  checkPoint(task: any) {
    if (!task.isRunning) return;

    const now = Date.now();
    const diff = now - task.startTime;

    return {
    ...task,
   
    totalTime: (task.totalTime || 0) + diff,
    startTime: task.startTime,
   
  };
  }





  getDisplayTime(task: any): number {
    if (task.isRunning) {
      let total = task.totalTime || 0;
      return total += (Date.now() - task.startTime);
    }
    return task.totalTime;
  }

  formatTime(ms: number) {

    if (!ms || ms < 0 || isNaN(ms)) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const min = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const sec = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${min}:${sec}`;
  }

}
