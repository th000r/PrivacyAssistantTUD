
class GlobalTimer {
     time_limit = 180;
     timePassed = 0;
     timeLeft = 0;
     timerInterval = null;
     site = ""

     // get passed time from local storage if a new object is created
     // should be called by every html page to track the passed time across multiple sites
     constructor(site = "", time_limit = 180) { 
        this.site = site;
        this.time_limit = time_limit

        if (localStorage.getItem("timePassed" + site) === null) {
          localStorage.setItem("timePassed" + site, JSON.stringify(0));
          this.timePassed = 0;
        } else {
            this.timePassed = JSON.parse(localStorage.getItem("timePassed" + site));
        }

        if (localStorage.getItem("timeOnPageStart") === null) {
          localStorage.setItem("timeOnPageStart", JSON.stringify(0));
        }

        this.resumeTimer();
    }
  

     // tracks and stores the passed time
     resumeTimer() {
          this.timerInterval = setInterval(() => {
            this.timePassed += 1;
            localStorage.setItem("timePassed" + this.site, JSON.stringify(this.timePassed));
            this.timeLeft = this.time_limit - this.timePassed;

            if (this.timeLeft <= 0) {
              this.globalTimerListener.a = this.timeLeft;
              clearInterval(this.timerInterval);
            }

          }, 1000);
     }

     globalTimerListener = {
          aInternal: this.timeLeft,
          aListener: function(val) {},
          set a(val) {
            this.aInternal = val;
            this.aListener(val);
          },
          get a() {
            return this.aInternal;
          },
          registerListener: function(listener) {
            this.aListener = listener;
          }
        }

     debugTimer() {
          console.log(this.timeLeft);
     }
}