module.exports = afunc => {
  return class ChannelNotices {
    constructor(options) {
      options = Object.assign({
        image: "https://discordinjections.xyz/img/logo-alt-nobg.svg",
        message: null,
        buttons: null
      }, options);
      if(typeof options !== 'object') throw new Error('Options is required as an object!');
      if(![typeof options.message === 'string', options.message instanceof HTMLElement, options.message instanceof Array].includes(true)) throw new Error('Content is required as either a string, element or an array of elements!');
      if(typeof options.sanitize !== 'boolean') options.sanitize = true;
      options.buttons = this._parseButtons(options.buttons);
      this.options = options;
    }

    _parseButtons(nbtns){
      let btns = nbtns;
      if(!(nbtns instanceof Array)) btns = [nbtns];
      return btns.map(btn => {
        if(typeof btn !== 'object' || !btn) return undefined;
        if(typeof btn.text !== 'string') throw new Error('Button text is required as a string!');
        if(typeof btn.onClick === 'string' && btn.onClick != 'close') throw new Error('Invalid button callback string!'); else btn.onClick = this.hide.bind(this);
        return btn;
      }).filter(b => typeof b !== 'undefined');
    }

    static get insertBeforeElement() {
      return document.querySelector(".channels-3g2vYe>.container-RYiLUQ>.flexChild-1KGW5q,.private-channels>.scrollerWrap-2uBjct");
    }

    static get parentWrapper() {
      return document.querySelector(".channels-3g2vYe>.container-RYiLUQ,.private-channels");
    }

    static get container() {
      let modal = document.createElement('div');
      modal.className = "afunc-dom channel-notices";
      let inner = document.createElement('div');
      inner.className = "channel-notice quickswitcher-notice";
      modal.appendChild(inner);
      return inner;
    }

    _san(text){ return this.options.sanitize ? afunc.sanitize(text) : text; }

    show(){
      let container = ChannelNotices.container;
      if(this.options.image) container.style.backgroundImage = `url(${this.options.image})`;
      let closeBtn = document.createElement('div');
      closeBtn.className = "close";
      container.appendChild(closeBtn);
      closeBtn.onclick = this.hide.bind(this);

      let messageCont = document.createElement('div');
      messageCont.className = "message";
      container.appendChild(messageCont);

      if(typeof this.options.message === 'string'){
        let message = document.createElement('div');
        message.innerHTML = this._san(this.options.message);
        messageCont.appendChild(message);
      }else if(this.options.message instanceof HTMLElement){
        messageCont.appendChild(this.options.message);
      }else{
        this.options.message.map(e => messageCont.appendChild(e));
      }

      this.modal = container.parentNode;
      ChannelNotices.parentWrapper.insertBefore(container.parentNode, ChannelNotices.insertBeforeElement);
      return container.parentNode;
    }

    hide(){
      if(!this.modal) return;
      let modal = this.modal;
      this.modal = null;
      ChannelNotices.parentWrapper.removeChild(modal);
    }
  }
}