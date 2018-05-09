const { EventEmitter } = require('eventemitter3')

module.exports = afunc => {
  return class ContextMenu extends EventEmitter {
    constructor() {
      super();
      this.items = [];
      this.child = null;
      this.parent = null;
    }

    static get contextOuter() {
      let ctx = document.createElement('div');
      ctx.className = "contextMenu-uoJTbz afunc-dom";
      ctx.classList.add(document.querySelector('.app').classList[2]);
      return ctx;
    }

    static get contextWrapper() {
      return document.querySelector('.app');
    }

    static fromArray(items) {
      if(!(items instanceof Array)) throw new Error('Items must be in a array!');
      let ctx = new ContextMenu();
      items.map(i => {
        if(i instanceof Array) ctx.addItemGroup(...i); else ctx.addItem(i);
      });
      return ctx;
    }

    _san(text){ return this.options.sanitize ? afunc.sanitize(text) : text; }

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
      item.className = `item-1XYaYf${i.disabled ? " disabled-dlOjhg" : ""}${i.danger ? " danger-1oUOCl" : ""}${i.image ? " itemImage-24yxbi" : ""}${i.subMenuItems ? " itemSubMenu-3ZgIw-" : ""}`;
      if(i.image){
        let label = document.createElement("div");
        label.className = 'label-2CGfN3';
        label.innerHTML = i.sanitize ? window.DI.Helpers.sanitize(i.text) : i.text;
        let img = document.createElement("img");
        img.src = i.image;
        item.appendChild(label);
        item.appendChild(img);
      }else if(i.hint){
        let span = document.createElement("span");
        span.innerHTML = i.sanitize ? window.DI.Helpers.sanitize(i.text) : i.text;
        let hint = document.createElement("div");
        hint.className = 'hint-3TJykr';
        hint.innerHTML = i.sanitize ? window.DI.Helpers.sanitize(i.hint) : i.hint;
        item.appendChild(span);
        item.appendChild(hint);
      }else{
        item.innerHTML = i.sanitize ? window.DI.Helpers.sanitize(i.text) : i.text;
      }
      if(i.subMenuItems) ContextMenu.fromArray(i.subMenuItems)._hookToParentMenu(item, this);
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
      ContextMenu.contextWrapper.removeChild(ctx);
      document.querySelector(".app").removeEventListener('click', this.hideBind);
      this.hideBind = null;
    }

    _build(){
      let ctx = ContextMenu.contextOuter;
      let ctxi = ctx.childNodes[0];
      this.items.map(i => {
        if(i instanceof Array){
          i = i[0];
          let group = document.createElement("div");
          group.className = 'itemGroup-oViAgA';
          i.map(ii => group.appendChild(this._toDom(ii)));
          ctxi.appendChild(group);
        }else ctxi.appendChild(this._toDom(i));
      });
      this.emit('build', ctx);
      ContextMenu.contextWrapper.appendChild(ctx);
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
      if(invertX) ctxi.classList.add('invertChildX-LNv3Ce');
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
      if(invertX) ctxi.classList.add('invertChildX-LNv3Ce');
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
          group.className = 'itemGroup-oViAgA';
          i.map(ii => group.appendChild(this._toDom(ii)));
          e.appendChild(group);
          return group;
        }else return e.appendChild(this._toDom(i));
      });
    }
  }
}