class RecordEA {
    cookie_config = null;
    purpose_config = null;
    elements = [];
    id_endings = new Enums().id_endings;
    interaction_type = new Enums().interaction_type;

    constructor(cookie_config, purpose_config) {
        if (cookie_config !== null) {
            this.cookie_config = cookie_config;
        }

        if (purpose_config !== null) {
            this.purpose_config = purpose_config;
        }

        let click_elements = [ // css ids
            "user-preferences-purpose-switch-normal", 
            "statistics-improvement-purpose-switch-normal", 
            "personalization-website-purpose-switch-normal", 
            "personalization-advertisement-purpose-switch-normal", 
        ];

        this.save_entry("ea-user-preferences", false); 
        this.save_entry("ea-statistics-improvement", false); 
        this.save_entry("ea-personalization-website", false);
        this.save_entry("ea-personalization-advertisement", false);


        // convert the element lists to a single array
        if (cookie_config !== null) {
            click_elements.forEach(select => {
                let elements = $("#include-plugin #" + select);
                this.elements = this.elements.concat([...elements]);
            });
        }


        // add click listener to all elements
        this.elements.forEach(elem => {
            if (!elem.className.includes("no-click")) {
                let that = this;
                elem.addEventListener('click', function handleClick(event) {
                    event.stopImmediatePropagation(); // stop click event propagation to prevent multiple records for one click
                    let id = event.target.id;
                    let checked = event.target.checked;
 
                    if (id.includes(click_elements[0])) { 
                        that.save_entry("ea-user-preferences" ,checked); 
                    } else if (id.includes(click_elements[1])) { 
                        that.save_entry("ea-statistics-improvement", checked); 
                    } else if (id.includes(click_elements[2])) { 
                        that.save_entry("ea-personalization-website", checked); 
                    } else if (id.includes(click_elements[3])) {
                        that.save_entry("ea-personalization-advertisement", checked);
                    } 
                });
            }
        }); 
    }

    save_entry(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
