
export default class Time {

  constructor() {
    this.monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    this.monthsAbrev = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY',
      'JUN', 'JUL', 'AUG', 'SEP', 'OCT',
      'NOV', 'DEC'
    ];
  }

  formatDate(date, showTime=false, abr=false) {
    if (typeof date == "string" || typeof date == "number") {
      date = new Date(date);
    }

    const day = date.getDate();
    const month = abr ? this.monthsAbrev[date.getMonth()] :
      this.monthNames[date.getMonth()];
    const year = date.getFullYear();

    return day + ' ' + month + ' ' + year + 
      ( showTime ? ', ' + this._getTime(date) : '' );
  }

  // str version of history
  formatHistoryDate(date) {
    if (typeof date == "string" || typeof date == "number") {
      date = new Date(date);
    }
    const day = date.getDate();
    const month = this.monthsAbrev[date.getMonth()];
    return month + ' ' + day + ' ' + this._getTime(date);
  }

  _getTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let mid = 'AM';

    if (hours == 0) { //At 00 hours we need to show 12 am
      hours = 12;
    } else if (hours > 12) {
      hours = hours % 12;
      mid = 'PM';
    }

    if (hours < 10) {
      hours = `0${hours}`;
    }
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    return hours + ":" + minutes + mid;
  }

  getTimeInfo(date) {
    if (typeof date == "string" || typeof date == "number") {
      date = new Date(date);
    }

    const monthIndex = date.getMonth();
    
    return {
      time: this._getTime(date),
      year: date.getFullYear(),
      day: date.getDate(),
      month: this.monthNames[monthIndex],
      monthAbbr: this.monthsAbrev[monthIndex],
    }
  }

}
