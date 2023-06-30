class Record {
    cookie_config = null;
    purpose_config = null;
    elements = [];
    id_endings = new Enums().id_endings;
    interaction_type = new Enums().interaction_type;

    constructor(page = 1, cookie_config, purpose_config) {
        if (cookie_config !== null) {
            this.cookie_config = cookie_config;
        }

        if (purpose_config !== null) {
            this.purpose_config = purpose_config;
        }

        let click_elements = ["a", "span", "button", "input"];

        // init local storage object
        let records = localStorage.getItem("records");
        if (records == null) {
            let main_entry = new RecordMainEntry()
            localStorage.setItem("records", JSON.stringify(main_entry["entry"]));
        }

        // convert the element lists to a single array
        if (cookie_config !== null) {
            click_elements.forEach(select => {
                let elements = $("#include-cookie " + select);
                this.elements = this.elements.concat([...elements]);
            });
        } else if (purpose_config !== null) {
            click_elements.forEach(select => {
                let elements = $("#include-cookie-detail " + select);
                this.elements = this.elements.concat([...elements]);
            });
        }


        // add click listener to all elements
        this.elements.forEach(elem => {
            if (!elem.className.includes("no-click")) {
                let that = this;
                elem.addEventListener('click', function handleClick(event) {
                    event.stopImmediatePropagation(); // stop click event propagation to prevent multiple records for one click
                    let record = that.new_record(this, event, page);
                    that.push_records(record);
                });
            }

            if (elem.className.includes("accordion-info-button")) {
                let that = this;
                elem.addEventListener('mouseenter', function handleClick(event) {
                    event.stopImmediatePropagation(); // stop click event propagation to prevent multiple records for one click
                    let record = that.new_record(this, event, page);
                    that.push_records(record);
                });
            }
        }); 
    }

    push_records(record) {
        let records = JSON.parse(localStorage.getItem("records"));
        records["records"].push(record);
        localStorage.setItem("records", JSON.stringify(records));
        console.log(records);
    }

    new_record(elem, event, page) {
        let viewport = this.get_viewport_dimensions();
        let accordion = this.get_accordion_attributes(elem);
        let toggle = this.get_switch_attributes(elem);
        let time_passed = JSON.parse(localStorage.getItem("timePassed"));
        let id = JSON.parse(localStorage.getItem("last_id"));

        let purpose = null;
        let service = null;
        let accept = null;
        let cookie_status = null;
        
        let interaction_page_2 = null;
        let interaction_page_1 = null;
        let clicked_page_2 = null;
        let clicked_page_3 = null;

        if (id == null) {
            id = 0;
        } else {
            id += 1
        }
        localStorage.setItem("last_id", id);
        
        if (elem.className.includes("accordion-footer-button")) {
            accept = this.get_accept_state(elem.id);
            cookie_status = {};

            interaction_page_2 = JSON.parse(localStorage.getItem("interaction_page_2"));
            interaction_page_1 = JSON.parse(localStorage.getItem("interaction_page_1"));
            clicked_page_2 = JSON.parse(localStorage.getItem("clicked_page_2"));
            clicked_page_3 = JSON.parse(localStorage.getItem("clicked_page_3"));

            for (let purpose of this.cookie_config["purpose"]) {
                let service_status = {};
                let purpose_switch_id = "#$id$-purpose-switch".replace("$id$", purpose["id"]);
                let purpose_general_switch_id = "#$id$-general-switch".replace("$id$", purpose["id"]);
    
                let purpose_state =	$(purpose_switch_id).prop('checked');
                cookie_status[purpose["id"]] = purpose_state;

                let purpose_general_state =	$(purpose_general_switch_id).prop('checked');
                cookie_status[purpose["id"] + "-services-general"] = purpose_general_state;

                for (let service of purpose["services"]) {
                    let service_switch_id = "#$id$-service-switch".replace("$id$", service["id"]);
                    let service_state = $(service_switch_id).prop('checked');
                    service_status[service["id"]] = service_state;
                }
                cookie_status[purpose["id"] + "-services"] = JSON.parse(JSON.stringify(service_status));
            }

            localStorage.setItem("cookie_state", JSON.stringify(cookie_status));
        } else if (this.cookie_config !== null) {
            purpose = this.get_purpose(elem.id);
        } else if (this.purpose_config !== null) {
            purpose = this.purpose_config["title"];
            service = this.get_service(elem.id);
        }

        let interaction_type = this.get_interaction_type(toggle.state);
        
        //let entry = new RecordEntry(id, time_passed, elem.baseURI, elem.id, elem.tagName, elem.className, accordion.data_target, accordion.state, toggle.state, event.pageX, event.pageY, event.clientX, event.clientY, viewport.x, viewport.y);
        let entry = new RecordEntry(id, time_passed, page, interaction_type, purpose, service, toggle.state, accept, null, null, null, null, null);

        return entry["entry"];
    }

    get_accept_state(id) {
        if (id === "btn-accept-current") {
            return "Speichern";
        } else if (id === "btn-accept-all") {
            return "Alle annehmen";
        } else if (id === "btn-reject-all") {
            return "Alle ablehnen";
        }
    }

    get_purpose(id) {
        let returnVal = id;

        if (id.includes(this.id_endings.PURPOSE_SWITCH)) {
            id = id.replace(this.id_endings.PURPOSE_SWITCH, "");
        } else if (id.includes(this.id_endings.ACCORDION_BUTTON)) {
            id = id.replace(this.id_endings.ACCORDION_BUTTON, "");
        } else if (id.includes(this.id_endings.ACCORDION_CARET_BUTTON)) {
            id = id.replace(this.id_endings.ACCORDION_CARET_BUTTON, "");
        } 

        this.cookie_config["purpose"].forEach((purpose) => {
            if (id === purpose["id"]) {
                returnVal = purpose["title"];
            }
        });

        return returnVal;
    }


    get_service(id) {
        let returnVal = id;

        if (id.includes(this.id_endings.GENERAL_SWITCH)) {
            id = id.replace(this.id_endings.GENERAL_SWITCH, "");
        } else if (id.includes(this.id_endings.SERVICE_SWITCH)) {
            id = id.replace(this.id_endings.SERVICE_SWITCH, "");
        } else if (id.includes(this.id_endings.ACCORDION_BUTTON)) {
            id = id.replace(this.id_endings.ACCORDION_BUTTON, "");
        } else if (id.includes(this.id_endings.ACCORDION_CARET_BUTTON)) {
            id = id.replace(this.id_endings.ACCORDION_CARET_BUTTON, "");
        } else if (id.includes(this.id_endings.SERVICE_DETAIL_BUTTON, "")) {
            id = id.replace(this.id_endings.SERVICE_DETAIL_BUTTON, "");
        }

        this.purpose_config["services"].forEach((service) => {
            if (id === service["id"]) {
                returnVal = service["name"];
            }
        });

        if (this.purpose_config["id"] === id) {
            returnVal = "Alle";
        }

        return returnVal;
    }

    get_interaction_type(state) {
        if (state === null) {
            return this.interaction_type.CLICK;
        } else {
            return this.interaction_type.TOGGLE;
        }
    }

    get_viewport_dimensions() {
        let viewport = { x: 0, y: 0 };
        let html = $("html")[0];
        viewport.x = html.clientWidth;
        viewport.y = html.clientHeight;

        return viewport;
    }

    get_accordion_attributes(elem) {
        let accordion = { data_target: null, state: null };

        if (elem.attributes["data-bs-target"] != null && elem.attributes["data-bs-target"] != undefined) {
            accordion.data_target = elem.attributes["data-bs-target"].value;
        }

        if (elem.attributes["aria-expanded"] != null && elem.attributes["aria-expanded"] != undefined) {
            accordion.state = elem.attributes["aria-expanded"].value;
        }

        return accordion;
    }

    get_switch_attributes(elem) {
        let toggle = { state: null };

        if (elem.checked != null && elem.checked != undefined) {
            toggle.state = elem.checked;
        }

        return toggle;
    }
}

