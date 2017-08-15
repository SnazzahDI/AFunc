const Plugin = module.parent.require('../Structures/Plugin');
const EventEmitter = require('eventemitter3');

class AFunc extends Plugin {
    constructor(...args) {
        super(...args);
        window.A = (a,b)=>new AFuncClass(a,b);
        window.A.plugin = this;
        window.A.require = require;
        window.A.Watcher = new AFWatcher();
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