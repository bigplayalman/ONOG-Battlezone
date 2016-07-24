angular.module('BattleZone')

  .constant('menuConstants', (function () {
    var news = {
      state: 'latest',
      icon: 'ion-planet',
      name: 'News'
    }

    var login = {
      state: 'login',
      icon: 'ion-log-in',
      name: 'Log In'
    }
    var logout ={
      state: 'login',
      icon: 'ion-log-out',
      name: 'Log Out'
    }
    var play = {
      state: 'play',
      icon: 'ion-ios-game-controller-b',
      name: 'Play'
    }

    return {
      menu: {
        authorized: {
          items: [
            news,
            play,
            logout
          ]
        },
        admin: {
          items: [news, logout]
        },
        normal: {
          items: [
            news, login
          ]
        }
      }
    }
  }))