class RecordEntry {
    /*
    entry = {
        id: 0,
        time: 0,
        url: "",
        element: {
            id: null,
            tag: null,
            class: null,
            accordion: {
                data_target: null,
                state: null
            },
            switch: {
                state: null
            }
        },
        mouse: {
            page_x: 0,
            page_y: 0,
            client_x: 0,
            client_y: 0
        },
        viewport: {
            x: 0,
            y: 0
        }
    }
    */

    entry = {
        id: 0,
        time: 0,
        page: 0,
        type: null,
        //purpose: null,
        //service: null,
        //state: null,
        //accept: null,
        //cookie_status: null
        //clicked_page_2: null
        //clicked_page_3: null
        //interaction_page_1:
        //interaction_page_2:
    }

    /*
    constructor(id, time, url, elem_id, elem_tag, elem_class, elem_accordion_target, elem_accordion_state, elem_switch_state, page_x, page_y, client_x, client_y, viewport_x, viewport_y) {
        if (id != null && id != undefined) {
            this.entry.id = id;
        }

        if (time != null && time != undefined) {
            this.entry.time = time;
        }

        if (url != null && url != undefined) {
            this.entry.url = url;
        }

        if (elem_id != null && elem_id != undefined) {
            this.entry.element.id = elem_id;
        }

        if (elem_tag != null && elem_tag != undefined) {
            this.entry.element.tag = elem_tag;
        }

        if (elem_class != null && elem_class != undefined) {
            this.entry.element.class = elem_class;
        }

        if (elem_accordion_target != null && elem_accordion_target != undefined) {
            this.entry.element.accordion.data_target = elem_accordion_target;
        }

        if (elem_accordion_state != null && elem_accordion_state != undefined) {
            this.entry.element.accordion.state = elem_accordion_state;
        }

        if (elem_switch_state != null && elem_switch_state != undefined) {
            this.entry.element.switch.state = elem_switch_state;
        }

        if (page_x != null && page_x != undefined) {
            this.entry.mouse.page_x = page_x;
        }

        if (page_y != null && page_y != undefined) {
            this.entry.mouse.page_y = page_y;
        }

        if (client_x != null && client_x != undefined) {
            this.entry.mouse.client_x = client_x;
        }

        if (client_y != null && client_y != undefined) {
            this.entry.mouse.client_y = client_y;
        }

        if (viewport_x != null && viewport_x != undefined) {
            this.entry.viewport.x = viewport_x;
        }

        if (viewport_y != null && viewport_y != undefined) {
            this.entry.viewport.y = viewport_y;
        }
    }
    */


