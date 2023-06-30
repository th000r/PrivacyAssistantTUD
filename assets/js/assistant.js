class Assistant {
    cookie_switch_status = {};
    cookie_detail_html = {};
    cookie_config = {};
    cookie_service_detail = {};
    cookie_type = "";
    purposeKeys = new Array("data", "duration", "recipient", "legal basis", "objection rights", "consequences", "subject rights", "transfer", "contact");
    serviceKeys = new Array("purpose", "tracking", "data", "legal basis", "processing location", "duration", "third countries", "recipient", "saving information");
    slideIndex = 1; 
    slideshow_text = ["Es gibt 4 verschiedene Zwecke, zu denen deine Daten verarbeitet werden", "Diese Zwecke bringen Risiken mit sich, haben aber auch Vorteile", "Ein Team von Datenschutzexperten hat die Vorteile und Risiken bewertet"]
    

    init(cookie_type = "") {
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
                this.showCookie();
            }
        });
    }

    /**
     * Replace inner html of the cookie placeholder and display the cookie
     */
    showCookie() {
        /*
        localStorage.setItem("interaction_page_1", false);
        localStorage.setItem("interaction_page_2", false);
        localStorage.setItem("clicked_page_2", false);
        localStorage.setItem("clicked_page_3", false);
        */
        document.getElementById('include-plugin').innerHTML = this.buildPlugin();

        // add click listener to the purpose cards
        this.addCardClickListener();
        this.addPurposeSwitchChangeListener();
        this.addProContraItemClickListener();
        this.addMoreInfoListener();
        this.showDivs(this.slideIndex);
        this.addSlideshowListener();

        for (let purpose of this.cookie_config["purpose"]) {
            this.setProContraContainerHeight(purpose["id"], purpose["pro"], purpose["contra"]);
        }

        new RecordEA(this.cookie_config, null);
    }

    /**
     * Builds the plugin with templates
     * Placeholders are replaced with the content specified in assets/json/cookie.json
     */
    buildPlugin() {
        let template = 
        `
        <div class="accordion accordion-vh-100 accordion-style" id="accordionExample">
            <div class="accordion-title">
                <img src="./assets/icons/ea-icon-black.svg" class="icon float-left">
                <p class="bold float-left">Dein Einwilligungsagent</p>
                <p class="float-right">bisher noch keine Einstellungen gespeichert</p>
            </div>

            <h2 class="accordion-header accordion-header-style" id="headingOne">
                <button class="accordion-button-style accordion-style-instructions no-click" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    <img class="accordion-icon" src="./assets/icons/accordion-instructions.svg"/>Anleitung
                </button>
            </h2>

            <div id="collapseOne" class="accordion-collapse collapse show accordion-style-instructions accordion-body-style" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                $instructions-content$
            </div>


            <h2 class="accordion-header accordion-header-style" id="headingTwo">
                <button class="collapsed accordion-button-style accordion-style-settings no-click" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                    <img class="accordion-icon" src="./assets/icons/accordion-settings.svg"/>Einstellungen
                    <!--div class="float-right legend">
                        <p><span class="dot dot-green dot-margin"></span><span class="dot dot-green dot-margin"></span><span class="dot dot-green dot-margin dot-end"></span>Vorteile</p>
                        <p><span class="dot dot-yellow dot-margin"></span><span class="dot dot-yellow dot-margin"></span><span class="dot dot-yellow dot-margin dot-end"></span>Risiken</p>
                    </div-->
                </button>
            </h2>

            <div id="collapseTwo" class="accordion-collapse collapse accordion-style-settings accordion-body-style" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                $settings-content$
            </div>      
        </div>
        `;


        template = this.injectSettingsContent(template);
        template = this.injectInstructionsContent(template);


        return template;
    }

    // example: https://mdbootstrap.com/docs/standard/extended/horizontal-accordion/
    injectSettingsContent(template) {

        let settingsContentTemplate =
        `
        <div class="purpose-card-container horizontal-accordion m-0 h-100">
            $purpose-cards$
        </div>
        `;

        // build the cards based on json file
        settingsContentTemplate = this.injectPurposeCards(settingsContentTemplate);
        template = template.replace("$settings-content$", settingsContentTemplate);

        return template;
    }

    // example: https://mdbootstrap.com/docs/standard/extended/horizontal-accordion/
    injectInstructionsContent(template) {
        let settingsContentTemplate =
        `
        <div class="m-0 flex-wrapper slideshow">
            <div class="slideshow-text-container float-left">
                <p class="slideshow-text">Es gibt 4 verschiedene Zwecke, zu denen deine Daten verarbeitet werden</p>
            </div>
            <div class="slideshow-image-container float-right">
                <div class="w3-content w3-display-container" style="max-width:800px">
                    <img class="mySlides" src="assets/images/slideshow-01.gif" style="width:100%">
                    <img class="mySlides" src="assets/images/slideshow-02.gif" style="width:100%">
                    <img class="mySlides" src="assets/images/slideshow-03.gif" style="width:100%">
                </div>
            </div>
        </div>
        <div class="slideshow-dot-container">
            <span class="slideshow-dot"></span>
            <span class="slideshow-dot"></span>
            <span class="slideshow-dot"></span>
        </div>
        `;

        template = template.replace("$instructions-content$", settingsContentTemplate);

        return template;
    }

    injectPurposeCards(template) {
        let cardTemplate = 
        `
        <div id="$id$-purpose-card" class="card purpose-card-choice purpose-card-normal $order$ $pos$">
            <div class="card-body">
                <div class="purpose-card-header">
                
                    <div class="outer-div normal">
                        <div class="form-check form-switch float-left purpose-card-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="$id$-purpose-switch-normal">
                        </div>
                        <div class="caret-container float-right">
                            <div class="caret-text caret-float caret-click">
                                <p class="caret-click">Erfahre mehr!</p>
                                <img class="caret-click caret-float" src="./assets/icons/arrow_right.svg"/>
                            </div>
                            <img class="caret-img caret-click" src="./assets/icons/arrow_down.svg"/>
                        </div>
                    </div>
                    <div class="purpose-card-title normal">
                        <img class="purpose-card-image" src="./assets/icons/purpose-$id$.svg"/>
                        <p class="purpose-card-title-text">$purpose-card-title$</p>
                    </div>

                    <div class="outer-div expand">
                        <div class="form-check form-switch float-right purpose-card-switch">
                            <input class="form-check-input float-right" type="checkbox" role="switch" id="$id$-purpose-switch-expand">
                        </div>
                        <div class="expand-container float-left">
                            <img class="purpose-card-image float-left" src="./assets/icons/purpose-$id$.svg"/>
                            <p class="purpose-card-title-text float-right">$purpose-card-title$</p>
                        </div>
                    </div>
                    <div class="purpose-card-title expand">
                        <div class="caret-container float-right">
                            <div class="caret-text caret-float caret-click">
                                <img class="caret-click caret-float" src="./assets/icons/arrow_right.svg"/>
                                <p class="caret-click caret-float">X</p>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="purpose-card-body-wrapper">
                    <div class="purpose-card-body">
                        $purpose-card-body$
                    </div>
                    <div class="purpose-card-body-expand">
                        $purpose-card-body-expand$
                    </div>
                </div>
            </div>
        </div>
        `

        let purposeCards = "";

        // config purpose-cards
        let i = 0;
        for (let purpose of this.cookie_config["purpose"]) {
            let card = cardTemplate;
            card = card.replace("$order$", "order-" + i);
            card = card.replace("$pos$", "pos-" + i);
            card = card.replaceAll("$purpose-card-title$", purpose["title"])
            card = this.injectPurposeCardBody(card); 
            card = this.injectPurposeCardBodyExpand(card, purpose);
            card = card.replaceAll("$id$", purpose["id"]);
            card = this.injectProContraItems(card, purpose["id"], purpose["pro"], purpose["contra"]); 
            purposeCards += card;
            i = i + 1;
        }

        template = template.replace("$purpose-cards$", purposeCards);

        return template
    }

    injectPurposeCardBody(template) {
        let cardBodyTemplate = 
        `
        <div class="accordion accordion-style pro-contra-accordion" id="$id$-pro-accordion">
            <div class="purpose-card-pro-contra purpose-card-pro outer">
                <div class="purpose-card-pro-contra purpose-card-pro inner">
                    $pro-items$
                </div>
            </div>
        </div>
        <div class="accordion accordion-style pro-contra-accordion" id="$id$-contra-accordion">
            <div class="purpose-card-pro-contra purpose-card-contra outer">
                <div class="purpose-card-pro-contra purpose-card-contra inner">
                    $contra-items$
                </div>
            </div>
        </div>
        `;

        template = template.replace("$purpose-card-body$", cardBodyTemplate);

        return template;
    }

    injectPurposeCardBodyExpand(template, purpose) {
        let cardBodyExpandTemplate = 
        `
        <img class="image-expand" src="./assets/icons/$image-expand$" />
        <div class="purpose-card-body-expand-wrapper">
            <div class="info">
                $purpose$
            </div>
            <div class="exceptions">
                <div class="info-text-wrapper">
                    <p class="title">Deine Ausnahmen</p>
                    <p>Bei diesen Websites hast du Ausnahmen für diesen Verarbeitungszweck vorgenommen, hier kannst du sie widerrufen:</p>
                    <p class="odd"></p>
                    <p class="even"></p>
                    <p class="odd"></p>
                    <p class="even"></p>
                    <p class="odd">noch keine Ausnahmen vorgenommen</p>
                    <p class="even"></p>
                    <p class="odd"></p>
                    <p class="even"></p>
                    <p class="odd"></p>
                    <p class="even"></p>
                </div>
            </div>
        </div>
        `;

        cardBodyExpandTemplate = cardBodyExpandTemplate.replace("$image-expand$", purpose["image-expand"]);
        template = template.replace("$purpose-card-body-expand$", cardBodyExpandTemplate);
        template = this.injectPurpose(template, purpose);

        return template;
    }

    injectProContraItems(template, id, pro, contra) {
        let proContraItemTemplate = 
        `
            <h2 class="accordion-header accordion-header-style" id="$purpose-id$-$item-id$-heading-accordion">
                <button class="purpose-card-pro-contra-item no-click" type="button" data-bs-toggle="collapse" data-bs-target="#$purpose-id$-$item-id$-collapse" aria-expanded="false" aria-controls="$purpose-id$-$item-id$-collapse">
                    <div class="purpose-card-pro-contra-item-wrapper">
                        <img class="pro-contra-item-icon" src="./assets/icons/$icon$"/>
                        <div class="purpose-card-pro-contra-item-text">
                            <p>$text$</p>
                        </div>
                        <img class="accordion-icon caret-float" src="./assets/icons/arrow_down.svg">
                    </div>
                    <div class="dots-margin-left">
                        $dots$
                    </div>
                </button>
            </h2>

            <div id="$purpose-id$-$item-id$-collapse" class="accordion-collapse collapse" aria-labelledby="$purpose-id$-$item-id$-heading-accordion" data-bs-parent="#$purpose-id$-$pro-contra$-accordion">
                <div class="pro-contra-item-text-expanded">
                    $text-expanded$
                </div>
            </div>
            
            $item-divider$
        `;

        let proItemsHtml = "";
        let contraItemsHtml = "";

        // filter items that will not be displayed
        let proItems = pro.filter(x => x["dots_num"] != 0);
        let contraItems = contra.filter(x => x["dots_num"] != 0);
        // get length
        let proItemsLen = proItems.length;
        let contraItemsLen = contraItems.length;

        // pro items

        let i = 1;
        for (let item of proItems) {
            if (item["dots_num"] != 0) {
                let proItem = proContraItemTemplate;
                proItem = proItem.replaceAll("$purpose-id$", id);   
                proItem = proItem.replaceAll("$item-id$", item["id"]);   
                proItem = proItem.replace("$icon$", item["icon"]);
                proItem = proItem.replace("$text$", item["text"]);
                proItem = proItem.replace("$pro-contra$", "pro");
                proItem = proItem.replace("$dots$", this.makeDots(item["dots_num"], "green"));
                proItem = proItem.replace("$text-expanded$", item["text_expanded"]);
                // add divider if not last item in list
                if (i != proItemsLen) {
                    proItem = this.injectDivider(proItem);
                } else {
                    proItem = proItem.replace("$item-divider$", "");
                }

                proItemsHtml += proItem;

                i = i + 1;
            }
        }

        // contra items
        i = 1;
        for (let item of contra) {
            if (item["dots_num"] != 0) {
                let contraItem = proContraItemTemplate;
                contraItem = contraItem.replaceAll("$purpose-id$", id);   
                contraItem = contraItem.replaceAll("$item-id$", item["id"]);   
                contraItem = contraItem.replace("$icon$", item["icon"]);
                contraItem = contraItem.replace("$text$", item["text"]);
                contraItem = contraItem.replace("$pro-contra$", "contra");
                contraItem = contraItem.replace("$dots$", this.makeDots(item["dots_num"], "yellow"));
                contraItem = contraItem.replace("$text-expanded$", item["text_expanded"]);
                // add divider if not last item in list
                if (i != contraItemsLen) {
                    contraItem = this.injectDivider(contraItem);
                } else {
                    contraItem = contraItem.replace("$item-divider$", "");
                }
                contraItemsHtml += contraItem;

                i = i + 1;
            }
        }

        template = template.replace("$pro-items$", proItemsHtml);
        template = template.replace("$contra-items$", contraItemsHtml);

        return template;
    }


    setProContraContainerHeight(id, pro, contra) {
        // filter items that will not be displayed
        let proItems = pro.filter(x => x["dots_num"] != 0);
        let contraItems = contra.filter(x => x["dots_num"] != 0);

        let proDotLen = 0
        let contraDotLen = 0
        // pro items

        let i = 1;
        for (let item of proItems) {
            if (item["dots_num"] != 0) {
                proDotLen += item["dots_num"];
            }
        }

        // contra items
        i = 1;
        for (let item of contraItems) {
            if (item["dots_num"] != 0) {
                contraDotLen += item["dots_num"];
            }
        }

        let proHeightPercent = 100 / (proDotLen + contraDotLen) * proDotLen;
        let contraHeightPercent = 100 - proHeightPercent;

        document.getElementById(id + "-pro-accordion").style.height = proHeightPercent + "%"; 
        document.getElementById(id + "-contra-accordion").style.height = contraHeightPercent + "%"; 
    }

    /*
    Get the position of the purpose-card
    */
    getCardPos(classList) {
        classList = Array.from(classList)
        let pos = classList.filter(s => s.includes('pos'));
        pos = pos[0].replace("pos-", "")

        return pos
    }

    /*
    Get the order-X class from the purpose-card
    */
    getCardOrder(classList) {
        classList = Array.from(classList)
        let order = classList.filter(s => s.includes('order'))

        return order[0];
    }

    /*
    Click listener for the purpose-cards (collapsing, changing order, etc.)
    */
    addCardClickListener() {
        const choiceArray = document.querySelectorAll(".purpose-card-choice")

        choiceArray.forEach((card) => {
            const caret = card.querySelectorAll(".caret-container")[0];
            console.log(caret);
            card.addEventListener("click", (parent) => {
                
                if(parent.target.classList.contains("caret-container") | parent.target.classList.contains("caret-click")) {

                if (card.classList.contains("purpose-card-small")) {
                    const choicesArray = document.querySelectorAll(".purpose-card-choice")
                    choicesArray.forEach((element) => {
                        if (element != card) {
                            element.classList.remove("purpose-card-expand")
                            element.classList.add("purpose-card-small")
                            // change order
                            //element.classList.remove(this.getCardOrder(element.classList))
                            //element.classList.add("order-" + this.getCardPos(element.classList))
                        }
                    })

                    card.classList.add("purpose-card-expand")
                    card.classList.remove("purpose-card-small")

                    // change order
                    const choiceArrayLen = choicesArray.length;
                    const orderFront = "order-" + choiceArrayLen
                    //card.classList.remove(this.getCardOrder(card.classList))
                    //card.classList.add(orderFront)
                } else if (card.classList.contains("purpose-card-expand")) {
                    const choicesArray = document.querySelectorAll(".purpose-card-choice")
                    choicesArray.forEach((element) => {
                        if (element != card) {
                            element.classList.remove("purpose-card-small")
                            element.classList.add("purpose-card-normal")
                        }
                    })

                    card.classList.add("purpose-card-normal")
                    card.classList.remove("purpose-card-expand")
                    // change order
                    card.classList.remove(this.getCardOrder(card.classList))
                    card.classList.add("order-" + this.getCardPos(card.classList))
                } else if (card.classList.contains("purpose-card-normal")) {
                    const choicesArray = document.querySelectorAll(".purpose-card-choice")
                    choicesArray.forEach((element) => {
                        if (element != card) {
                            element.classList.remove("purpose-card-normal")
                            element.classList.add("purpose-card-small")
                            // change order
                            //element.classList.remove(this.getCardOrder(element.classList))
                            //element.classList.add("order-" + this.getCardPos(element.classList))
                        }
                    })

                    card.classList.add("purpose-card-expand")
                    card.classList.remove("purpose-card-normal")
                    // change order
                    //const choiceArrayLen = choicesArray.length;
                    //const orderFront = "order-" + choiceArrayLen
                    //card.classList.remove(this.getCardOrder(card.classList))
                    //card.classList.add(orderFront)
                }
            }
            });
        });
    }

        /*
    Click listener for the purpose-cards (collapsing, changing order, etc.)
    */
    addProContraItemClickListener() {
        //const proContraAccordion = document.querySelectorAll(".purpose-card-pro-contra.inner");
        const proContraBody = document.querySelectorAll(".purpose-card-body");

        proContraBody.forEach((body) => {
            const proContraAccordion = body.querySelectorAll(".pro-contra-accordion");

            proContraAccordion.forEach((accordion) => {
                const proContraHeader = accordion.querySelectorAll(".accordion-header");
                const itemDivider = accordion.querySelectorAll(".item-divider");
                const riskDots = accordion.querySelectorAll(".dot");
                proContraHeader.forEach((header) => {
                    const button = header.querySelectorAll(".purpose-card-pro-contra-item")[0];

                    button.addEventListener("click", () => {
                        if (button.attributes["aria-expanded"].nodeValue == "true") {
                            header.classList.add("show");
                            accordion.classList.add("show");


                            itemDivider.forEach((divider) => {
                                divider.classList.add("hide");
                            });
                
                            riskDots.forEach((dot) => {
                                dot.classList.add("hide");
                            });

                            // change height
                            let id = "";
                            if (accordion.id.includes("-pro-accordion"))  {
                                id = accordion.id.replace("-pro-accordion", "");
                            } else if (accordion.id.includes("-contra-accordion")) {
                                id = accordion.id.replace("-contra-accordion", "");
                            }

                            document.getElementById(id + "-pro-accordion").style.height = "50%"; 
                            document.getElementById(id + "-contra-accordion").style.height = "50%"; 

                            proContraHeader.forEach((header) => {
                                const btn = header.querySelectorAll(".purpose-card-pro-contra-item")[0];

                                if (btn.attributes["aria-expanded"].nodeValue == "false") {
                                    btn.classList.add("hide");
                                    header.classList.add("hide");
                                }
                            });
                        }

                        if (button.attributes["aria-expanded"].nodeValue == "false") {
                            header.classList.remove("show");
                            accordion.classList.remove("show");

                            
                            itemDivider.forEach((divider) => {
                                divider.classList.remove("hide");
                            });

                            riskDots.forEach((dot) => {
                                dot.classList.remove("hide");
                            });

                            
                            // change height
                            let id = "";
                            if (accordion.id.includes("-pro-accordion"))  {
                                id = accordion.id.replace("-pro-accordion", "");
                            } else if (accordion.id.includes("-contra-accordion")) {
                                id = accordion.id.replace("-contra-accordion", "");
                            }

                            proContraHeader.forEach((header) => {
                                const btn = header.querySelectorAll(".purpose-card-pro-contra-item")[0];

                                if (btn.attributes["aria-expanded"].nodeValue == "false") {
                                    btn.classList.remove("hide");
                                    header.classList.remove("hide");
                                }
                            });

                            let setWeightedHeight = false;
                            let all_headers = body.querySelectorAll(".purpose-card-pro-contra-item")
                            all_headers.forEach((_header) => {

                                if (_header.attributes["aria-expanded"].nodeValue == "false") {
                                   // _header.classList.remove("hide");
                                } else {
                                    setWeightedHeight = true;
                                }
                            });

                            if (!setWeightedHeight) {
                                for (let purpose of this.cookie_config["purpose"]) {
                                    if (id == purpose["id"]) {
                                        this.setProContraContainerHeight(purpose["id"], purpose["pro"], purpose["contra"]);
                                    }
                                }
                            }
                        }
                    });
                });
            });
        });
    }  

    getFormCheckInputCheckedState(formCheckInputId) {
        let state =	$(formCheckInputId).prop('checked');

        return state;
    }

    addPurposeSwitchChangeListener() {
        for (let purpose of this.cookie_config["purpose"]) {
            const purposeSwitchNormal = $("#" + purpose["id"] + "-purpose-switch-normal");
            const purposeSwitchExpand = $("#" + purpose["id"] + "-purpose-switch-expand");
            const purposeCard = document.querySelectorAll("#" + purpose["id"] + "-purpose-card")[0];

            purposeSwitchNormal[0].addEventListener('change', function() {
                if (this.checked) {
                    purposeCard.classList.add("checked-true")
                } else {
                    purposeCard.classList.remove("checked-true")
                }
                purposeSwitchExpand.prop("checked", this.checked);
            });

            purposeSwitchExpand[0].addEventListener('change', function() {
                if (this.checked) {
                    purposeCard.classList.add("checked-true")
                } else {
                    purposeCard.classList.remove("checked-true")
                }
                purposeSwitchNormal.prop("checked", this.checked);
            });
        }
    }

    addMoreInfoListener() {
        const moreInfoButtons = document.querySelectorAll(".caret-container");

        moreInfoButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const pro_contra_items = document.querySelectorAll(".purpose-card-pro-contra-item");
                
                pro_contra_items.forEach((item) => {
                    if (item.attributes["aria-expanded"].nodeValue == "true") {
                        item.click();
                    }
                });

            })
        });
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
                tmp_dots = tmp_dots.replace("$margin$", "");
            } else {
                tmp_dots = tmp_dots.replace("$margin$", "");
            }
    
            dots += tmp_dots;
    
        }
    
        return dots;
    }

    injectPurpose(template, purpose) {
        let purposeKeys = new Array("data", "duration", "profiling", "recipient", "legal basis", "objection rights", "consequences", "subject rights", "transfer");

        //let purposeKeys = [...this.purposeKeys];

        let content = "";
        // create placeholder string
        for (let key of purposeKeys) {
            content += "$" + key + "$\n"
            console.log(purposeKeys.length);
        }

        content = 
        `
                <div class="info-text-wrapper">
                    <p class="title">Rechtliche Informationen</p>
        `
                + content + 
        `   
                </div>
        `;

        // replace placeholders with json config text
        content = this.replacePurpose(content, purpose, purposeKeys);  
        template = template.replace("$purpose$", content);
        template = template.replaceAll("$id$", purpose["id"]);

        return template;
    }


    replacePurpose(content, purposeArray, purposeKeyList) {
        for (let purposeKey of purposeKeyList) {
            if (purposeArray.hasOwnProperty(purposeKey)) {
                let purposeValue = purposeArray[purposeKey];
                if (purposeValue != null) {
                    let index = purposeValue.indexOf(":");
                    purposeValue = "<p class='info-text'><span class='bold'>" + purposeValue.slice(0, index + 1) + "</span>" + purposeValue.slice(index + 1) + "</p>";
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

    addSlideshowListener() {
        const slideshow_dots = document.querySelectorAll(".slideshow-dot");
        
        let i = 1;
        let that = this;
        slideshow_dots.forEach((dot) => {
            const j = i;
            dot.addEventListener("click", () => {
                console.log(j);
                that.currentDiv(j);
            });
            i = i + 1;
        })
    }

    injectDivider(template) {
        let dividerTemplate =
        `
        <div class="item-divider">
            <p></p>
        </div>
        `;

        template = template.replace("$item-divider$", dividerTemplate);

        return template;
    }

    plusDivs(n) {
        this.showDivs(this.slideIndex += n);
    }

    currentDiv(n) {
        this.showDivs(this.slideIndex = n);
    }

    showDivs(n) {
        let i;
        let x = document.getElementsByClassName("mySlides");
        let dots = document.getElementsByClassName("slideshow-dot");
        let slideshow_text = document.getElementsByClassName("slideshow-text");
        if (n > x.length) {this.slideIndex = 1}
        if (n < 1) {this.slideIndex = x.length}
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";  
        }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        x[this.slideIndex-1].style.display = "block";  
        dots[this.slideIndex-1].className += " active";
        slideshow_text[0].textContent = this.slideshow_text[this.slideIndex - 1];
    }
}


  