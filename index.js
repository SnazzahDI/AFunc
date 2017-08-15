const Plugin = module.parent.require('../Structures/Plugin');
const EventEmitter = require('eventemitter3');
const $ = require("jquery");

class AFunc extends Plugin {
    constructor(...args) {
        super(...args);
        window.A = (a,b)=>new AFuncClass(a,b);
        window.A.plugin = this;
        window.A.require = require;
        window.A.Watcher = new AFWatcher();
        window.A.dialog = AFDialog;
        window.A.class = AFuncClass;
        window.A.parseDom = (dom, pdom) => {
            if(dom && dom.constructor && dom.constructor.name === "jQuery"){
                return dom[1]
            }else if(typeof dom === 'string') return (pdom ? pdom : document).querySelector(dom); else return dom;
        }
    }

    parseHTML(html) {
        return document.createRange().createContextualFragment(html);
    }

    unload(){
        window.A.Watcher.mo.disconnect();
        delete window.A;
    }

    get configTemplate() {
        return {
            color: 'dac372'
        };
    }
}

class AFWatcher extends EventEmitter {
    constructor() {
        super();
        this.mo = new MutationObserver(mrs => mrs.forEach(mr => this._checkRecord(mr)));
        this.inSettings = document.querySelectorAll(".layers").length === 2;
        this.mo.observe(document.querySelector("[data-reactroot]"), { childList: true, subtree: true });
    }

    _checkForOptions() {
        if(($(".app>*:first-child")[0].childNodes.length === 2) !== this.inSettings){
            if(this.inSettings){
                this.emit('settingsExit');
                this.settingsType = null;
            }else{
                this.emit('settingsEnter', document.querySelector('.avatar-xxlarge') ? 'user' : 'guild');
                this.settingsType = document.querySelector('.avatar-xxlarge') ? 'user' : 'guild';
            }
            this.inSettings = !this.inSettings;
        };
        if($(".item-3879bf.selected-eNoxEK").html() !== this.currentTab && this.inSettings){
            this.emit('settingsTab', $(".item-3879bf.selected-eNoxEK").html());
            this.currentTab = $(".item-3879bf.selected-eNoxEK").html();
        }
    }

    _checkRecord(rec) {
        this._checkForOptions();
        this.emit('mutation', rec);
        rec.addedNodes.forEach(n => {
            if(n.classList && n.classList.contains('popout')){
                if(n.childNodes[0].classList.contains('userPopout-4pfA0d')) this.emit('userPopout', {
                    user: window.DI.getReactInstance(n.childNodes[0])._currentElement.props.children[1].props.children[1] ? window.DI.getReactInstance(n.childNodes[0])._currentElement.props.children[1].props.children[1][1].props.user : null,
                    guild: window.DI.getReactInstance(n.childNodes[0])._currentElement.props.children[1].props.children[1] ? window.DI.getReactInstance(n.childNodes[0])._currentElement.props.children[1].props.children[1][1].props.guild : null,
                    userId: window.DI.getReactInstance(n.childNodes[0])._currentElement.props.children[1].props.children[2][1].props.userId
                });
                if(n.childNodes[0].classList.contains('rtc-connection-popout')) this.emit('rtcConnection');
                if(n.childNodes[0].classList.contains('autocomplete-popout')) this.emit('autoCompletePopout');
                if(n.childNodes[0].classList.contains('guild-settings-audit-logs-user-filter-popout')) this.emit('auditLogsUserFilterPopout');
                if(n.childNodes[0].classList.contains('guild-settings-audit-logs-action-filter-popout')) this.emit('auditLogsActionFilterPopout');
            }
            if(n.classList && n.classList.contains('modal-2LIEKY')){
                if(n.childNodes[0].childNodes[0].id === 'user-profile-modal') this.emit('userModal', window.DI.getReactInstance(n.querySelector('.discord-tag').parentNode)._currentElement.props.children[0].props.user);
                if(n.childNodes[0].childNodes[0].classList.contains('modal-image')) this.emit('imageModal', n.childNodes[0].childNodes[0].childNodes[0].src);
                if(n.childNodes[0].classList.contains('region-select-modal')) this.emit('regionSelectModal');
                if(n.childNodes[0].classList.contains('create-guild-container')) this.emit('guildModal');
                if(n.childNodes[0].classList.contains('quickswitcher-container')) this.emit('quickSwitcher');
            }
        });
    }

    log(...args) {
        console.log(`%c[AFunc] %c[MutationObserver]`, `color: #dac372; font-weight: bold;`, `font-weight: bold;`, ...args);
    }
}

class AFDialog {
    constructor(type, options) {
        if(!['default'].includes(type)) type = 'default';
        if(typeof options !== 'object') throw new Error('Options is required as an object!');
        if(typeof options.title !== 'string') throw new Error('Title is required as an string!');
        if(typeof options.content !== 'string') throw new Error('Content is required as an string!');
        if(typeof options.sanitize !== 'boolean') options.sanitize = true;
        options.buttons = this._parseButtons(options.buttons);
        this.options = options;
        this.type = type;
    }

