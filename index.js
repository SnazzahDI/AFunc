const { Plugin } = require('elements')
const { EventEmitter } = require('eventemitter3')

const { Watcher, ContextValidator, ChannelNotices, AFuncClass, Dialog, ContextMenu, DiscordController } = require('./extensions')

module.exports = class AFunc extends Plugin {
  preload() {
    Object.assign(this, {
      Watcher: new Watcher(),
      DiscordController: new (DiscordController(this))(),
      class: AFuncClass(this),
      ChannelNotices: ChannelNotices(this),
      Dialog: Dialog(this),
      ContextMenu: ContextMenu(this),
      ContextValidator,

      clientMods: [],
      clientTranslations: [],
      clientPackages: [],
      Constants: {
        Classes: {},
        KeyCodes: {},
        ErrorCodes: {},
        Translations: []
      },
      games: {
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
    })
  }

  load() {
    this.Watcher._start(this);
    this.DiscordController._start();
  }

  unload() {
    this.Watcher._stop();
  }

  parseHTML(html) {
    return document.createRange().createContextualFragment(html);
  }

  listParents(e) {
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

  escape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  sanitize(message) {
    return message.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
  }

  get iconURL() {
    return 'https://i-need.discord.cards/6ba49d.png';
  }

  get color() {
    return 'dac372';
  }
}