    constructor(id, time, page, type, purpose = null, service = null, state = null, accept = null, cookie_status = null, clicked_page_2 = null, clicked_page_3 = null, interaction_page_1 = null, interaction_page_2 = null) {
        if (id != null && id != undefined) {
            this.entry.id = id;
        }

        if (time != null && time != undefined) {
            this.entry.time = time;
        }

        if (page != null && page != undefined) {
            this.entry.page = page;
        }

        if (type != null && type != undefined) {
            this.entry.type = type;
        }

        if (purpose != null && purpose != undefined) {
            this.entry.purpose = purpose;
        }

        if (service != null && service != undefined) {
            this.entry.service = service;
        }

        if (state != null && state != undefined) {
            this.entry.state = state;
        }

        if (accept != null && accept != undefined) {
            this.entry.accept = accept;
        }

        if (cookie_status != null && cookie_status != undefined) {
            this.entry.cookie_status = cookie_status;
        }

        if (clicked_page_2 != null && clicked_page_2 != undefined) {
            this.entry.clicked_page_2 = clicked_page_2
        }

        if (clicked_page_3 != null && clicked_page_3 != undefined) {
            this.entry.clicked_page_3 = clicked_page_3
        }

        if (interaction_page_1 != null && interaction_page_1 != undefined) {
            this.entry.interaction_page_1 = interaction_page_1
        }

        if (interaction_page_2 != null && interaction_page_2 != undefined) {
            this.entry.interaction_page_2 = interaction_page_2
        }
    }
}

class RecordMainEntry {

    entry = {
        caseToken: "",
        time: 0,
        records: []
    }

    constructor(caseToken = "", time = 0, records = new Array()) {
        if (caseToken != null && caseToken != undefined) {
            this.entry.caseToken = caseToken;
        }

        if (time != null && time != undefined) {
            this.entry.time = time;
        }

        if (records != null && records != undefined) {
            this.entry.records = records;
        }
    }
}