module.exports = afunc => {
  return class Dialog {
    constructor(options) {
      if(!['default','link'].includes(options.type)) options.type = 'default';
      if(typeof options !== 'object') throw new Error('Options is required as an object!');
      if(![typeof options.content === 'string', options.content instanceof HTMLElement, options.content instanceof Array].includes(true)) throw new Error('Content is required as either a string, element or an array of elements!');
      if(options.content instanceof Array && options.content.map(e => e instanceof HTMLElement).includes(false)) throw new Error('Content is required as either a string, element or an array of elements!');
      if(typeof options.sanitize !== 'boolean') options.sanitize = true;
      if(!Object.keys(Dialog.buttonSizes).includes(options.buttonSize)) options.buttonSize = options.type === 'default' ? 'medium' : 'extra';
      if(!Object.keys(Dialog.dialogSizes).includes(options.size)) options.size = 'default';

      if(typeof options.minorAction !== 'object') options.minorAction = undefined;
      if(options.minorAction && typeof options.minorAction.text !== 'string') throw new Error('Minor action text is required as a string!');
      if(options.minorAction && typeof options.minorAction.onClick !== 'function') throw new Error('Minor action onClick is required as a function!');

      options.buttons = this._parseButtons(options.buttons);
      this.options = options;
    }

    static get calloutBackdrop() {
      let calloutBackdrop = document.createElement('div');
      calloutBackdrop.className = "afunc-dom backdrop-2ohBEd";
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
      return document.createRange().createContextualFragment(`<svg viewBox="0 0 12 12" name="Close" width="18" height="18" class="close-3ejNTg flexChild-1KGW5q" style="flex: 0 1 auto;"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>`).childNodes[0];
    }

    static get modalWrapper() {
      return document.querySelector('.popouts+div');
    }

    static get buttonSizes() {
      return {
        small: 'sizeSmall-3g6RX8',
        medium: 'sizeMedium-2VGNaF',
        large: 'sizeLarge-1eM8_v',
        extra: 'sizeXlarge-3x5LO9'
      }
    }

    static get dialogSizes() {
      return {
        default: 'size-2pbXxj',
        small: 'sizeSmall-1sh0-r',
        medium: 'sizeMedium-1-2BNS',
        large: 'sizeLarge-1AHXtx',
        none: ''
      }
    }

    _san(text){ return this.options.sanitize ? afunc.sanitize(text) : text; }

    _parseButtons(nbtns){
      let btns = nbtns;
      if(!(nbtns instanceof Array)) btns = [nbtns];
      return btns.map(btn => {
        if(typeof btn !== 'object' || !btn) return undefined;
        if(typeof btn.text !== 'string') throw new Error('Button text is required as a string!');
        if(!['default','outline','ghost','link','red','green'].includes(btn.style)) btn.style = 'default';
        if(!['string','function'].includes(typeof btn.onClick)) btn.onClick = 'close';
        if(typeof btn.onClick === 'string' && btn.onClick != 'close') throw new Error('Invalid button callback string!'); else btn.onClick = this.hide.bind(this);
        return btn;
      }).filter(b => typeof b !== 'undefined');
    }

    _parsePotentialElement(elm, textclass) {
      if(typeof elm === 'string')
        return afunc.parseHTML(`<div${textclass ? ` class="${textclass}"` : ''}>${this._san(elm)}</div>`);
      else if(elm instanceof HTMLElement) return elm;
      else if(elm instanceof Array){
        const div = document.createElement('div');
        return elm.map(e => div.appendChild(this._parsePotentialElement(e)));
      }
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
        Dialog.modalWrapper.removeChild(modal);
        Dialog.modalWrapper.removeChild(cbd);
      }, 500);
    }

    show(){
      if(this.modal) return this.modal.childNodes[0].childNodes[0];
      let calloutBackdrop = Dialog.calloutBackdrop;
      calloutBackdrop.onclick = this.hide.bind(this);
      let outer = Dialog.modalOuter;
      let modal = document.createElement('div');
      outer.childNodes[0].appendChild(modal);
      modal.className = `modal-3HOjGZ modal-KwRiOq container-2WJW5U ${Dialog.dialogSizes[this.options.size]}`;

      let titleBlock = document.createElement('div');
      if(this.options.title){
        titleBlock.className = 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE';
        titleBlock.style = "flex: 0 0 auto;";
        let title = document.createElement('h4');
        title.className = 'h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl';
        title.innerHTML = this._parsePotentialElement(this.options.title);
        titleBlock.appendChild(title);
        modal.appendChild(titleBlock);
      }

      let contentWrap = document.createElement('div');
      contentWrap.className = 'scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW';
      let contentScroller = document.createElement('div');
      contentScroller.className = this.options.type === 'default' ? 'scroller-fzNley inner-tqJwAU content-3KEfmo selectable' : 'scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW';
      let content = document.createElement('div');
      content.className = this.options.type === 'default' ? 'medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn selectable-prgIYK' : 'scroller-fzNley inner-tqJwAU content-1hiykS';
      content.style = 'padding-bottom: 20px';
      content.appendChild(this._parsePotentialElement(this.options.content, this.options.type === 'link' ? 'body-2BYQ2b medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn' : ''));
      contentWrap.appendChild(contentScroller);
      contentScroller.appendChild(content);

      modal.appendChild(contentWrap);

      if(this.options.closeButton){
        let closeButton = Dialog.closeButton;
        closeButton.onclick = this.hide.bind(this);
        titleBlock.appendChild(closeButton);
      }

      let buttonBlock = document.createElement('div');
      buttonBlock.className = this.options.type === 'default' ? "flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw"
        + "flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw" : "flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyBetween-1d1Hto alignStretch-1hwxMa wrap-1da0e3 footer-1PYmcw";
      buttonBlock.style = "flex: 0 0 auto;";


      if(this.options.buttons.length > 0){
        this.options.buttons.map(btn => {
          let button = document.createElement('button');
          button.style = "flex: 0 0 auto;";
          button.onclick = btn.onClick;
          let buttonInner = document.createElement('div');
          buttonInner.innerHTML = afunc.sanitize(btn.text);
          if(btn.style === 'default'){
            button.className = "buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu buttonSpacing-3R7DSg"
              + ` button-2t3of8 buttonSpacing-3R7DSg lookFilled-luDKDo colorBrand-3PmwCE grow-25YQ8u ${Dialog.buttonSizes[this.options.buttonSize]}`;
            buttonInner.className = "contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx";
          }else if(btn.style === 'outline'){
            button.className = "buttonRedOutlinedDefault-1VCgwL buttonOutlinedDefault-3FNQnZ buttonDefault-2OLW-v button-2t3of8 buttonOutlined-38aLSW buttonRedOutlined-2t9fm_ smallGrow-2_7ZaC buttonSpacing-3R7DSg"
              + ` button-2t3of8 buttonSpacing-3R7DSg lookOutlined-1c5nhl colorRed-3HTNPV grow-25YQ8u ${Dialog.buttonSizes[this.options.buttonSize]}`;
            buttonInner.className = "contentsDefault-nt2Ym5 contents-4L4hQM contentsOutlined-mJF6nQ";
          }else if(btn.style === 'ghost'){
            button.className = "buttonBrandGhostDefault-2JCnWW buttonGhostDefault-2NFSwJ buttonDefault-2OLW-v button-2t3of8 buttonGhost-2Y7zWJ buttonBrandGhost-1-Lmhc mediumGrow-uovsMu buttonSpacing-3R7DSg"
              + ` button-2t3of8 buttonSpacing-3R7DSg lookFilled-luDKDo colorPrimary-2KuK5O grow-25YQ8u ${Dialog.buttonSizes[this.options.buttonSize]}`;
            buttonInner.className = "contentsDefault-nt2Ym5 contents-4L4hQM contentsGhost-2Yp1r8";
          }else if(btn.style === 'link'){
            button.className = "buttonPrimaryLinkDefault-1PQflF buttonLinkDefault-3J8pja buttonDefault-2OLW-v button-2t3of8 mediumGrow-uovsMu buttonSpacing-3R7DSg"
              + ` button-2t3of8 buttonSpacing-3R7DSg lookLink-3VWONr colorPrimary-2KuK5O grow-25YQ8u ${Dialog.buttonSizes[this.options.buttonSize]}`;
            buttonInner.className = "contentsDefault-nt2Ym5 contents-4L4hQM contentsLink-2ScJ_P";
          }else if(btn.style === 'red'){
            button.className = "buttonRedFilledDefault-1TrZ9q buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonRedFilled-1NjJNj mediumGrow-uovsMu buttonSpacing-3R7DSg"
              + ` button-2t3of8 buttonSpacing-3R7DSg lookFilled-luDKDo colorRed-3HTNPV grow-25YQ8u ${Dialog.buttonSizes[this.options.buttonSize]}`;
            buttonInner.className = "contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx";
          }else if(btn.style === 'green'){
            button.className = "buttonGreenFilledDefault-_lLQaz buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonGreenFilled-6QHNrw mediumGrow-uovsMu"
              + ` button-2t3of8 buttonSpacing-3R7DSg lookFilled-luDKDo colorGreen-22At8E grow-25YQ8u ${Dialog.buttonSizes[this.options.buttonSize]}`;
            buttonInner.className = "contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx";
          }
          button.appendChild(buttonInner);
          buttonBlock.appendChild(button);
        });
      }

      if(this.options.minorAction){
        let minorAct = document.createElement('div');
        minorAct.className = 'minorAction-2WStW0 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn';
        minorAct.appendChild(document.createTextNode(afunc.sanitize(this.options.minorAction.text)));
        minorAct.onclick = this.options.minorAction.onClick;
        buttonBlock.appendChild(minorAct);
      }

      if(this.options.buttons.length > 0 || this.options.minorAction) modal.appendChild(buttonBlock);
      this.modal = outer;
      this.cbd = calloutBackdrop;
      Dialog.modalWrapper.appendChild(calloutBackdrop);
      Dialog.modalWrapper.appendChild(outer);
      return modal;
    }
  }
}