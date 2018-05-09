module.exports = afunc => {
  const ContextMenu = require('./contextmenu')(afunc)

  return class AFuncClass {
    constructor(obj, p) {
      this.pdom = afunc.parseDom(p);
      this.dom = afunc.parseDom(obj, this.pdom);
      if(this.dom && !this.dom._afuncProperties) this.dom._afuncProperties = {};
    }

    contextMenu(ctx){
      if(!this.dom) throw new Error('No DOM found in the class!');
      this.unbindContextMenu();
      if(!(ctx instanceof ContextMenu(afunc))) ctx = ContextMenu(afunc).fromArray(ctx);
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
      function getClassName(dir){ return `tooltip tooltip-${dir} tooltip-${options && options.style ? options.style : "black"} ${options && options.className ? options.className : ""}` }
      if(!['top','bottom','left','right'].includes(direction)) throw new Error("Invalid direction!");
      if(typeof options !== 'object') options = {style:'black',sanitize:true};
      if(options && typeof options.sanitize !== 'boolean') options.sanitize = true;
      if(options && options.style && !['error','success','warning','black'].includes(options.style)) throw new Error("Invalid style!");
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
}