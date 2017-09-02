const Plugin = module.parent.require('../Structures/Plugin');
const EventEmitter = require('eventemitter3');

class AFunc extends Plugin {
    constructor(...args) {
        super(...args);
        if(window.A && window.A.Watcher) this.pausedEvents = window.A.Watcher._events;
        window.A = (a,b)=>new AFuncClass(a,b);
        window.A.plugin = this;
        window.A.require = require;
        window.A.Watcher = new AFWatcher();
        if(this.pausedEvents) window.A.Watcher._events = this.pausedEvents;
        window.A.dialog = AFDialog;
        window.A.contextMenu = AFContextMenu;
        window.A.class = AFuncClass;
        window.A.parseDom = (dom, pdom) => {
            if(dom && dom.constructor && dom.constructor.name === "jQuery"){
                return dom[1]
            }else if(typeof dom === 'string') return (pdom ? pdom : document).querySelector(dom); else return dom;
        }
        window.A.listParents = e => {
            let list = [];
            let iterate = parent => {
                if(parent !== null && parent.parentNode !== null){
                    list.push(parent.parentNode);
                    iterate(parent.parentNode);
                }
            }
            iterate(e);
            return list;
        }
        window.A.games = {
            getRunning: () => {
                let games = [];
                for (let x in JSON.parse(window.DI.localStorage.RunningGameStore).gameOverrides) {
                    let game = JSON.parse(window.DI.localStorage.RunningGameStore).gameOverrides[x]
                    if (game.pid) {
                        games.push(game);
                    }
                };
                return games;
            },
            getOverrides: () => {
                let games = [];
                for (let x in JSON.parse(window.DI.localStorage.RunningGameStore).gameOverrides) {
                    let game = JSON.parse(window.DI.localStorage.RunningGameStore).gameOverrides[x]
                    if (game.pid) {
                        games.push(game);
                    }
                };
                return games;
            },
            getSeen: () => {
                return JSON.parse(window.DI.localStorage.RunningGameStore).gamesSeen;
            },
            getOverlayEnabled: () => {
                return JSON.parse(window.DI.localStorage.RunningGameStore).enableOverlay;
            }
        }
    }

    parseHTML(html) {
        return document.createRange().createContextualFragment(html);
    }