    static get calloutBackdrop() {
        let calloutBackdrop = document.createElement('div');
        calloutBackdrop.className = "afunc-dom callout-backdrop";
        return calloutBackdrop;
    }

    static get modalOuter() {
        let modal = document.createElement('div');
        modal.className = "afunc-dom modal-2LIEKY";
        let inner = document.createElement('div');
        inner.className = "inner-1_1f7b";
        modal.appendChild(inner);
        return modal;
    }

    static get closeButton() {
        return window.A.plugin.parseHTML(`<svg class="close-3RZM3j flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>`).childNodes[0];
    }

    static get modalWrapper() {
        return document.querySelector('.nux-highlights+div+div')
    }

    _san(text){ return this.options.sanitize ? window.DI.Helpers.sanitize(text) : text; }

    _parseButtons(nbtns){
        let btns = nbtns;
        if(!(nbtns instanceof Array)) btns = [nbtns];
        return btns.map(btn => {
            if(typeof btns !== 'object') return undefined;
            if(typeof btn.text !== 'string') throw new Error('Button text is required as an string!');
            if(!['default','outline'].includes(btn.style)) btn.style = 'default';
            if(!['string','function'].includes(typeof btn.onClick)) btn.onClick = 'close';
            if(typeof btn.onClick === 'string' && btn.onClick != 'close') throw new Error('Invalid button callback string!'); else btn.onClick = this.hide.bind(this);
            return btn;
        }).filter(b => typeof b !== 'undefined');
    }

    hide(){
        if(!this.modal || !this.cbd) return;
        let modal = this.modal;
        let cbd = this.cbd;
        modal.classList.add('afunc-off');
        cbd.classList.add('afunc-off');
        this.modal = null;
        this.cbd = null;
        setTimeout(()=>{
            AFDialog.modalWrapper.removeChild(modal);
            AFDialog.modalWrapper.removeChild(cbd);
        }, 500);
    }

    show(){
        let calloutBackdrop = AFDialog.calloutBackdrop;
        calloutBackdrop.onclick = this.hide.bind(this);
        let outer = AFDialog.modalOuter;
        let modal = document.createElement('div');
        outer.childNodes[0].appendChild(modal);
        if(this.type === 'default'){
            modal.className = "modal-3HOjGZ modal-KwRiOq size-2pbXxj";

            let titleBlock = document.createElement('div');
            titleBlock.className = "flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE";
            titleBlock.style = "flex: 0 0 auto;";
            let title = document.createElement('h4');
            title.className = "h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl";
            title.innerHTML = this._san(this.options.title);
            titleBlock.appendChild(title);

            let contentWrap = document.createElement('div');
            contentWrap.className = "scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW";
            let contentScroller = document.createElement('div');
            contentScroller.className = "scroller-fzNley inner-tqJwAU content-3KEfmo selectable";
            let content = document.createElement('div');
            content.className = "medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn selectable-prgIYK";
            content.style = "padding-bottom: 20px;";
            content.innerHTML = this._san(this.options.content);
            contentWrap.appendChild(contentScroller);
            contentScroller.appendChild(content);

            modal.appendChild(titleBlock);
            modal.appendChild(contentWrap);

            if(this.options.closeButton){
                let closeButton = AFDialog.closeButton;
                closeButton.onclick = this.hide.bind(this);
                titleBlock.appendChild(closeButton);
            }

            if(this.options.buttons.length > 0){
                let buttonBlock = document.createElement('div');
                buttonBlock.className = "flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw";
                buttonBlock.style = "flex: 0 0 auto;";
                this.options.buttons.map(btn => {
                    let button = document.createElement('button');
                    button.style = "flex: 0 0 auto;";
                    button.onclick = btn.onClick;
                    let buttonInner = document.createElement('div');
                    buttonInner.innerHTML = window.DI.Helpers.sanitize(btn.text);
                    if(btn.style === 'default'){
                        button.className = "buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu";
                        buttonInner.className = "contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM";
                    }else if(btn.style === 'outline'){
                        button.className = "buttonRedOutlinedDefault-1VCgwL buttonOutlinedDefault-3FNQnZ buttonDefault-2OLW-v button-2t3of8 buttonOutlined-38aLSW buttonRedOutlined-2t9fm_ smallGrow-2_7ZaC";
                        buttonInner.className = "contentsDefault-nt2Ym5 contents-4L4hQM contentsOutlined-mJF6nQ contents-4L4hQM";
                    }
                    button.appendChild(buttonInner);
                    buttonBlock.appendChild(button);
                });
                modal.appendChild(buttonBlock);
            }
        }
        this.modal = outer;
        this.cbd = calloutBackdrop;
        AFDialog.modalWrapper.appendChild(calloutBackdrop);
        AFDialog.modalWrapper.appendChild(outer);
    }
}

