angular.module('BattleZone')

  .constant('menuConstants', (function () {
    var news = {
      state: 'latest',
      icon: 'ion-planet',
      name: 'News'
    };

    var login = {
      state: 'login',
      icon: 'ion-log-in',
      name: 'Log In'
    };
    var logout ={
      state: 'login',
      icon: 'ion-log-out',
      name: 'Log Out'
    };
    var play = {
      state: 'play',
      icon: 'ion-ios-game-controller-b',
      name: 'Play'
    };
    var create = {
      state: 'create',
      icon: 'ion-paintbrush',
      name: 'Create Tournament'
    }
    var ladderList = {
      state: 'ladder.list',
      icon: 'ion-ios-list-outline',
      name: 'Ladders'
    }

    return {
      menu: {
        authorized: {
          items: [
            news,
            play,
            ladderList,
            logout
          ]
        },
        admin: {
          items: [news, create, ladderList, logout]
        },
        normal: {
          items: [
            news, ladderList, login
          ]
        }
      }
    }
  }))

