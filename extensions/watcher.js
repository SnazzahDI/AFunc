const { EventEmitter } = require('eventemitter3')
const ContextValidator = require('./contextvalidator')

module.exports = class Watcher extends EventEmitter {
  constructor() {
    super();
  }

  _start(afunc) {
    this.afunc = afunc;
    this.DI = afunc.DI;
    this.inSettings = document.querySelectorAll(".layers").length === 2;
    this.mBind = mrs => mrs.forEach(mr => this._checkRecord(mr));
    const r = (this.react = afunc.DI.plugins.get('react'));
    r.on('mutation', this.mBind);
  }

  _stop() {
    r.removeListener('mutation', this.mBind);
  }

  _checkForOptions() {
    if((document.querySelectorAll(".layers").length === 2) !== this.inSettings){
      if(this.inSettings){
        this.emit('settingsExit');
        this.settingsType = null;
      }else{
        this.settingsType = document.querySelector('.avatar-xxlarge') ? 'user' : 'guild';
        this.emit('settingsEnter', this.settingsType);
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
    if(rec.addedNodes) rec.addedNodes.forEach(n => {
      let cv = new ContextValidator({n});
      if(n.classList && n.classList.contains('popout')){
        if(n.childNodes[0].classList.contains('userPopout-4pfA0d')) this.emit('userPopout', {
          user: this.react.getReactInstance(n.childNodes[0]).memoizedProps.children[1] ? (this.react.getReactInstance(n.childNodes[0]).memoizedProps.children[1].props.children[1] ? this.react.getReactInstance(n.childNodes[0]).memoizedProps.children[1].props.children[1][1].props.user : null) : null,
          guild: this.react.getReactInstance(n.childNodes[0]).memoizedProps.children[1] ? (this.react.getReactInstance(n.childNodes[0]).memoizedProps.children[1].props.children[1] ? this.react.getReactInstance(n.childNodes[0]).memoizedProps.children[1].props.children[1][1].props.guild : null) : null,
          userId: this.react.getReactInstance(n.childNodes[0]).memoizedProps.children[1] ? this.react.getReactInstance(n.childNodes[0]).memoizedProps.children[1].props.children[2][1].props.userId : null
        });
        if(n.childNodes[0].classList.contains('rtc-connection-popout')) this.emit('rtcConnection');
        if(n.childNodes[0].classList.contains('guildSettingsAuditLogsUserFilterPopout-PQPPs5')) this.emit('auditLogsPopout');
        if(n.childNodes[0].classList.contains('contextMenu-uoJTbz') && !n.childNodes[0].classList.contains('afunc-dom')) this.emit('modalContextMenu');
      }else if(n.classList && n.classList.contains('modal-2LIEKY')){
        if(cv.check("this.react.getReactInstance(n.childNodes[0].childNodes[0]).memoizedProps.children.props.mutualGuilds")) this.emit('userModal', this.react.getReactInstance(n.childNodes[0].childNodes[0]).memoizedProps.children.props.user, this.react.getReactInstance(n.childNodes[0].childNodes[0]).memoizedProps.children.props);
        if(cv.check("this.react.getReactInstance(n.childNodes[0].childNodes[0]).memoizedProps.children.props.children[1].props.children.props.jumpTargetIndex")) this.emit('deleteMessageModal', this.react.getReactInstance(n.childNodes[0].childNodes[0]).memoizedProps.children.props.user, this.react.getReactInstance(n.childNodes[0].childNodes[0]).memoizedProps.children.props);
        if(n.childNodes[0].childNodes[0].classList.contains('imageWrapper-38T7d9')) this.emit('imageModal', n.childNodes[0].childNodes[0].childNodes[0].src);
        if(n.childNodes[0].childNodes[0].classList.contains('uploadModal-2KN6Mm')) this.emit('uploadModal');
        if(n.childNodes[0].childNodes[0].classList.contains('regionSelectModal-QBpi1R')) this.emit('regionSelectModal');
        if(n.childNodes[0].childNodes[0].classList.contains('create-guild-container')) this.emit('guildModal');
        if(n.childNodes[0].childNodes[0].classList.contains('quickswitcher-2NdiGJ')) this.emit('quickSwitcher');
        if(n.childNodes[0].childNodes[0].classList.contains('premiumPaymentModal-w4sE7z')) this.emit('nitroModal');
        if(n.childNodes[0].childNodes[0].childNodes[0].classList.contains('instantInviteModal-5L33Qh')) this.emit('inviteModal', n.childNodes[0].childNodes[0].childNodes[0][0].value);
      }else if(n.classList && n.classList.contains('autocomplete-1TnWNR') && n.classList.contains('autocomplete-1LLKUa')){
        this.emit('autoCompletePopout');
      }else if(n.classList && n.classList.contains('message-group')){
        let inst = this.react.getReactInstance(n);
        let res = {
          instance: inst,
          element: n
        };
        if(inst.memoizedProps.children[1]) Object.assign(res, {
          channel: inst.memoizedProps.children[1].props.children[0][0].props.channel,
          message: inst.memoizedProps.children[1].props.children[0][0].props.message
        }); else if(inst.memoizedProps.children[0] && inst.memoizedProps.children[0].props) Object.assign(res, {
          channel: inst.memoizedProps.children[0].props.children[0].props.channel,
          message: inst.memoizedProps.children[0].props.children[0].props.message
        });
        this.emit('messageGroup', res);
      }else if(n.classList && n.classList.contains('message')){
        let inst = this.react.getReactInstance(n);
        let res = {
          instance: inst,
          element: n
        };
        this.emit('message', res);
      }else if(n.classList && n.classList.contains('tooltip')){
        let inst = this.react.getReactInstance(n);
        let res = {
          instance: inst,
          element: n
        };
        this.emit('tooltip', res);
      }else if(n.classList && n.classList.contains('context-menu')){
        let inst = this.react.getReactInstance(n);
        if(!inst) return;
        cv.switchCtx({inst, e(p){ if(!p) throw new Error(); }});
        let sendResult = (eventType, obj = {}) => {
          let res = {
            instance: inst,
            element: n,
            invertX: n.classList.contains('invertX'),
            invertY: n.classList.contains('invertY'),
            type: eventType
          };
          Object.assign(res, obj);
          this.emit('contextMenu', res);
        }
        if(cv.check("e(inst.memoizedProps.children[1].props.channel)")){
          sendResult('channel', {
            guild: inst.memoizedProps.children[1].props.guild,
            channel: inst.memoizedProps.children[1].props.channel
          });
        }else if(cv.check("e(inst.memoizedProps.children[2].props.guild)")){
          sendResult('guild', {
            guild: inst.memoizedProps.children[2].props.guild
          });
        }else if(cv.check("e(inst.memoizedProps.children[3].props.user)")){
          sendResult('member', {
            user: inst.memoizedProps.children[3].props.user,
            channelId: inst.memoizedProps.children[3].props.channelId,
            guildId: inst.memoizedProps.children[3].props.guildId
          });
        }else if(cv.check("e(inst.memoizedProps.children[2].props.user)")){
          sendResult('member', {
            user: inst.memoizedProps.children[2].props.user,
            channelId: inst.memoizedProps.children[2].props.channelId,
            guildId: inst.memoizedProps.children[2].props.guildId
          });
        }else if(cv.check("e(inst.memoizedProps.children[2].props.children[0].props.message)")){
          sendResult('message', {
            channel: inst.memoizedProps.children[2].props.children[0].props.channel,
            message: inst.memoizedProps.children[2].props.children[0].props.message
          });
        }else if(cv.check("e(inst.memoizedProps.children[3].props.children[2].props.user)")){
          sendResult('groupMember', {
            user: inst.memoizedProps.children[3].props.children[2].props.user,
            channelId: inst.memoizedProps.children[2].props.children.channelId
          });
        }else if(cv.check("e(inst.memoizedProps.children[0].props.children[2].props.user)")){
          sendResult('dm', {
            user: inst.memoizedProps.children[0].props.children[2].props.user,
            channelId: inst.memoizedProps.children[0].props.children[2].props.channelId
          });
        }else if(cv.check("e(inst.memoizedProps.children[0].props.children[1].props.channel)")){
          sendResult('group', {
            channel: inst.memoizedProps.children[0].props.children[1].props.channel
          });
        }else if(cv.check("e(inst.memoizedProps.children[1].props.children[0].props.user)")){
          sendResult('user', {
            user: inst.memoizedProps.children[1].props.children[0].props.user
          });
        }else if(cv.check("e(inst.memoizedProps.children.props.children[0].props.image)")){
          sendResult('react');
        }else if(cv.check("e(inst.memoizedProps.children[0].props.styles)")){
          sendResult('roles');
        }else if(cv.check("e(parseInt(inst.memoizedProps.children.props.children[0].key))")){
          sendResult('inviteServer', {
            servers: inst.memoizedProps.children.props.children.map(s => ({ id: s.key, name: s.props.label }))
          });
        }else if(cv.check("e(inst.memoizedProps.children.props.children[0].props.label)")){
          sendResult('serverSettings', {
            availableActions: inst.memoizedProps.children.props.children.map(a => a.key)
          });
        }else if(cv.check("e(inst.memoizedProps.children[0].props.label)")){
          sendResult('serverSettings', {
            availableActions: inst.memoizedProps.children.map(a => a.key)
          });
        }else if(cv.check("e(inst.memoizedProps.children.props.src)")){
          sendResult('image', {
            url: inst.memoizedProps.children.props.href,
            proxyUrl: inst.memoizedProps.children.props.src
          });
        }else if(cv.check("e(inst.memoizedProps.children[2].props.children.props.channel)")){ // system messages
          sendResult('systemMessage', {
            channel: inst.memoizedProps.children[2].props.children.props.channel,
            message: inst.memoizedProps.children[2].props.children.props.message
          });
        }else sendResult('unknown');
      }
    });
  }

  log(...args) {
    console.log(`%c[AFunc%c.Watcher%c]`, `color: #dac372; font-weight: bold;`, ``, `color: #dac372; font-weight: bold;`, ...args);
  }
}