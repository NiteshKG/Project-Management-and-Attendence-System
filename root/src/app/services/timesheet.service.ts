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
  if (!task.isRunning) return task;

  const now = Date.now();
  
  
  let startTimeMs: number;
  if (typeof task.startTime === 'string') {
    startTimeMs = new Date(task.startTime).getTime();
  } else if (typeof task.startTime === 'number') {
    startTimeMs = task.startTime;
  } else {
    console.error('Invalid startTime in timesheet:', task.startTime);
    return task;
  }
  
  const elapsed = now - startTimeMs;
  const previousTotal = Number(task.totalTime) || 0;
  const newTotal = previousTotal + elapsed;
  
  
  
  return {
    ...task,
    isRunning: false,
    startTime: null,
    totalTime: newTotal,
    logs: [
      ...(task.logs || []),
      {
        startTime: task.startTime, 
        endTime: new Date(), 
        duration: elapsed
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