class AFuncClass {
    constructor(obj, p) {
        this.pdom = window.A.parseDom(p);
        this.dom = window.A.parseDom(obj, this.pdom);
        if(this.dom && !this.dom._afuncProperties) this.dom._afuncProperties = {};
    }

    tooltip(direction, text, options){
        if(!this.dom) throw new Error('No DOM found in the class!');
        this.unbindTooltip();
        function getClassName(dir){ return `tooltip tooltip-${dir} tooltip-${options && options.style ? options.style : "normal"} ${options && options.className ? options.className : ""}` }
        if(!['top','bottom','left','right'].includes(direction)) throw new Error("Invalid direction!");
        if(options && options.style && !['error','success','warning'].includes(options.style)) throw new Error("Invalid style!");
        this.dom._afuncProperties.tooltip_mw = ()=>{
            let tt = this.dom._afuncProperties.tooltip;
            if(!this.dom._afuncProperties.tooltip_up) return;
            let position = this.dom.getBoundingClientRect();
            let newpos = {
                top: position.top,
                left: position.left
            };
            if(direction === "top"){
                newpos.top -= tt.getBoundingClientRect().height;
                newpos.left += position.width/2 - tt.getBoundingClientRect().width/2 - 1;
            }else if(direction === "bottom"){
                newpos.top += position.height;
                newpos.left += position.width/2 - tt.getBoundingClientRect().width/2 - 1;
            }else if(direction === "right"){
                newpos.top += position.height/2 - tt.getBoundingClientRect().height/2 - 1;
                newpos.left += position.width;
            }else if(direction === "left"){
                newpos.top += position.height/2 - tt.getBoundingClientRect().height/2 - 1;
                newpos.left -= tt.getBoundingClientRect().width;
            }
            tt.style.top = `${newpos.top}px`;
            tt.style.left = `${newpos.left}px`;
        }
        this.dom._afuncProperties.tooltip_mh = ()=>{
            let tt = document.createElement("div");
            tt.className = getClassName(direction);
            tt.innerHTML = text;
            this.dom._afuncProperties.tooltip = tt;
            document.querySelector(".tooltips").appendChild(this.dom._afuncProperties.tooltip);
            this.dom._afuncProperties.tooltip_up = true;
            let position = this.dom.getBoundingClientRect();
            let newpos = {
                top: position.top,
                left: position.left,
            };
            if(direction === "top"){
                newpos.top -= tt.getBoundingClientRect().height;
                newpos.left += position.width/2 - tt.getBoundingClientRect().width/2 - 1;
            }else if(direction === "bottom"){
                newpos.top += position.height;
                newpos.left += position.width/2 - tt.getBoundingClientRect().width/2 - 1;
            }else if(direction === "right"){
                newpos.top += position.height/2 - tt.getBoundingClientRect().height/2 - 1;
                newpos.left += position.width;
            }else if(direction === "left"){
                newpos.top += position.height/2 - tt.getBoundingClientRect().height/2 - 1;
                newpos.left -= tt.getBoundingClientRect().width;
            }
            tt.style.top = `${newpos.top}px`;
            tt.style.left = `${newpos.left}px`;
        }
        this.dom._afuncProperties.tooltip_mo = ()=>{
            if(this.dom._afuncProperties.tooltip_up) document.querySelector(".tooltips").removeChild(this.dom._afuncProperties.tooltip);
            this.dom._afuncProperties.tooltip_up = false;
        }
        this.dom._afuncProperties.tooltip_mw = this.dom._afuncProperties.tooltip_mw.bind(this);
        this.dom._afuncProperties.tooltip_mh = this.dom._afuncProperties.tooltip_mh.bind(this);
        this.dom._afuncProperties.tooltip_mo = this.dom._afuncProperties.tooltip_mo.bind(this);
        this.dom.addEventListener('mouseover', this.dom._afuncProperties.tooltip_mh);
        this.dom.addEventListener('mouseout', this.dom._afuncProperties.tooltip_mo);
        document.addEventListener('scroll', this.dom._afuncProperties.tooltip_mw);
        return this;
    }

    unbindTooltip(){
        if(this.dom._afuncProperties.tooltip_mo) this.dom._afuncProperties.tooltip_mo();
        this.dom.removeEventListener('mouseover', this.dom._afuncProperties.tooltip_mh);
        this.dom.removeEventListener('mouseout', this.dom._afuncProperties.tooltip_mo);
        document.removeEventListener('scroll', this.dom._afuncProperties.tooltip_mw);
        delete this.dom._afuncProperties.tooltip_mh;
        delete this.dom._afuncProperties.tooltip_mo;
        delete this.dom._afuncProperties.tooltip_mw;
        delete this.dom._afuncProperties.tooltip_up;
        delete this.dom._afuncProperties.tooltip;
        return this;
    }
}

module.exports = AFunc;