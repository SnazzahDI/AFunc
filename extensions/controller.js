const { EventEmitter } = require('eventemitter3')
const ContextValidator = require('./contextvalidator')

module.exports = afunc => {
  return class DiscordController extends EventEmitter {
    constructor() {
      super();
      this.mods = {};
      this.hooks = afunc.manager.get('hooks')
    }

    _start(){
      let cv = new ContextValidator();
      this.hooks.webPackLoad((m, e, r) => {
        for (const key in r.c) {
          const mod = r.c[key];
          afunc.clientMods.push(mod);

          if(!mod.exports) return;
          const ex = mod.exports;

          cv.switchCtx({ex, e(p){ if(!p) throw new Error(); }});

          if (cv.check('e(ex.A11Y_NITRO_BADGE)')) afunc.Constants.Translations.push(ex);
          if (cv.check('e(ex.version)')) afunc.clientPackages.push(ex);
          if (mod.i === 379) this.loadMod('zoom', ex, mod.i);
          if (cv.check('e(ex.zoomTo)')) this.loadMod('zoom2', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.GUILD_NSFW_AGREE)')) this.loadMod('guildNSFW', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.FRIENDS_SET_SECTION)')) this.loadMod('friends', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.GUILD_SELECT)')) this.loadMod('account', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.CALL_CREATE)')) this.loadMod('call', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.KEYBINDS_ENABLE_ALL_KEYBINDS)')) this.loadMod('keybind', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.LOCAL_ACTIVITY_UPDATE)')) this.loadMod('localActivity', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.RTC_DEBUG_MODAL_SET_SECTION)')) this.loadMod('rtcModal', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.NOTICE_SHOW)')) this.loadMod('notice', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.QUICKSWITCHER_SEARCH)')) this.loadMod('quickswitcher', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.TUTORIAL_INDICATOR_SUPPRESS_ALL)')) this.loadMod('tutorial', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.USER_SETTINGS_MODAL_SUBMIT)')) this.loadMod('userSettings', ex, mod.i);
          if (cv.check('e(ex._actionHandlers.RPC_APP_CONNECTED)')) this.loadMod('rpc', ex, mod.i);
          if (cv.check('e(ex.isSafeRedirect)')) this.loadMod('redirector', ex, mod.i);
          if (cv.check('e(ex.canReportInChannel)')) this.loadMod('reportChecker', ex, mod.i);
          if (cv.check('e(ex.showChangelog)')) this.loadMod('changelog', ex, mod.i);
          if (cv.check('e(ex.getActionType)')) this.loadMod('auditlogs', ex, mod.i);
          if (cv.check('e(ex.supportsFeature)')) this.loadMod('main', ex, mod.i);
          if (cv.check('e(ex.clearHistory && ex.search)')) this.loadMod('search', ex, mod.i);
          if (cv.check('e(ex.accountDetailsClose)')) this.loadMod('accountDetails', ex, mod.i);
          if (cv.check('e(ex.generateContentFilterOptions)')) this.loadMod('securityOptions', ex, mod.i);
          if (cv.check('e(ex.fetchDefaultRegions)')) this.loadMod('regions', ex, mod.i);
          if (cv.check('e(ex.fetchEmoji)')) this.loadMod('emoji', ex, mod.i);
          if (cv.check('e(ex.clearBackupCodes)')) this.loadMod('backupCodes', ex, mod.i);
          if (cv.check('e(ex.categoryCollapseAll)')) this.loadMod('category', ex, mod.i);
          if (cv.check('e(ex.AECMobile)')) this.loadMod('voice', ex, mod.i);
          if (cv.check('e(ex.CAN_SET_DEVICES)')) this.loadMod('devices', ex, mod.i);
          if (cv.check('e(ex.launchGame)')) this.loadMod('games', ex, mod.i);
          if (cv.check('e(ex.flattenAst)')) this.loadMod('ast', ex, mod.i);
          if (cv.check('e(ex.ensureStripeIsLoaded)')) this.loadMod('stripeLoaded', ex, mod.i);
          if (cv.check('e(ex.languages)')) this.loadMod('language', ex, mod.i);

          if (cv.check('e(ex.activateRagingDemon)')) this.loadMod('keybindsMenu', ex, mod.i);
          if (cv.check('e(ex.transitionToInviteChannel)')) this.loadMod('channelTransition', ex, mod.i);

          if (cv.check('e(ex.ext && ex.parse && ex.base)')) {
            this.loadMod('twemoji', ex, mod.i);
            afunc.clientPackages.twemoji = ex;
          }
          if (cv.check('e(ex._globalServer === "https://sentry.io")')) {
            this.loadMod('sentryio', ex, mod.i);
            afunc.clientPackages.sentryio = ex;
          }
          if (cv.check('e(ex.isJoi)')) {
            this.loadMod('joi', ex, mod.i);
            afunc.clientPackages.joi = ex;
          }

          if (cv.check('e(ex.hightlightAuto)')) {
            this.loadMod('highlightjs', ex);
            afunc.clientPackages.highlightjs = ex;
          }

          if (cv.check('e(ex.goToAndStop)')) {
            this.loadMod('easeljs', ex);
            afunc.clientPackages.easeljs = ex;
          }

          if (mod.exports.hasOwnProperty('AECMobile')) {
            this.loadMod('voice', mod.exports, mod.i);
          }

          if (ex.hasOwnProperty('containerDefault')
            && ex.hasOwnProperty('arrowHolder')
            && ex.hasOwnProperty('link400')
            && ex.hasOwnProperty('marginBottom20')
            && ex.hasOwnProperty('scrollbarGhost')
            && ex.hasOwnProperty('scrollerWrap')
            && ex.hasOwnProperty('accountDetails')
            && ex.hasOwnProperty('buttonDisconnect')
            && exs.hasOwnProperty('flipped')
            && ex.hasOwnProperty('guildPanel')
            && ex.hasOwnProperty('keybindFlipped')
            && ex.hasOwnProperty('height24')) {
            Object.assign(afunc.Constants.Classes, ex);
          }

          if (ex.hasOwnProperty('KEY_UP')) Object.assign(afunc.Constants.KeyCodes, ex);
          if (ex.hasOwnProperty('food')) afunc.Constants.Emoji = ex;

          if (mod.exports.hasOwnProperty('-5')) Object.assign(afunc.Constants.ErrorCodes, ex);

          /*if (mod.exports && mod.exports[0] && mod.exports[0].executables) {
            afunc.Constants.Games = mod.exports;
          }

          if (mod.exports && mod.exports[0] && mod.exports[0].englishName) {
            afunc.Constants.TranslationCodes = mod.exports;
          }*/

          if (mod.exports && mod.exports[0] && mod.exports[0].length === 3) {
            afunc.Constants.LoadingQuotes = mod.exports.map(q => {return {
              quote: q[0],
              username: q[1],
              platform: q[2]
            }});
          }
        }
      })
    }

    // MAIN

    loadMod(name, obj){
      this.mods[name] = obj;
      //window.A.plugin.log(`Loaded client mod ${name.toUpperCase()}`, obj)
    }

    checkFor(mod){
      if(!this.mods[mod]){
        throw new Error(`${mod.toUpperCase()} mod functions aren't available as they have not been found!`)
      }else return true;
    }

    isModLoaded(mod){
      return this.mods[mod] !== undefined;
    }

    // CONSTANTS

    get joi(){ if(this.checkFor('joi')) return this.mods.joi }
    get twemoji(){ if(this.checkFor('twemoji')) return this.mods.twemoji }

    // MOD: ZOOM

    fontScaleTo(v){ if(this.checkFor('zoom2')) return this.mods.zoom2.fontScaleTo(v) }
    zoomTo(v){ if(this.checkFor('zoom2')) return this.mods.zoom2.zoomTo(v) }
    resetZoom(){ if(this.checkFor('zoom2')) return this.mods.zoom2.resetToDefault() }
    get zoom(){ if(this.checkFor('zoom')) return this.mods.zoom.zoom }
    get fontScale(){ if(this.checkFor('zoom')) return this.mods.zoom.fontScale }
    get isFontScaledUp(){ if(this.checkFor('zoom')) return this.mods.zoom.isFontScaledUp }

    // MOD: DEVICES

    getDevices(){ if(this.checkFor('devices')) return this.mods.devices.getDevices() }
    getVideoInputDevices(){ if(this.checkFor('devices')) return this.mods.devices.getVideoInputDevices() }
    getAudioInputDevices(){ if(this.checkFor('devices')) return this.mods.devices.getAudioInputDevices() }
    getAudioOutputDevices(){ if(this.checkFor('devices')) return this.mods.devices.getAudioOutputDevices() }

    // MOD: LANGUAGES

    get languages(){ if(this.checkFor('language')) return this.mods.language.languages }
    get locale(){ if(this.checkFor('language')) return this.mods.language.Messages }
    get chosenLocale(){ if(this.checkFor('language')) return this.mods.language.chosenLocale }
    get translationSiteURL(){ if(this.checkFor('language')) return this.mods.language.translationSiteURL }
    get chosenLocaleInfo(){ if(this.checkFor('language')) return this.mods.language.getLocaleInfo() }
    setLocale(v){ if(this.checkFor('language')) return this.mods.language.setLocale(v) }

    // MOD: QUICKSWITCHER

    showQuickswitcher(){ if(this.checkFor('quickswitcher')) return this.mods.quickswitcher._actionHandlers.QUICKSWITCHER_SHOW() }
    hideQuickswitcher(){ if(this.checkFor('quickswitcher')) return this.mods.quickswitcher._actionHandlers.QUICKSWITCHER_HIDE() }
    searchQuickswitcher(query){ if(this.checkFor('quickswitcher')) return this.mods.quickswitcher._actionHandlers.QUICKSWITCHER_SEARCH({query}) }

    // MOD: KEYBINDSMENU

    activateRagingDemon(){
      if(this.checkFor('keybindsMenu')) {
        this.showKeybinds();
        return this.mods.keybindsMenu.activateRagingDemon();
      }
    }
    deactivateRagingDemon(){ if(this.checkFor('keybindsMenu')) return this.mods.keybindsMenu.deactivateRagingDemon() }
    showKeybinds(){ if(this.checkFor('keybindsMenu')) return this.mods.keybindsMenu.show() }
    hideKeybinds(){ if(this.checkFor('keybindsMenu')) return this.mods.keybindsMenu.hide() }
  }
}