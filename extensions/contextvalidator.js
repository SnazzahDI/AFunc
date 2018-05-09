module.exports = class ContextValidator {
  constructor(ctx = {}) { this.ctx = ctx; }

  check(string){
    try{
      eval(this._ctxApplyString+string);
      return true;
    }catch(e){
      return false;
    }
  }

  switchCtx(m) { this.ctx = m; }

  get _ctxApplyString(){ return Object.keys(this.ctx).map(k => `let ${k} = this.ctx.${k};`).join(''); }
}