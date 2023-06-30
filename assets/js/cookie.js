class Cookie {
    cookie_switch_status = {};
    cookie_detail_html = {};
    cookie_config = {};
    cookie_service_detail = {};
    cookie_type = "";
    purposeKeys = new Array("data", "duration", "recipient", "legal basis", "objection rights", "consequences", "subject rights", "transfer", "contact");
    serviceKeys = new Array("purpose", "tracking", "data", "legal basis", "processing location", "duration", "third countries", "recipient", "saving information");

    initCookie(cookie_type = "") {
        let cookie_accepted = JSON.parse(localStorage.getItem("cookie_accepted"));

        if (cookie_type == "") {
            cookie_type = localStorage.getItem("cookie_type");
        } else {
            if (cookie_accepted === null) {
                localStorage.setItem("cookie_type", cookie_type);
                localStorage.setItem("cookie_accepted", false);
            }
        }

        // read cookie configuration and build cookie modal for the specified type
        $.getJSON("assets/json/cookie-service-detail.json")
        .then(json => {
            this.cookie_service_detail = json;
        });

        // read cookie configuration and build cookie modal for the specified type
        $.getJSON("assets/json/cookie.json")
        .then(json => {
            this.cookie_config = json[cookie_type];
            this.cookie_type = cookie_type;
 
            if (cookie_accepted === false || cookie_accepted === null) {
                // init with data from ea
                this.showCookie();
            }
        });
    }

    /**
     * Replace inner html of the cookie placeholder and display the cookie
     */
    showCookie() {
        localStorage.setItem("interaction_page_1", false);
        localStorage.setItem("interaction_page_2", false);
        localStorage.setItem("clicked_page_2", false);
        localStorage.setItem("clicked_page_3", false);

        document.getElementById('include-cookie').innerHTML = this.buildCookieModal();

        this.setFooterButtonOnClick();

        $('[data-toggle="popover"]').popover();
        // create modal html placeholder for every purpose
        for (let purpose of this.cookie_config["purpose"]) {
            let cookie_detail_id = 'include-cookie-detail-$id$'.replace("$id$", purpose["id"]);
            let div = document.createElement('div');
            div.setAttribute("id", cookie_detail_id);
            document.getElementById('include-cookie-detail').appendChild(div);

            cookie_detail_id = '#include-cookie-detail-$id$'.replace("$id$", purpose["id"]);

            let purpose_switch_id = "#$id$-purpose-switch".replace("$id$", purpose["id"]);
            let purpose_general_switch_id = "#$id$-general-switch".replace("$id$", purpose["id"]);

            $(cookie_detail_id).html(this.buildCookieDetailModal(purpose));
            this.initDetailModalClickListener(purpose);

            // add click listener to accordions on page 1
            let id = purpose["id"];
            /*
            document.getElementById(id + "-accordion-button").addEventListener("click", () => { 
                this.showDetailCookie(purpose);
                localStorage.setItem("clicked_page_2", true);
                // set interaction time on page 1
                this.setTimeOnPage(1);
            });
            */
            document.getElementById(id + "-accordion-caret-button").addEventListener("click", () => { 
                this.showDetailCookie(purpose);
                localStorage.setItem("clicked_page_2", true);
                // set interaction time on page 1
                this.setTimeOnPage(1);
            });

    
            document.getElementById(id + "-accordion-caret-button").addEventListener("click", () => { 
                this.showDetailCookie(purpose);
                localStorage.setItem("clicked_page_2", true);
                // set interaction time on page 1
                this.setTimeOnPage(1);
            });

            $('#cookie-button').click(() => {
                this.setTimeOnPage(0);
                $('#cookie-modal').modal('show');
                  
            })


            // set click listener for purpose switch on page 1
            $(purpose_switch_id).click(() => {
                let state =	$(purpose_switch_id).prop('checked');
                this.cookie_switch_status[purpose_general_switch_id] = state;
                this.cookie_switch_status[purpose_switch_id] = state;

                this.switchProContraContainerClass(purpose, state);

                // save the current status of all toggles for every service
                for (let service of purpose["services"]) {
                    let service_switch_id = "#$id$-service-switch".replace("$id$", purpose["id"] + "-" + service["id"]);
                    $(service_switch_id).prop('checked', state);
                    this.cookie_switch_status[service_switch_id] = state;
                }
            });
        }
        localStorage.setItem("cookie_state", JSON.stringify(this.cookie_switch_status));
        $('#cookie-modal').modal('show');
        this.initWithDataFromEA();
        new RecordCB(1, this.cookie_config, null);
    }

    /**
     * Replace inner html of the cookie placeholder and display the cookie
     */
    showDetailCookie(purpose) {
        $('#cookie-modal').modal('hide');
        this.setNavigationOnClick();

        $('[data-toggle="popover"]').popover();

        for (let id of Object.keys(this.cookie_switch_status)) {
            $(id).prop('checked', this.cookie_switch_status[id]);
        }

        let cookie_detail_modal_id = '#cookie-detail-modal-$id$'.replace("$id$", purpose["id"]);
        $(cookie_detail_modal_id).modal('show');

        new RecordCB(2, null, purpose);
    }


     /**
     * Replace inner html of the cookie placeholder and display the cookie
     */
    showServiceDetailCookie(service) {
        document.getElementById('include-cookie-service-detail').innerHTML = this.buildCookieServiceDetailModal(service);
        $('[data-toggle="popover"]').popover();

        $('#cookie-service-detail-modal').modal('show');
        new RecordCB();
    }

    /**
     * Builds the cookie template with placeholders
     * Placeholders are replaced with the content specified in assets/json/cookie.json
     * @returns html cookie string
     */
    buildCookieModal() {
        let modal_template = 
        `
        <div class="modal fade cookie-modal" id="cookie-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" data-bs-backdrop="false">
            $assistant-header$
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    $header$
                    $body$
                    <div class="modal-footer no-outline">
                        <div class="container">
                            <div id="footer-buttons" class="d-flex row justify-content-between">
                                <button id="btn-accept-all" type="button" class="btn col-3 accordion-footer-button ms-3" data-bs-dismiss="modal">Alle annehmen</button>
                                <button id="btn-reject-all" type="button" class="btn col-3 accordion-footer-button" data-bs-dismiss="modal">Alle ablehnen</button>
                                <button id="btn-accept-current" type="button" class="btn col-3 accordion-footer-button me-3" data-bs-dismiss="modal">Speichern</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        modal_template = this.injectAssistantHeader(modal_template);
        modal_template = this.injectCookieHeader(modal_template, 1, this.cookie_config["title"], this.cookie_config["text"]);
        modal_template = this.injectCookieBody(modal_template);
        modal_template = this.injectAccordion(modal_template, 1);

        return modal_template;
    }

    /**
     * Builds the cookie template with placeholders
     * Placeholders are replaced with the content specified in assets/json/cookie.json
     * @returns html cookie string
     */
    buildCookieDetailModal(purpose) {
        let modal_template = 
        `
        <div class="modal fade cookie-detail-modal" id="cookie-detail-modal-$id$" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" data-bs-backdrop="false">
            $assistant-header$
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    $header$
                    $body$
                    <div class="modal-footer no-outline">
                    </div>
                </div>
            </div>
        </div>
        `;

        modal_template = this.injectAssistantHeader(modal_template);
        modal_template = this.injectCookieHeader(modal_template, 2, purpose["title"], purpose["text"], purpose["id"], purpose["popover"], purpose["pro"], purpose["contra"]);
        modal_template = this.injectCookieDetailBody(modal_template);
        modal_template = this.injectPurpose(modal_template, purpose);
        modal_template = this.injectService(modal_template, purpose);
        modal_template = modal_template.replace("$id$", purpose["id"]);

        return modal_template;
    }

        /**
     * Builds the cookie template with placeholders
     * Placeholders are replaced with the content specified in assets/json/cookie.json
     * @returns html cookie string
     */
    buildCookieServiceDetailModal(service) {
        let modal_template = 
        `
        <div class="modal fade" id="cookie-service-detail-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" data-bs-backdrop="false">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    $header$
                    $body$
                    <div class="modal-footer">
                    </div>
                </div>
            </div>
        </div>
        `;

        modal_template = this.injectCookieHeader(modal_template, 3, service["name"], service["text"], service["popover"]);
        modal_template = this.injectCookieServiceDetailBody(modal_template);
        modal_template = this.injectServiceText(modal_template, service);

        return modal_template;
    }

    injectAssistantHeader(template) {
        let headerTemplate =
        `
        <div class="assistant-header">
            <div class="float-start d-flex title">
                <img src="./assets/icons/ea-icon.svg" class="icon">
                <p>Dein Einwilligungsassistent</p>
            </div>
            <div class="float-end status">
                <div>
                    Voreinstellungen weitergegeben
                </div>
            </div>
            <div class="text">
                Möchtest du für diese Website <span class="underline">mein-pflanzen-shop.de</span> Ausnahmen vorsehen?
            </div>
        </div>
        `;

        template = template.replace("$assistant-header$", headerTemplate);

        return template;
    }

    /**
     * Replaces the cookie $title$ and $header$ placeholder 
     * @param {} modal_template 
     * @returns 
     */
    injectCookieHeader(modal_template, page, title, text, purpose_id = "", popover = "", purpose_pro = [], purpose_contra = []) {
        // adjust header size
        let header_template = 
        `
        <div class="row modal-header content-block no-outline mt-2">
                $close-button$
                <div class="$col$ modal-title $cookie-text-size$" id="cookie-modal-$page$"><b>$title$</b></div>
                $risks-legend$
                $info-button$
                $general-switch$
        </div>
        $pro-contra-container$
        $text$
        `;

        if (page == 1) {
            header_template = header_template.replace("$col$", "col-8");
            header_template = header_template.replace("$cookie-text-size$", "cookie-text-bigger");
        } else if (page == 2) {
            header_template = header_template.replace("$col$", "col-10");
            header_template = header_template.replace("$cookie-text-size$", "cookie-text-big");
        }

        /*
        let risks_legend =
        `
        <div class="col-4 container">
            <div class="row">
                <div class="col-12 cookie-text-small d-flex justify-content-end">
                    $dots-contra$ 
                    <span class="ms-2">Faktoren für Risiken</span>
                </div>
                <div class="col-12 cookie-text-small">
                    $dots-pro$ 
                    <span class="ms-2">und Potenziale</span>
                </div>
            </div>
        </div>
        `;
        */

        let risks_legend =
        `
        <div class="col-4 container">
            <div class="row">
                <div class="col-4 cookie-text-normal p-0">
                    <div class="d-flex justify-content-end h-50 align-items-center">
                    $dots-contra$ 
                    </div>
                    <div class="d-flex justify-content-end h-50 align-items-center">
                    $dots-pro$ 
                    </div>
                </div>
                <div class="col-8 cookie-text-normal">
                    <span>Faktoren für Risiken</span>
                    <span>und Potenziale</span>
                </div>
            </div>
        </div>
        `;

        let close_button = 
        `
        <div class="col-1 d-flex justify-content-end">
            <button id="page-$page$-$id$-close-button" type="button" class="navigation-main no-outline bg-transparent" aria-label="Close">
                <img src="/assets/icons/arrow_left.svg" class="navigation navigation-main arrow-navigation-size">
            </button>
        </div>
        `;

        let info_button =
        `
        <button id="$id$-info-button" class="d-flex col-1 btn bg-transparent shadow-none align-items-start accordion-info-button no-click" type="button" $popover$>
            <i class="fa fa-info-circle" aria-hidden="true"></i>
        </button>
        `;

        let pro_contra_container = 
        `
        <div class="content-block">
            <div class="row align-items-center pro-contra-container">
                $pro-contra-container$
            </div>
        </div>
        `;

        let general_switch_template = `
        <div id="$id$-general-switch-container" class="col-1 form-check form-switch d-flex justify-content-end">
            <input class="form-check-input layer-2-purpose-switch" type="checkbox" role="switch" id="$id$-general-switch">
            <img class="purpose-marker-arrow purpose-switch" src="./assets/icons/ea-purpose-marker-arrow.svg">
        </div>
        `;

        header_template = header_template.replace("$title$", title);
        header_template = this.replacePurposeText(header_template, text);
        header_template = header_template.replace("$page$", page);
        close_button = close_button.replace("$page$", page);
        close_button = close_button.replace("$id$", purpose_id);

        if (page == 1) {
            header_template = header_template.replace("$close-button$", "");
            header_template = header_template.replace("$pro-contra-container$", "");
            header_template = header_template.replace("$general-switch$", "");
            header_template = header_template.replace("$risks-legend$", risks_legend);
            header_template = header_template.replace("$dots-pro$", this.makeDots(3, "green"));
            header_template = header_template.replace("$dots-contra$", this.makeDots(3, "yellow"));
            header_template = header_template.replace("$dots-placeholder$", this.makeDots(3, "transparent"));

        } else {
            header_template = header_template.replace("$close-button$", close_button);
            header_template = header_template.replace("$general-switch$", general_switch_template);
            header_template = header_template.replace("$pro-contra-container$", pro_contra_container);
            header_template = this.injectProContraContainer(header_template, page);
            header_template = this.replaceProContraList(header_template, purpose_pro, purpose_contra, page);
            header_template = header_template.replace("$id$", purpose_id);
            header_template = header_template.replace("$id-pro$", purpose_id + "-detail-pro-container");
            header_template = header_template.replace("$id-contra$", purpose_id + "-detail-contra-container");
            header_template = header_template.replace("$risks-legend$", "");
        }

        /*
        if (popover !== null && popover !== "") {
            header_template = header_template.replace("$info-button$", info_button);
            header_template = this.injectPopover(header_template, popover);
        } else {*/
        header_template = header_template.replace("$info-button$", "");
        //}
        

        modal_template = modal_template.replace("$header$", header_template);
        
        return modal_template;
    }

    /**
     * Helper function for injectCookieHeader
     * Replaces the $header_type$ placeholder with the json config text for layer_1
     * @param {*} header_template String with placeholders
     * @param {*} purposeArray json array containing the purpose texts
     * @param {*} layerOneKeyList list of json array purpose keys
     * @returns 
     */
    replaceLayerOne(header_template, purposeArray, layerOneKeyList) {
        let layer_template = "";

        for (let layerKey of layerOneKeyList) {
            if (purposeArray.hasOwnProperty(layerKey)) {
                let purposeValue = purposeArray[layerKey];
                if (purposeValue != null) {
                    let index = purposeValue.indexOf(":");
                    purposeValue = "<p class='accordion-body-item'><b>" + purposeValue.slice(0, index + 1) + "</b>" + purposeValue.slice(index + 1) + "</p>";
                    layer_template += purposeValue;
                }
            }
        }

        header_template = header_template.replace("$layer_1$", layer_template);

        return header_template;
    }

    /**
     * Replaces the cookie $body$ placeholder and inserts $content$ placeholder for body content
     * @param {} modal_template 
     * @returns 
     */
    injectCookieBody(modal_template) {
        let body = 
        `
        <div class="modal-body content-block pb-0">
            $content$
        </div>
        `;

        modal_template = modal_template.replace("$body$", body);

        return modal_template;
    }

    /**
     * Replaces the cookie $body$ placeholder and inserts $content$ placeholder for body content
     * @param {} modal_template 
     * @returns 
     */
    injectCookieDetailBody(modal_template) {
        let body = 
        `
        <div class="modal-body content-block content-m-left">
            $service$
            $purpose$
        </div>
        `;

        modal_template = modal_template.replace("$body$", body);

        return modal_template;
    }

    /**
     * Replaces the cookie $body$ placeholder and inserts $content$ placeholder for body content
     * @param {} modal_template 
     * @returns 
     */
    injectCookieServiceDetailBody(modal_template) {
        let body = 
        `
        <div class="modal-body content-block">
            $purpose$
            $tracking$
            $data$
            $legal basis$
            $processing location$
            $duration$
            $third countries$
            $recipient$
            $saving information$
        </div>
        `;

        modal_template = modal_template.replace("$body$", body);

        return modal_template;
    }


    /**
     * Replaces the $content$ placeholder of the cookie body and inserts accordions 
     * @param {*} modal_template 
     * @returns 
     */
    injectAccordion(modal_template, page) {
        let layer_1 = this.cookie_config["layer_1"];
        let purposeKeys = [...this.purposeKeys];

        // remove layer_1 data from expanded accordion (e.g. risk would be displayed twice in header and body
        layer_1.forEach(key => {
            if (purposeKeys.includes(key, 0)) {
                let index = purposeKeys.indexOf(key);
                purposeKeys.splice(index, 1);
            }
        });

        // reindex array
        purposeKeys = Object.values(purposeKeys);

        let accordions = ""

        // accordion template
        let accordion_toggle = 'data-bs-toggle="collapse" data-bs-target="#$id$-accordion-collapse" aria-expanded="false" aria-controls="$id$-accordion-collapse"';
        let accordion_body = 
        `
        <div id="$id$-accordion-collapse" class="collapse" aria-labelledby="$id$-accordion-heading" data-parent="#$id$-accordion">
            <div class="card-body accordion-body">
                $content$
            </div>
        </div>
        `;

        // add $accordion-toggle$ to buttons to toggle the accordion
        // add $caret$ to second buttons inner text to show the caret
        let accordion = 
        `
        <div class="accordion" id="$id$-accordion">
            <div class="card">
                <div class="card-header p-0 pb-1" id="$id$-accordion-heading">
                    <div class="container">
                        <div class="row align-items-center mb-2 mt-1">
                            <button id="$id$-accordion-caret-button" class="col-1 btn bg-transparent shadow-none p-0 " type="button">
                                <img src="/assets/icons/arrow_right_nav.svg" class="arrow-navigation-size-nav">
                            </button>
                            <div id="$id$-accordion-button" class="col-10 no-outline bg-transparent shadow-none text-start accordion-header">
                                $title$
                                $layer_1$
                            </div>
                            <div class="col-1 form-check form-switch d-flex justify-content-end align-items-center position-relative">
                                <input class="form-check-input layer-1-purpose-switch" type="checkbox" role="switch" id="$id$-purpose-switch">
                                <img class="purpose-marker-arrow" src="./assets/icons/ea-purpose-marker-arrow.svg">
                            </div>
                        </div>
                        <div class="row align-items-center pro-contra-container">
                            $pro-contra-container$
                        </div>
                    </div>
                </div>
                $accordion-body$
            </div>
        </div>
        `;

        let caret = '<i class="fa fa-caret-down"></i>';

        // replace placeholders
        for (let purpose of this.cookie_config["purpose"]) {
            let tmp = accordion;
            let tmp_purposeKeys = []
            // remove keys which do not exist in purpose array
            purposeKeys.forEach(key => {
                if (purpose.hasOwnProperty(key) == true) {
                    tmp_purposeKeys.push(key);
                }
            })

            
            if (tmp_purposeKeys.length > 0) {
                tmp = tmp.replaceAll("$accordion-toggle$", accordion_toggle);
                tmp = tmp.replace("$accordion-body$", accordion_body);
                tmp = tmp.replace("$caret$", caret);
                tmp = this.injectProContraContainer(tmp, page);
                tmp = tmp.replace("$id-pro$", purpose["id"] + "-pro-container");
                tmp = tmp.replace("$id-contra$", purpose["id"] + "-contra-container");
                tmp = this.replaceProContraList(tmp, purpose["pro"], purpose["contra"], page)
            } else {
                tmp = tmp.replaceAll("$accordion-toggle$", "");
                tmp = tmp.replace("$accordion-body$", "");
                tmp = tmp.replace("$caret$", "");
            }

            let content = "";
            // create placeholder string
            for (let key of tmp_purposeKeys) {
                content += "$" + key + "$\n"
            }

            content = 
            `
            <div class="container">
                <div class="row">
                    <div class="col-9 p-0">
            `
                    + content + 
            `   
                    </div>
                    <div class="col-2 form-check form-switch"></div>
                    <button id="$id$-info-button" class="d-flex col-1 btn bg-transparent shadow-none align-items-start accordion-info-button no-click" type="button" $popover$>
                        <i class="fa fa-info-circle" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            `;

            // replace placeholders with json config text
            tmp = this.replaceTitleAndBadge(tmp, purpose["title"], Object.keys(purpose["services"]).length); //ToDo: replace const number with actual size of content
            tmp = this.injectPurposeToggle(tmp, purpose);
            tmp = this.replaceLayerOne(tmp, purpose, this.cookie_config["layer_1"]);
            content = this.replacePurpose(content, purpose, tmp_purposeKeys);  
            //content = this.injectPopover(content, purpose["popover"]);
            content = this.injectPopover(content, "")
            tmp = tmp.replace("$content$", content);
            tmp = tmp.replaceAll("$id$", purpose["id"]);
            accordions += tmp;
        }

        modal_template = modal_template.replace("$content$", accordions);

        return modal_template;
    }

     /**
     * Replaces the $purpose$ placeholder of the cookie detail body
     * @param {*} modal_template 
     * @returns 
     */
      injectPurpose(modal_template, purpose) {
        let purposeKeys = [...this.purposeKeys];

        let content = "";
        // create placeholder string
        for (let key of purposeKeys) {
            content += "$" + key + "$\n"
            console.log(purposeKeys.length);
        }

        content = 
        `
        <div class="container ms-0 me-0 mt-3">
            <div class="row">
                <div class="col-12 p-0 additional-info">
        `
                + content + 
        `   
                </div>
            </div>
        </div>
        `;

        // replace placeholders with json config text
        content = this.replacePurpose(content, purpose, purposeKeys);  
        modal_template = modal_template.replace("$purpose$", content);;
        modal_template = modal_template.replaceAll("$id$", purpose["id"]);

        return modal_template;
    }

    /**
     * Replaces the $service$ placeholder of the cookie detail body
     * @param {*} modal_template 
     * @returns 
     */
    injectService(modal_template, purpose) {
        let scroll_container = 
        `
        <div class="accordion tracker-accordion" id="$id$-tracker-accordion">
            <div class="accordion-item">
                <div class="accordion-header p-0" id="$id$-tracker-accordion-heading">
                    <div class="container">
                        <div class="row align-items-center cookie-text-normal">
                            <button class="no-click col-1 bold bg-transparent no-outline" data-bs-toggle="collapse" data-bs-target="#$id$-tracker-accordion-collapse" aria-expanded="true" aria-controls="$id$-tracker-accordion-collapse">
                                <i class="fa fa-caret-down" aria-hidden="true"></i>
                            </button>
                            <button id="$id$-tracker-accordion-button" class="col-9 btn bg-transparent shadow-none text-start accordion-header" type="button" data-bs-toggle="collapse" data-bs-target="#$id$-tracker-accordion-collapse" aria-expanded="true" aria-controls="$id$-tracker-accordion-collapse">
                                Tracker (z.B. Cookies)
                            </button>
                            <img class="purpose-marker-arrow tracker" src="./assets/icons/ea-purpose-marker-arrow.svg">
                        </div>
                    </div>
                </div>
                <div id="$id$-tracker-accordion-collapse" class="collapse show" aria-labelledby="$id$-tracker-accordion-heading" data-parent="#$id$-tracker-accordion">
                    <div class="card-body accordion-body">
                        <div class="cookie-detail-services services-scroll-container container mb-3 cookie-text-small tracker-accordion-list">
                            $services$
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        //ToDo: Change number to actual number of services
        let service_template =
        `
        <div class="row align-items-center layer-2-tracker-button">
            <button id="$id$-service-detail-button" class="col-10 bg-transparent shadow-none text-start no-outline cookie-detail-services" type="button">
                <div class="row align-items-center">
                    <span class="no-click col-1">
                        <img src="/assets/icons/arrow_right.svg">
                    </span>
                    <span class="no-click col-10">$service$</span>
                    <!--span class="btn no-click p-0 col-1">
                        <i class="fa fa-info-circle" aria-hidden="true"></i>
                    </span-->
                </div>
            </button>
            <div class="col-2 form-check form-switch d-flex justify-content-end">
                <input class="form-check-input layer-2-tracker-switch" type="checkbox" role="switch" id="$id$-service-switch">
            </div>
        </div>
        `;

        let services = "";
        // create placeholder string
        purpose["services"].forEach((service) => {
            let tmp = service_template.replace("$service$", service["name"]);
            //let cookie_number =  Object.values(service["purpose"]).length;
            let cookie_number = 0;
            tmp = tmp.replace("$cookie-number$", cookie_number);

            services += tmp.replaceAll("$id$", purpose["id"] + "-" + service["id"]);
        });

        //let badge_number = Object.keys(purpose["services"]).length;
        let badge_number = 0;

        scroll_container = scroll_container.replace("$services$", services);
        scroll_container = scroll_container.replace("$badge-number$", badge_number);
        scroll_container = scroll_container.replaceAll("$id$", purpose["id"]);
        modal_template = modal_template.replace("$service$", scroll_container);

        return modal_template;
    }


    /**
     * Helper function for injectAccordion
     * Replaces the title placeholder with the actual title and the pill badge
     * @param accordion_template
     * @param title
     * @param badge_number
     * @returns 
     */
    replaceTitleAndBadge(accordion_template, title, badge_number) {
        //let title_and_badge = "<div><span id='$id$-title' class='no-click'><b>" + title + "</b></span><span class='badge rounded-pill cookie-badge no-click' $popover$>" + badge_number + "</span></div>";
        let title_and_badge = "<div><span id='$id$-title' class='no-click cookie-text-big'><b>" + title + "</b></span></div>";
        accordion_template = accordion_template.replace("$title$", title_and_badge);
        accordion_template = this.injectPopover(accordion_template, ["Für diesen Zweck werden in deinen Browser Cookies von " + badge_number + " Dienstanbietern gespeichert"]);
          
        return accordion_template;
    }

    /**
     * Helper function for injectAccordion
     * Replaces the text placeholder
     * @param accordion_template
     * @param text
     * @returns 
     */
    replaceText(accordion_template, text) {
        text = "<p class='accordion-body-item'>" + text + "</p>";
        accordion_template = accordion_template.replace("$text$", text);
        
        return accordion_template;
    }


    /**
     * Helper function for injectAccordion
     * Replaces the purpose placeholder with the json config text
     * @param {*} content String with placeholders
     * @param {*} purposeArray json array containing the purpose texts
     * @param {*} purposeKeyList list of json array purpose keys
     * @returns 
     */
    replacePurposeText(content, purposeText) {
        if (purposeText == "") {
            content = content.replace("$text$", "");
            return content;
        }

        let index = purposeText.indexOf(":");

        if (index !== -1) {
            purposeText = "<p class='content-block content-m-left cookie-text-normal'><span class=''>" + purposeText.slice(0, index + 1) + "</span>" + purposeText.slice(index + 1) + "</p>";
        } else {
            purposeText = "<p class='content-block content-m-left'>"+ purposeText + "</p>";
        }
        content = content.replace("$text$", purposeText);

        return content;
    }

    /**
     * Helper function for injectAccordion
     * Replaces the purpose placeholder with the json config text
     * @param {*} content String with placeholders
     * @param {*} purposeArray json array containing the purpose texts
     * @param {*} purposeKeyList list of json array purpose keys
     * @returns 
     */
    replacePurpose(content, purposeArray, purposeKeyList) {
        for (let purposeKey of purposeKeyList) {
            if (purposeArray.hasOwnProperty(purposeKey)) {
                let purposeValue = purposeArray[purposeKey];
                if (purposeValue != null) {
                    let index = purposeValue.indexOf(":");
                    purposeValue = "<p class='cookie-text-purpose'><span class='bold'>" + purposeValue.slice(0, index + 1) + "</span>" + purposeValue.slice(index + 1) + "</p>";
                    content = content.replace("$" + purposeKey + "$", purposeValue);
                } else {
                    content = content.replace("$" + purposeKey + "$", "");
                }
            } else {
                content = content.replace("$" + purposeKey + "$", "");
            }
        }

        return content;
    }


    /**
     * Replaces the cookie $toggle$ placeholder 
     * @param {} accordion_template 
     * @returns 
     */
    injectPurposeToggle(accordion_template, purpose) {
        let toggle_true = 
        `
        <div class="col-2 form-check form-switch d-flex justify-content-end align-items-center">
            <input class="form-check-input" type="checkbox" role="switch" id="$id$-purpose-switch">
        </div>
        `;

        let toggle_false = 
        `
        <div class="col-2 form-check form-switch"></div>
        `;

        if (purpose["toggle"] == true) {
            accordion_template = accordion_template.replace("$toggle$", toggle_true);
        } else {
            accordion_template = accordion_template.replace("$toggle$", toggle_false);
        }

        return accordion_template;
    }

    /**
     * Replaces the cookie $toggle$ placeholder 
     * @param {} accordion_template 
     * @returns 
     */
    injectPopover(accordion_template, popoverText) {
        let popover_options = 
        `
        data-bs-container="body" data-bs-html="true" data-bs-trigger="hover" data-toggle="popover" data-bs-placement="top" data-bs-content="$popover-content$"
        `;

        if (popoverText !== null && popoverText !== "") {
            popover_options = this.replacePopoverContent(popover_options, popoverText);
            accordion_template = accordion_template.replace("$popover$", popover_options);
        } else {
            accordion_template = accordion_template.replace("$popover$", "");
        }

        return accordion_template;
    }


    /**
     * Helper function for injectAccordion
     * Replaces the popover-content placeholder with the json config text
     * @param {*} content String with placeholders
     * @param {*} popoverText Popover text 
     * @returns 
     */
    replacePopoverContent(popoverOptions, popoverText) {
        let popoverContent = "";
        for (let content of popoverText) {
            let index = content.indexOf(":");
            if (index > 0) {
                popoverContent += "<p class='popover-item-title'><b>" + content.slice(0, index + 1) + "</b></p><p class='popover-item-text'>" + content.slice(index + 1) + "</p>";
            } else {
                popoverContent += "<p class='popover-item-text'>" + content + "</p>";
            }
        }

        popoverOptions = popoverOptions.replace("$popover-content$", popoverContent);

        return popoverOptions;
    }

    /**
     * Replaces $pro-contra-container$ placeholder in accordion (injectAccordion function)
     */
    injectProContraContainer(modal_template, page = 2) {
        let pro_contra_template = 
        `
        <div class="accordion" id="$id$-pro-contra-accordion">
            <div class="accordion-item border-0">
                <div class="accordion-header p-0" id="$id$-pro-contra-accordion-heading">
                    <div class="container p-0 cookie-text-normal m-0 no-max-width">
                        <div class="row align-items-center pro-contra-container">
                            <div id="$id-pro$" class="col p-2 align-self-stretch pro-container pro-container-inactive layer-2-pro" data-bs-toggle="collapse" data-bs-target=".$id$-pro-contra-accordion-collapse" aria-expanded="false" aria-controls="$id$-pro-accordion-collapse">
                                <div id="$id$-pro-accordion-button" class="col-12 pro-contra-visible">
                                    <div class="row">     
                                        $pro-list-visible$
                                    </div>
                                </div>
                                <div id="$id$-pro-accordion-collapse" class="$id$-pro-contra-accordion-collapse collapse show" aria-labelledby="$id$-pro-contra-accordion-heading" data-parent="#$id$-pro-contra-accordion">
                                    <div class="row">
                                        $pro-list-hidden$
                                    </div>
                                </div>
                            </div>
                            <div id="$id-contra$" class="col p-2 align-self-stretch contra-container contra-container-inactive layer-2-contra" data-bs-toggle="collapse" data-bs-target=".$id$-pro-contra-accordion-collapse" aria-expanded="false" aria-controls="$id$-contra-accordion-collapse">
                                <div id="$id$-contra-accordion-button" class="col-12 pro-contra-visible">
                                    <div class="row">
                                        $contra-list-visible$
                                    </div>
                                </div>
                                <div id="$id$-contra-accordion-collapse" class="$id$-pro-contra-accordion-collapse collapse show" aria-labelledby="$id$-pro-contra-accordion-heading" data-parent="#$id$-pro-contra-accordion">
                                    <div class="row">
                                        $contra-list-hidden$
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;


        modal_template = modal_template.replace("$pro-contra-container$", pro_contra_template);

        if (page == 1) {
            modal_template = modal_template.replaceAll('data-bs-toggle="collapse"', "");
        } else if (page == 2) {
            modal_template = modal_template.replaceAll("show", "");
        }


        return modal_template;


        /*
        let pro_template = `
            <div id="$id-pro$" class="col p-2 align-self-stretch pro-container pro-container-inactive">
                $pro-list$
            </div>
            <div id="$id-contra$" class="col p-2 align-self-stretch contra-container contra-container-inactive">
                $contra-list$
            </div>
        `;

        
        let contra_template = `
            <div id="$id-pro$" class="col p-2 align-self-stretch pro-container pro-container-inactive">
                $pro-list$
            </div>
            <div id="$id-contra$" class="col p-2 align-self-stretch contra-container contra-container-inactive">
                $contra-list$
            </div>
        `;
        */

    }

    /**
     * Replaces the $pro-list$ and $contra-list$ of the $pro-contra-container$ in accordion
     * @see: injectProContraContainer
     */
    replaceProContraList(accordion_template, pro_list, contra_list, page) {
        let pro_list_visible = pro_list.filter((x) => {return x["additional_info"] == false});
        let contra_list_visible = contra_list.filter((x) => {return x["additional_info"] == false});
        let pro_list_hidden = pro_list.filter((x) => {return x["additional_info"] == true});
        let contra_list_hidden = contra_list.filter((x) => {return x["additional_info"] == true});

        let additional_info_template = 
        `
        <div class="row mx-0">
            <div class="col-11 pro-contra-additional-list px-0"><span class="ps-2 layer-2-pro-contra">$additional-text$</span></div>
            <div class="col-1 d-flex justify-content-end pro-contra-additional-list px-0">
                <img class="icon-size" src="/assets/icons/arrow_down.svg">
            </div>
        </div>
        `;

        let list_item_template = 
        `
        <div class="$class$ row pro-contra-item mx-0">
            <div class="col-1 my-auto p-0 d-flex justify-content-center">
                <img src="/assets/icons/$pro-contra-icon$" class="icon-size icon-margin">
            </div>
            <div class="float-start col-10 p-0 my-auto">
                $pro-contra-text$
            </div>
            <div class="col-1 d-flex justify-content-end p-0 my-auto">
                $pro-contra-dots$
            </div>
        </div>
        `;

        let list_additional_item_template = 
        `
        <div class="$class$ row pro-contra-additional-list">
            <div class="col-2 my-auto p-0 d-flex justify-content-center">
                <div class="list-dot"></div>
            </div>
            <div class="float-start col-10 p-0">
                $pro-contra-text$
            </div>
        </div>
        `;

        let pro_items_visible = '';
        let contra_items_visible = '';
        let pro_items_hidden = '';
        let contra_items_hidden = '';

        for (let i = 0; i < pro_list.length; i++) {
            let list_item = list_item_template;

            list_item = list_item.replace("$pro-contra-icon$", pro_list[i]["icon"]);
            list_item = list_item.replace("$pro-contra-text$", pro_list[i]["text"]);
            list_item = list_item.replace("$pro-contra-dots$", this.makeDots(pro_list[i]["dots_num"], "green"));

            if (pro_list[i]["additional_info"] == false) {
                let list_item = list_item_template;
    
                list_item = list_item.replace("$pro-contra-icon$", pro_list[i]["icon"]);
                list_item = list_item.replace("$pro-contra-text$", pro_list[i]["text"]);
                list_item = list_item.replace("$pro-contra-dots$", this.makeDots(pro_list[i]["dots_num"], "green"));

                if (pro_list_visible.length == 1) {
                    list_item = list_item.replace('$class$', '');
                } else {
                    list_item = list_item.replace("$class$", "margin-bottom-5");
                }
                pro_items_visible += list_item;
            } else if (page == 2) {
                let list_item = list_additional_item_template;
    
                list_item = list_item.replace("$pro-contra-text$", pro_list[i]["text"]);

                if (i < pro_list_hidden.length - 1) {
                    list_item = list_item.replace("$class$", "margin-bottom-5");
                } else {
                    list_item = list_item.replace("$class$", "");
                }
                pro_items_hidden += list_item;
            }
        }

        for (let i = 0; i < contra_list.length; i++) {
            if (contra_list[i]["additional_info"] == false) {
                let list_item = list_item_template;
            
                list_item = list_item.replace("$pro-contra-icon$", contra_list[i]["icon"]);
                list_item = list_item.replace("$pro-contra-text$", contra_list[i]["text"]);
                list_item = list_item.replace("$pro-contra-dots$", this.makeDots(contra_list[i]["dots_num"], "yellow"));

                if (contra_list_visible.length == 1) {
                    list_item = list_item.replace('$class$', '');
                } else {
                    list_item = list_item.replace("$class$", "margin-bottom-5");
                }
                contra_items_visible += list_item;
            } else if (page == 2){
                let list_item = list_additional_item_template;
    
                list_item = list_item.replace("$pro-contra-text$", contra_list[i]["text"]);

                if (i < contra_list_hidden.length - 1) {
                    list_item = list_item.replace("$class$", "margin-bottom-5");
                } else {
                    list_item = list_item.replace("$class$", "");
                }
                contra_items_hidden += list_item;
            }
        }

        if (pro_list_hidden.length > 0) {
            if (page == 2) {
                pro_items_visible += additional_info_template;
                pro_items_visible = pro_items_visible.replace("$additional-text$", "Weitere <u>nur mittelbare</u> Potenziale");
            }
        }

        if (contra_list_hidden.length > 0) {
            if (page == 2) {
                contra_items_visible += additional_info_template;
                contra_items_visible = contra_items_visible.replace("$additional-text$", "Weitere <u>nur mittelbare</u> Risiken");
            }
        }

        accordion_template = accordion_template.replace("$pro-list-visible$", pro_items_visible);
        accordion_template = accordion_template.replace("$contra-list-visible$", contra_items_visible);
        accordion_template = accordion_template.replace("$pro-list-hidden$", pro_items_hidden);
        accordion_template = accordion_template.replace("$contra-list-hidden$", contra_items_hidden);

        return accordion_template;
    }


    setFooterButtonOnClick() {
        let footer_buttons = $("#footer-buttons > button");
    
        // convert the element lists to a single array
        for (let button of footer_buttons) {
            button.addEventListener ("click", this.setCookieStatus);
            button.addEventListener("click", () => {
                this.setTimeOnPage(1);
            });
        }

        $("#btn-accept-all").click(() => {
            this.setAllCookieSwitches(true);
            for (let purpose of this.cookie_config["purpose"]) {
                this.switchProContraContainerClass(purpose, true);
            }
        });

        $("#btn-reject-all").click(() => {
            this.setAllCookieSwitches(false);
            for (let purpose of this.cookie_config["purpose"]) {
                this.switchProContraContainerClass(purpose, false);
            }
        });

    }

    setNavigationOnClick() {
        let navigation_main = $(".navigation-main");

        for (let nav of navigation_main) {
            nav.addEventListener("click", () => {
                $('#cookie-modal').modal('show');
            });
        }
    }

    setCookieStatus() {
        localStorage.setItem("cookie_accepted", true);
    }


    setAllCookieSwitches(state) {
        for (let purpose of this.cookie_config["purpose"]) {
            let cookie_detail_id = '#include-cookie-detail-$id$'.replace("$id$", purpose["id"]);

            let purpose_switch_id = "#$id$-purpose-switch".replace("$id$", purpose["id"]);
            let purpose_general_switch_id = "#$id$-general-switch".replace("$id$", purpose["id"]);

            $(purpose_general_switch_id).prop('checked', state);
            $(purpose_switch_id).prop('checked', state);
            this.cookie_switch_status[purpose_general_switch_id] = state;
            this.cookie_switch_status[purpose_switch_id] = state;

            // save the current status of all toggles for every service
            for (let service of purpose["services"]) {
                let service_switch_id = "#$id$-service-switch".replace("$id$", purpose["id"] + "-" + service["id"]);
                $(service_switch_id).prop('checked', state);
                this.cookie_switch_status[service_switch_id] = state;
            }
        }
    }


    injectServiceText(modal_template, service) {
        for (let key of this.serviceKeys) {
            let html = "";
            if (key == "processing location" || key == "duration" || key == "saving information") {
                html = this.replaceServiceText(this.cookie_service_detail[key]["title"], this.cookie_service_detail[key]["text"], service[key], "list");
            } else {
                html = this.replaceServiceText(this.cookie_service_detail[key]["title"], this.cookie_service_detail[key]["text"], service[key], "badge");

            }
            modal_template = modal_template.replace("$" + key + "$", html);
        }

        return modal_template;
    }

    replaceServiceText(title, text, items, style) {
        let template =
        `
        <div class="cookie-detail-services mb-2">
            <p class="cookie-title pl-3 pr-3">$title$</p>
            <p class="cookie-text pl-3 pr-3">$text$</p>
            $items$
        </div>
        `;

        let badge_template = 
        `
        <span class='badge rounded-pill cookie-text cookie-badge mt-2'>$badge-text$</span>
        `;

        let list_template = 
        `
        <li>
            $list-text$
        </li>
        `;

        let tmp = template.replace("$title$", title);
        tmp = tmp.replace("$text$", text);

        let tmp_items = "";

        if (style == "badge") {
            for (let item of items) {
                tmp_items += badge_template.replace("$badge-text$", item);
            }
        } else if (style == "list") {
            let tmp_list = "<ul class='cookie-text'>$list$</ul>";
            let tmp_list_items = "";
            for (let item of items) {
                tmp_list_items += list_template.replace("$list-text$", item);
            }

            tmp_items += tmp_list.replace("$list$", tmp_list_items);
        }

        tmp = tmp.replace("$items$", tmp_items);

        return tmp;
    }

    replaceCurrentHTMLcheckedState(innerhtml, state) {
        console.log(innerhtml);
        let checked_state = 'checked="$state$"'.replace("$state$", state);

        return checked_state;
    }

    getCurrentHTMLcheckedState(innerhtml) {
        if (innerhtml.includes('checked=""')) {
            return 'checked=""';
        } else if (innerhtml.includes('checked="true"')) {
            return 'checked="true"';
        } else if (innerhtml.includes('checked="false"')) {
            return 'checked="false"';
        }
    }

    makeDots(number, color) {
        let dot_template = 
        `
        <span class="dot dot-$color$ $margin$"></span>
        `;

        dot_template = dot_template.replace("$color$", color);

        let dots = ""

        for (let i = 0; i < number; i++) {
            let tmp_dots = dot_template;
            if (i > 0) {
                tmp_dots = tmp_dots.replace("$margin$", "dot-margin");
            } else {
                tmp_dots = tmp_dots.replace("$margin$", "");
            }

            dots += tmp_dots;
    
        }

        return dots;
    }

    setTimeOnPage(page = 1) {
        let timeOnPageStart = 0;
        let timeOnPageEnd = 0;
        let timeOnPage = 0;
        let previousTimeOnPage = 0;
  
        if (localStorage.getItem("timePassed") === null) {
          localStorage.setItem("timePassed", 0);
        } else {
          timeOnPageEnd = localStorage.getItem("timePassed");
        }
  
        if (localStorage.getItem("timeOnPageStart") === null) {
          localStorage.setItem("timeOnPageStart", 0);
        } else {
          timeOnPageStart = localStorage.getItem("timeOnPageStart");
        }
    
        if (localStorage.getItem("timeOnPage" + page.toString()) === null) {
          localStorage.setItem("timeOnPage" + page.toString(), 0);
        } else {
          previousTimeOnPage = localStorage.getItem("timeOnPage" + page.toString());
        }
  
        timeOnPage = Number(previousTimeOnPage) + (Number(timeOnPageEnd) - Number(timeOnPageStart));
  
        localStorage.setItem("timeOnPage" + page.toString(), timeOnPage);
        localStorage.setItem("timeOnPageStart", timeOnPageEnd);
      }

      switchProContraContainerClass(purpose, state) {
        if (state == true) {
            // page 1
            $("#" + purpose["id"] + "-pro-container").addClass("pro-container-active");
            $("#" + purpose["id"] + "-pro-container").removeClass("pro-container-inactive");
            $("#" + purpose["id"] + "-contra-container").addClass("contra-container-active");
            $("#" + purpose["id"] + "-contra-container").removeClass("contra-container-inactive");

            // page 2
            $("#" + purpose["id"] + "-detail-pro-container").addClass("pro-container-active");
            $("#" + purpose["id"] + "-detail-pro-container").removeClass("pro-container-inactive");
            $("#" + purpose["id"] + "-detail-contra-container").addClass("contra-container-active");
            $("#" + purpose["id"] + "-detail-contra-container").removeClass("contra-container-inactive");

        } else {
            // page 1
            $("#" + purpose["id"] + "-pro-container").removeClass("pro-container-active");
            $("#" + purpose["id"] + "-pro-container").addClass("pro-container-inactive");
            $("#" + purpose["id"] + "-contra-container").removeClass("contra-container-active");
            $("#" + purpose["id"] + "-contra-container").addClass("contra-container-inactive");

            // page 2
            $("#" + purpose["id"] + "-detail-pro-container").removeClass("pro-container-active");
            $("#" + purpose["id"] + "-detail-pro-container").addClass("pro-container-inactive");
            $("#" + purpose["id"] + "-detail-contra-container").removeClass("contra-container-active");
            $("#" + purpose["id"] + "-detail-contra-container").addClass("contra-container-inactive");
        }
      }


      initDetailModalClickListener(purpose) {
        let purpose_general_switch_id = "#$id$-general-switch".replace("$id$", purpose["id"]);
        let purpose_switch_id = "#$id$-purpose-switch".replace("$id$", purpose["id"]);

        for (let service of purpose["services"]) {
            let service_button_id = '#$id$-service-detail-button'.replace("$id$", service["id"]);
            $(service_button_id).click(() => {
                localStorage.setItem("clicked_page_3", true);
            });
        }

        // set click listener for general purpose switch on page 2
        $(purpose_general_switch_id).click(() => {
            localStorage.setItem("interaction_page_2", true);

            // set general switch on page 1 to state of purpose switch on page 2
            let state =	$(purpose_general_switch_id).prop('checked');
            this.cookie_switch_status[purpose_general_switch_id] = state;
            this.cookie_switch_status[purpose_switch_id] = state;
            $(purpose_switch_id).prop('checked', state);

            this.switchProContraContainerClass(purpose, state);

            // set all services on page 2 to state of general purpose switch on page 2
            for (let service of purpose["services"]) {
                let service_switch_id = "#$id$-service-switch".replace("$id$", purpose["id"] + "-" + service["id"]);
                console.log(service_switch_id);
                $(service_switch_id).prop('checked', state);
                this.cookie_switch_status[service_switch_id] = state;
            };
        });

        for (let service of purpose["services"]) {
            let service_switch_id = "#$id$-service-switch".replace("$id$", purpose["id"] + "-" + service["id"]);

            // set click listener for services on page 2
            $(service_switch_id).click(() => {
                localStorage.setItem("interaction_page_2", true);
                let service_state =	$(service_switch_id).prop('checked');

                // set purpose switch on page 1 and general purpose switch 2 on page 2 to true if service switch was set to true
                if (service_state === true) {
                    $(purpose_switch_id).prop('checked', true);
                    $(purpose_general_switch_id).prop('checked', true);
                    this.cookie_switch_status[purpose_general_switch_id] = true;
                    this.cookie_switch_status[purpose_switch_id] = true;
                }

                this.cookie_switch_status[service_switch_id] = service_state;
                
                // check if all service states are false
                let all_false = true;
                for (let service_tmp of purpose["services"]) {
                    let service_switch_tmp_id = "#$id$-service-switch".replace("$id$", service_tmp["id"]);
                    let service_tmp_state =	$(service_switch_tmp_id).prop('checked');

                    if (service_tmp_state === true) {
                        all_false = false;
                        break;
                    }
                }

                // if all service states are false, set purpose switch on page 1 and general purpose switch on page 2 to false
                if (all_false === true) {
                    this.switchProContraContainerClass(purpose, false);
                    $(purpose_general_switch_id).prop('checked', false);
                    $(purpose_switch_id).prop('checked', false);
                    this.cookie_switch_status[purpose_general_switch_id] = false;
                    this.cookie_switch_status[purpose_switch_id] = false;
                } else { // else set purpose switch on page 1 and general purpose switch on page 2 to true
                    this.cookie_switch_status[purpose_general_switch_id] = true;
                    this.cookie_switch_status[purpose_switch_id] = true;
                    this.switchProContraContainerClass(purpose, true);
                }
            });
        }

        let cookie_detail_modal_id = '#cookie-detail-modal-$id$'.replace("$id$", purpose["id"]);
        // set page 2 close button listener
        let close_button_id = '#page-2-$id$-close-button'.replace("$id$", purpose["id"]);
        $(close_button_id).click(() => {
            // set interaction time on page 2
            this.setTimeOnPage(2);
            $(cookie_detail_modal_id).modal('hide');
        });
    }

    initWithDataFromEA() {
        // ea ids
        let ids = ["ea-user-preferences", 
        "ea-statistics-improvement", 
        "ea-personalization-website", 
        "ea-personalization-advertisement"]

        ids.forEach(id => {
            let state = localStorage.getItem(id);
            state = (state === 'true');
            let id_purpose = id.replace("ea-", "");;

            let purpose_switch_id = "#$id$-purpose-switch".replace("$id$", id_purpose);
            let purpose_general_switch_id = "#$id$-general-switch".replace("$id$", id_purpose);

            $(purpose_general_switch_id).prop("checked", state);
            $(purpose_switch_id).prop("checked", state);
            this.cookie_switch_status[purpose_general_switch_id] = state;
            this.cookie_switch_status[purpose_switch_id] = state;

            this.cookie_config["purpose"].forEach(obj => {
                if (obj["id"] == id_purpose) {
                    let purpose = obj;
                    // save the current status of all toggles for every service
                    for (let service of purpose["services"]) {
                        let service_switch_id = "#$id$-service-switch".replace("$id$", purpose["id"] + "-" + service["id"]);
                        $(service_switch_id).prop('checked', state);
                        this.cookie_switch_status[service_switch_id] = state;
                    }
                }
            });
        });

        console.log(this.cookie_switch_status);
    }
}