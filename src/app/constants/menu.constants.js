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
      state: 'admin.create',
      icon: 'ion-paintbrush',
      name: 'Create Tournament'
    }
    var tournaments = {
      state: 'tournament.list',
      icon: 'ion-ios-list-outline',
      name: 'Tournaments'
    }

    return {
      menu: {
        authorized: {
          items: [
            news,
            play,
            tournaments,
            logout
          ]
        },
        admin: {
          items: [news, create, tournaments, logout]
        },
        normal: {
          items: [
            news, tournaments, login
          ]
        }
      }
    }
  }))