    unload(){
        window.A.Watcher.mo.disconnect();
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
        if((document.querySelector(".app>*:first-child").childNodes.length === 2) !== this.inSettings){
            if(this.inSettings){
                this.emit('settingsExit');
                this.settingsType = null;
            }else{
                this.emit('settingsEnter', document.querySelector('.avatar-xxlarge') ? 'user' : 'guild');
                this.settingsType = document.querySelector('.avatar-xxlarge') ? 'user' : 'guild';
            }
            this.inSettings = !this.inSettings;
        };
        if(document.querySelector(".item-3879bf.selected-eNoxEK") && document.querySelector(".item-3879bf.selected-eNoxEK").innerHTML !== this.currentTab && this.inSettings){
            this.emit('settingsTab', document.querySelector(".item-3879bf.selected-eNoxEK").innerHTML);
            this.currentTab = document.querySelector(".item-3879bf.selected-eNoxEK").innerHTML;
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
                if(n.childNodes[0].classList.contains('context-menu') && !n.childNodes[0].classList.contains('afunc-dom')) this.emit('modalContextMenu');
            }else if(n.classList && n.classList.contains('modal-2LIEKY')){
                if(n.childNodes[0].childNodes[0].id === 'user-profile-modal') this.emit('userModal', window.DI.getReactInstance(n.querySelector('.discord-tag').parentNode)._currentElement.props.children[0].props.user);
                if(n.childNodes[0].childNodes[0].classList.contains('modal-image')) this.emit('imageModal', n.childNodes[0].childNodes[0].childNodes[0].src);
                if(n.childNodes[0].childNodes[0].classList.contains('region-select-modal')) this.emit('regionSelectModal');
                if(n.childNodes[0].childNodes[0].classList.contains('create-guild-container')) this.emit('guildModal');
                if(n.childNodes[0].childNodes[0].classList.contains('quickswitcher-container')) this.emit('quickSwitcher');
                if(n.childNodes[0].childNodes[0].classList.contains('premium-payment-modal')) this.emit('nitroModal');
                if(n.childNodes[0].childNodes[0].classList.contains('instant-invite-modal')) this.emit('inviteModal', n.childNodes[0].childNodes[0].childNodes[0][0].value);
            }else if(n.classList && n.classList.contains('message-group')){
                let inst = window.DI.getReactInstance(n);
                this.emit('messageGroup', {
                    channel: inst._currentElement.props.children[1].props.children[0][0].props.channel,
                    message: inst._currentElement.props.children[1].props.children[0][0].props.message,
                    instance: inst,
                    element: n
                });
            }else if(n.classList && n.classList.contains('context-menu')){
                let inst = window.DI.getReactInstance(n);
                if(!inst) return;
                if(inst._currentElement.props.children[1]
                    && inst._currentElement.props.children[1].props.channel){
                    this.emit('contextMenu', {
                        type: 'channel',
                        guild: inst._currentElement.props.children[1].props.guild,
                        channel: inst._currentElement.props.children[1].props.channel,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[2]
                        && inst._currentElement.props.children[2].props.guild){
                    this.emit('contextMenu', {
                        type: 'guild',
                        guild: inst._currentElement.props.children[2].props.guild,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[3]
                        && inst._currentElement.props.children[3].props.user){
                    this.emit('contextMenu', {
                        type: 'member',
                        user: inst._currentElement.props.children[3].props.user,
                        channelId: inst._currentElement.props.children[3].props.channelId,
                        guildId: inst._currentElement.props.children[3].props.guildId,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[2]
                        && inst._currentElement.props.children[2].props.user){
                    this.emit('contextMenu', {
                        type: 'member',
                        user: inst._currentElement.props.children[2].props.user,
                        channelId: inst._currentElement.props.children[2].props.channelId,
                        guildId: inst._currentElement.props.children[2].props.guildId,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[2]
                        && inst._currentElement.props.children[2].props.children
                        && inst._currentElement.props.children[2].props.children[0]
                        && inst._currentElement.props.children[2].props.children[0].props.message){
                    this.emit('contextMenu', {
                        type: 'message',
                        channel: inst._currentElement.props.children[2].props.children[0].props.channel,
                        message: inst._currentElement.props.children[2].props.children[0].props.message,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[3]
                        && inst._currentElement.props.children[3].props.children
                        && inst._currentElement.props.children[3].props.children[2]
                        && inst._currentElement.props.children[3].props.children[2].props.user){
                    this.emit('contextMenu', {
                        type: 'groupMember',
                        user: inst._currentElement.props.children[3].props.children[2].props.user,
                        channelId: inst._currentElement.props.children[2].props.children.channelId,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[0]
                        && inst._currentElement.props.children[0].props.children
                        && inst._currentElement.props.children[0].props.children[2]
                        && inst._currentElement.props.children[0].props.children[2].props.user){
                    this.emit('contextMenu', {
                        type: 'dm',
                        user: inst._currentElement.props.children[0].props.children[2].props.user,
                        channelId: inst._currentElement.props.children[0].props.children[2].props.channelId,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[0]
                        && inst._currentElement.props.children[0].props.children
                        && inst._currentElement.props.children[0].props.children[1]
                        && inst._currentElement.props.children[0].props.children[1].props.channel){
                    this.emit('contextMenu', {
                        type: 'group',
                        channel: inst._currentElement.props.children[0].props.children[1].props.channel,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[1]
                        && inst._currentElement.props.children[1].props.children
                        && inst._currentElement.props.children[1].props.children[0]
                        && inst._currentElement.props.children[1].props.children[0].props.user){
                    this.emit('contextMenu', {
                        type: 'user',
                        user: inst._currentElement.props.children[1].props.children[0].props.user,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children.props
                        && inst._currentElement.props.children.props.children
                        && inst._currentElement.props.children.props.children[0]
                        && inst._currentElement.props.children.props.children[0].props.label
                        && inst._currentElement.props.children.props.children[0].props.image){
                    this.emit('contextMenu', {
                        type: 'react',
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[0]
                        && inst._currentElement.props.children[0].key
                        && inst._currentElement.props.children[0].props.label
                        && inst._currentElement.props.children[0].props.styles){
                    this.emit('contextMenu', {
                        type: 'roles',
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children.props
                        && inst._currentElement.props.children.props.children
                        && inst._currentElement.props.children.props.children[0]
                        && inst._currentElement.props.children.props.children[0].key
                        && inst._currentElement.props.children.props.children[0].props.label){
                    this.emit('contextMenu', {
                        type: 'inviteServer',
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children.props
                        && inst._currentElement.props.children.props.src){
                    this.emit('contextMenu', {
                        type: 'image',
                        url: inst._currentElement.props.children.props.href,
                        proxyUrl: inst._currentElement.props.children.props.src,
                        instance: inst,
                        element: n
                    });
                }else if(inst._currentElement.props.children[2]
                        && inst._currentElement.props.children[2].props.children
                        && inst._currentElement.props.children[2].props.children.props
                        && inst._currentElement.props.children[2].props.children.props.channel){ // system messages
                    this.emit('contextMenu', {
                        type: 'systemMessage',
                        channel: inst._currentElement.props.children[2].props.children.props.channel,
                        message: inst._currentElement.props.children[2].props.children.props.message,
                        instance: inst,
                        element: n
                    });
                }else{
                    this.emit('contextMenu', {
                        type: 'unknown',
                        instance: inst,
                        element: n
                    });
                }
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
        if(typeof options.title !== 'string') throw new Error('Title is required as a string!');
        if(![typeof options.content === 'string', options.content instanceof HTMLElement, options.content instanceof Array].includes(true)) throw new Error('Content is required as either a string, element or an array of elements!');
        if(options.content instanceof Array && options.content.map(e => e instanceof HTMLElement).includes(false)) throw new Error('Content is required as either a string, element or an array of elements!');
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
        return document.querySelector('.nux-highlights+div+div');
    }

    _san(text){ return this.options.sanitize ? window.DI.Helpers.sanitize(text) : text; }

    _parseButtons(nbtns){
        let btns = nbtns;
        if(!(nbtns instanceof Array)) btns = [nbtns];
        return btns.map(btn => {
            if(typeof btns !== 'object') return undefined;
            if(typeof btn.text !== 'string') throw new Error('Button text is required as a string!');
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
        if(this.modal) return this.modal.childNodes[0].childNodes[0];
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
            if(typeof this.options.content === 'string'){
                content.innerHTML = this._san(this.options.content);
            }else if(this.options.content instanceof HTMLElement){
                content.appendChild(this.options.content);
            }else{
                this.options.content.map(e => content.appendChild(e));
            }
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
        return modal;
    }
}

class AFContextMenu extends EventEmitter {
    constructor() {
        super();
        this.items = [];
        this.child = null;
        this.parent = null;
    }

    static get contextOuter() {
        let popout = document.createElement('div');
        popout.className = "popout popout-bottom no-arrow no-shadow";
        let ctx = document.createElement('div');
        ctx.className = "context-menu afunc-dom";
        ctx.classList.add(document.querySelector('.app').classList[2]);
        popout.appendChild(ctx);
        return popout;
    }

    static get contextWrapper() {
        return document.querySelector('.nux-highlights+div');
    }

    static fromArray(items) {
        if(!(items instanceof Array)) throw new Error('Items must be in a array!');
        let ctx = new AFContextMenu();
        items.map(i => {
            if(i instanceof Array) ctx.addItemGroup(...i); else ctx.addItem(i);
        });
        return ctx;
    }

    _san(text){ return this.options.sanitize ? window.DI.Helpers.sanitize(text) : text; }

    _parseItem(item){
        if(typeof item !== 'object') throw new Error('Item is not an object!');
        if(item.image && typeof item.image !== 'string') throw new Error('Image needs to be a string!');
        if(item.image && item.hint) throw new Error('Image and hint are mutually exlusive!');
        if(typeof item.text !== 'string') throw new Error('Item text is required as a string!');
        if(typeof item.onClick !== 'function') throw new Error('On click is required as a function!');
        if(item.hint && typeof item.hint !== 'string') throw new Error('Hint needs to be a string!');
        if(item.onHover && typeof item.onHover !== 'function') throw new Error('On hover needs to be a function!');
        if(item.onHoverOut && typeof item.onHoverOut !== 'function') throw new Error('On hover out needs to be a function!');
        if(item.subMenuItems && !(item.subMenuItems instanceof Array)) throw new Error('Sub menu items out needs to be an array!');
        if(typeof item.danger !== 'boolean') item.danger = false;
        if(typeof item.disabled !== 'boolean') item.disabled = false;
        if(typeof item.sanitize !== 'boolean') item.sanitize = true;
        return item;
    }

    _listCtxParents(ctx){
        let list = [];
        let iterate = parent => {
            if(parent !== null && parent._afuncCtxParent !== undefined){
                list.push(parent._afuncCtxParent);
                iterate(parent._afuncCtxParent);
            }
        }
        iterate(ctx);
        return list;
    }

    _listParents(ctx){
        let list = [];
        let iterate = parent => {
            if(parent !== null && parent.parent !== null){
                list.push(parent.parent);
                iterate(parent.parent);
            }
        }
        iterate(ctx);
        return list;
    }

    _listCtxChildren(ctx){
        let list = [];
        let iterate = parent => {
            if(parent !== null && parent.child !== null){
                list.push(parent.child);
                iterate(parent.child);
            }
        }
        iterate(ctx);
        return list;
    }

    _hookToParentMenu(item, parentctx){
        this.parent = parentctx;
        parentctx.child = this;
        let childHideBind = () => {
            this.hide();
            parentctx.child = null;
        };
        let childHovering = false;
        let dontHandle = false;
        let childHover = e => {
            if(this.childHovering) return;
            this.appendToElement(e.target);
            this.childHovering = true;
        };
        let childHoverOut = e => {
            if(!this.childHovering || e.toElement && e.toElement.parentNode && e.toElement.parentNode.parentNode
                && e.toElement.parentNode.parentNode === this.ctx) return;
            this.hide();
            this.childHovering = false;
        };
        let childContextHoverOut = e => {
            if(e.toElement && e.toElement.parentNode && e.toElement.parentNode.parentNode && !e.toElement.parentNode.parentNode._afuncCtxClass) this._listParents(this).map(c => {if(c.parent) c.hide();});
                else if(e.toElement && e.toElement.parentNode && e.toElement.parentNode.parentNode && this._listCtxChildren(e.toElement.parentNode.parentNode._afuncCtxClass).length > 0) this._listCtxChildren(e.toElement.parentNode.parentNode._afuncCtxClass).reverse().map(c=>c.hide());
            if(!this.childHovering || e.toElement === item || e.toElement && e.toElement.parentNode && e.toElement.parentNode.parentNode
                && (e.toElement.parentNode.parentNode === this.ctx || this._listCtxParents(e.toElement.parentNode.parentNode).includes(this.ctx))) return;
            this.hide();
            this.childHovering = false;
        };
        parentctx.once('hide', childHideBind);
        item.addEventListener('mouseenter', childHover);
        item.addEventListener('mouseleave', childHoverOut);
        this.on('build', e => {
            e._afuncCtxParent = parentctx.ctx;
            e._afuncCtxParentClass = parentctx;
            e.addEventListener('mouseleave', childContextHoverOut)
        });
    }

    _toDom(i){
        let item = document.createElement("div");
        //"<div class="checkbox-inner"><input type="checkbox" value="on"><span></span></div><span></span>"
        item.className = `item${i.disabled ? " disabled" : ""}${i.danger ? " danger" : ""}${i.image ? " item-image" : ""}${i.subMenuItems ? " item-subMenu" : ""}`;
        if(i.image){
            let label = document.createElement("div");
            label.className = 'label';
            label.innerHTML = i.sanitize ? window.DI.Helpers.sanitize(i.text) : i.text;
            let img = document.createElement("img");
            img.src = i.image;
            item.appendChild(label);
            item.appendChild(img);
        }else if(i.hint){
            let span = document.createElement("span");
            span.innerHTML = i.sanitize ? window.DI.Helpers.sanitize(i.text) : i.text;
            let hint = document.createElement("div");
            hint.className = 'hint';
            hint.innerHTML = i.sanitize ? window.DI.Helpers.sanitize(i.hint) : i.hint;
            item.appendChild(span);
            item.appendChild(hint);
        }else{
            item.innerHTML = i.sanitize ? window.DI.Helpers.sanitize(i.text) : i.text;
        }
        if(i.subMenuItems) AFContextMenu.fromArray(i.subMenuItems)._hookToParentMenu(item, this);
        item.onclick = e => i.onClick(e, this, item);
        item.onmouseenter = i.onHover ? e => i.onHover(e, this, item) : null;
        item.onmouseleave = i.onHoverOut ? e => i.onHoverOut(e, this, item) : null;
        return item;
    }

    addItem(item){
        this.items.push(this._parseItem(item));
        return this;
    }

    addItemGroup(...items){
        this.items.push([items.map(i => this._parseItem(i))]);
        return this;
    }

    hide(){
        if(!this.ctx) return;
        this.emit('hide');
        let ctx = this.ctx;
        this.ctx = null;
        AFContextMenu.contextWrapper.removeChild(ctx);
        document.querySelector(".app").removeEventListener('click', this.hideBind);
        this.hideBind = null;
    }

    _build(){
        let ctx = AFContextMenu.contextOuter;
        let ctxi = ctx.childNodes[0];
        this.items.map(i => {
            if(i instanceof Array){
                i = i[0];
                let group = document.createElement("div");
                group.className = 'item-group';
                i.map(ii => group.appendChild(this._toDom(ii)));
                ctxi.appendChild(group);
            }else ctxi.appendChild(this._toDom(i));
        });
        this.emit('build', ctx);
        AFContextMenu.contextWrapper.appendChild(ctx);
        ctx._afuncCtxClass = this;
        this.ctx = ctx;
        this.hideBind = this.hide.bind(this);
        document.querySelector(".app").addEventListener('click', this.hideBind);
        return ctx;
    }

    appendToMouseEvent(e){
        this.hide();
        let ctx = this._build();
        let ctxi = ctx.childNodes[0];
        let position = {
            height: e.clientY,
            width: e.clientX
        };
        let invertX = window.innerWidth < ctxi.getBoundingClientRect().width+position.width;
        let invertY = window.innerHeight/2 < position.height;
        if(invertX) ctxi.classList.add('invertX');
        if(invertY) ctxi.classList.add('invertY');
        let newpos = {
            top: position.height,
            left: position.width
        };
        if(invertX) newpos.left -= ctxi.getBoundingClientRect().width;
        if(invertY) newpos.top -= ctxi.getBoundingClientRect().height; else newpos.top -= ctxi.getBoundingClientRect().height*.3;
        ctx.style = `z-index: 1001; visibility: visible; left: ${newpos.left}px; top: ${newpos.top}px; transform: translateX(-50%) translateY(0%) translateZ(0px);`;
        return ctx.childNodes[0];
    }

    appendToElement(e, invertX, invertY){
        this.hide();
        let ctx = this._build();
        let ctxi = ctx.childNodes[0];
        let position = e.getBoundingClientRect();
        if(typeof invertX !== 'boolean') invertX = window.innerWidth < ctxi.getBoundingClientRect().width+position.width+position.left;
        if(typeof invertY !== 'boolean') invertY = window.innerHeight/2 < position.height;
        if(invertX) ctxi.classList.add('invertX');
        if(invertY) ctxi.classList.add('invertY');
        let newpos = {
            top: position.top,
            left: position.left
        };
        if(invertX) newpos.left -= position.width; else newpos.left += ctxi.getBoundingClientRect().width;
        if(invertY) newpos.top -= ctxi.getBoundingClientRect().height; else newpos.top -= ctxi.getBoundingClientRect().height/2;
        ctx.style = `z-index: 1001; visibility: visible; left: ${newpos.left}px; top: ${newpos.top}px; transform: translateX(-50%) translateY(0%) translateZ(0px);`;
        return ctx.childNodes[0];
    }

    appendToContextMenu(e = document.querySelector('.context-menu:not(.afunc-dom)')){
        this.items.map(i => {
            if(i instanceof Array){
                i = i[0];
                let group = document.createElement("div");
                group.className = 'item-group';
                i.map(ii => group.appendChild(this._toDom(ii)));
                e.appendChild(group);
                return group;
            }else return e.appendChild(this._toDom(i));
        });
    }
}

class AFuncClass {
    constructor(obj, p) {
        this.pdom = window.A.parseDom(p);
        this.dom = window.A.parseDom(obj, this.pdom);
        if(this.dom && !this.dom._afuncProperties) this.dom._afuncProperties = {};
    }

    contextMenu(ctx){
        if(!this.dom) throw new Error('No DOM found in the class!');
        this.unbindContextMenu();
        if(!(ctx instanceof AFContextMenu)) ctx = AFContextMenu.fromArray(ctx);
        this.dom._afuncProperties.contextmenu_ctx = ctx;
        this.dom._afuncProperties.contextmenu_bind = ctx.appendToMouseEvent.bind(ctx);
        this.dom.addEventListener('contextmenu', this.dom._afuncProperties.contextmenu_bind);
        return this;
    }

    unbindContextMenu(){
        if(this.dom._afuncProperties.contextmenu_ctx) this.dom._afuncProperties.contextmenu_ctx.hide();
        this.dom.removeEventListener('contextmenu', this.dom._afuncProperties.contextmenu_bind);
        delete this.dom._afuncProperties.contextmenu_bind;
        delete this.dom._afuncProperties.contextmenu_ctx;
        return this;
    }

    tooltip(direction, text, options){
        if(!this.dom) throw new Error('No DOM found in the class!');
        this.unbindTooltip();
        function getClassName(dir){ return `tooltip tooltip-${dir} tooltip-${options && options.style ? options.style : "normal"} ${options && options.className ? options.className : ""}` }
        if(!['top','bottom','left','right'].includes(direction)) throw new Error("Invalid direction!");
        if(typeof options !== 'object') options = {style:'normal',sanitize:true};
        if(options && typeof options.sanitize !== 'boolean') options.sanitize = true;
        if(options && options.style && !['error','success','warning','normal'].includes(options.style)) throw new Error("Invalid style!");
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
            tt.innerHTML = options.sanitize ? window.DI.Helpers.sanitize(text) : text;
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
