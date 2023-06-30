class Api {

    baseUrl = "https://www.soscisurvey.de/"
    // name of the SoSciSurvery Project
    projectName = ""
    // case token
    ct = ""
    // "cb" (cookiebanner) or "ea" (einwilligungsassistent)
    type = ""
    constructor(ct, projectName, type) {
        if (localStorage.getItem("ct") === null || localStorage.getItem("ct") === "null") {
            this.ct = ct;
            localStorage.setItem("ct", ct);
        } else {
            this.ct = localStorage.getItem("ct");
        }

        if (localStorage.getItem("proj") === null) {
            this.projectName = projectName;
            localStorage.setItem("proj", projectName);
        } else {
            this.projectName = localStorage.getItem("proj");
        }

        this.type == type;
    }

    // send data and redirect to soscisurvery
    sendDataPost(method='POST') {
        let cookie_state = JSON.parse(localStorage.getItem("cookie_state"));
        let interaction_page_2 = JSON.parse(localStorage.getItem("interaction_page_2"));
        let interaction_page_1 = JSON.parse(localStorage.getItem("interaction_page_1"));
        let clicked_page_2 = JSON.parse(localStorage.getItem("clicked_page_2"));
        let clicked_page_3 = JSON.parse(localStorage.getItem("clicked_page_3"));

        let time_on_page_1 = JSON.parse(localStorage.getItem("timeOnPage1"));
        if (time_on_page_1 === null) {
            time_on_page_1 = 0;
        }

        let time_on_page_2 = JSON.parse(localStorage.getItem("timeOnPage2"));
        if (time_on_page_2 === null) {
            time_on_page_2 = 0;
        }

        // create form and send result to soscisurvey
        const form = document.createElement('form');
        form.method = method;
        form.action = this.baseUrl + this.projectName + "/index.php?i=" + this.ct


        // names of the internal variables in SoSciSurvery
        //Cookiebanner
        const hf1 = document.createElement('input');
        const hf2 = document.createElement('input');
        const hf3 = document.createElement('input');
        const hf4 = document.createElement('input');
        const hf5 = document.createElement('input');
        const hf6 = document.createElement('input');
        const hf7 = document.createElement('input');
        const hf8 = document.createElement('input');
        const hf9 = document.createElement('input');
        const hf10 = document.createElement('input');
        const hf11 = document.createElement('input');
        const hf12 = document.createElement('input');
        const hf13 = document.createElement('input');
        hf1.type = 'hidden';
        hf2.type = 'hidden';
        hf3.type = 'hidden';
        hf4.type = 'hidden';
        hf5.type = 'hidden';
        hf6.type = 'hidden';
        hf7.type = 'hidden';
        hf8.type = 'hidden';
        hf9.type = 'hidden';
        hf10.type = 'hidden';
        hf11.type = 'hidden';
        hf12.type = 'hidden';
        hf13.type = 'hidden';

        // Einwilligungsassistent
        //ToDo: get more values
        // toggle button values
        hf1.name = "ea-user-preferences";
        hf2.name = "ea-statistics-improvement";
        hf3.name = "ea-personalization-website"
        hf4.name = "ea-personalization-advertisement"

        //ToDo: Set correct values for each hf
        hf1.value = JSON.stringify(JSON.parse(localStorage.getItem(hf1.name)));
        hf2.value = JSON.stringify(JSON.parse(localStorage.getItem(hf2.name)));
        hf3.value = JSON.stringify(JSON.parse(localStorage.getItem(hf3.name)));
        hf4.value = JSON.stringify(JSON.parse(localStorage.getItem(hf4.name)));

        // Cookie Banner
        //ToDo: get more values
    
        // total time spent on cb page
        hf5.name = "cb-total-time"

        hf5.value = JSON.stringify(JSON.parse(localStorage.getItem("timePassedcb")));


        // append hidden fields to form
        form.appendChild(hf1);
        form.appendChild(hf2);
        form.appendChild(hf3);
        form.appendChild(hf4);

        document.body.appendChild(form);

        // clear local storage before sending the data
        localStorage.clear();
        // send data to soscisurvey
        form.submit();
    }
}