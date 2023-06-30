class RecordCB {
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

        let click_elements = [ // css classes
            "layer-1-purpose-switch", 
            "layer-2-purpose-switch", 
            "layer-2-tracker-switch", 
            "layer-2-pro", 
            "layer-2-contra", 
            "layer-2-tracker-button", 
            "accordion-footer-button"
        ];


        // convert the element lists to a single array
        if (cookie_config !== null) {
            click_elements.forEach(select => {
                let elements = $("#include-cookie ." + select);
                this.elements = this.elements.concat([...elements]);
            });
        } else if (purpose_config !== null) {
            click_elements.forEach(select => {
                let elements = $("#include-cookie-detail ." + select);
                this.elements = this.elements.concat([...elements]);
            });
        }


        // add click listener to all elements
        this.elements.forEach(elem => {
            if (!elem.className.includes("no-click")) {
                let that = this;
                elem.addEventListener('click', function handleClick(event) {
                    event.stopImmediatePropagation(); // stop click event propagation to prevent multiple records for one click
                    let classList = Array.from(event.target.classList);
 
                    if (classList.includes(click_elements[0])) { //layer-1-purpose-switch
                        //that.save_entry(click_elements[0] + "-" + event.target.id, $("#" + event.target.id).prop('checked')); // purpose changed at least once and last checked state of switch
                        that.save_entry(click_elements[0], true); // purpose changed at least once
                    } else if (classList.includes(click_elements[1])) { //layer-2-purpose-switch
                        //that.save_entry(click_elements[1] + "-" + event.target.id, $("#" + event.target.id).prop('checked')); // purpose changed at least once and last checked state of switch
                        that.save_entry(click_elements[1], true); // purpose changed at least once
                    } else if (classList.includes(click_elements[2])) { //layer-2-tracker-switch
                        //that.save_entry(click_elements[2] + "-" + event.target.id, $("#" + event.target.id).prop('checked')); // purpose changed at least once and last checked state of switch
                        that.save_entry(click_elements[2], true); // purpose changed at least once
                    } else if (classList.includes(click_elements[3])) { //layer-2-pro
                        //that.save_entry(click_elements[3] + "-" + event.target.id, true);
                        that.save_entry(click_elements[3], true);
                    } else if (classList.includes(click_elements[4])) { //layer-2-contra
                        //that.save_entry(click_elements[4] + "-" + event.target.id, true);
                        that.save_entry(click_elements[4], true);
                    } else if (classList.includes(click_elements[5])) { //layer2-tracker-button
                        //that.save_entry(click_elements[5] + "-" + event.target.id, true);
                        that.save_entry(click_elements[5], true);
                    } else if (classList.includes(click_elements[6])) { //accordion-footer-button
                        that.save_entry(click_elements[6], event.target.textContent);
                    } 
                });
            }
        }); 
    }

    save_entry(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
