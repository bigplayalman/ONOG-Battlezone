angular.module('BattleZone')

  .constant('tournamentConstants', (function () {

    return {
      tournament: {
        games: [
          {
            id: 'hearthstone',
            name: 'Hearthstone'
          }
        ],
        types: [
          {
            id: 'single',
            name: 'Single Elimination'
          },
          {
            id: 'double',
            name: 'Double Elimination'
          },
          {
            id: 'ladder',
            name: 'Ladder'
          }
        ],
        status: [
          {
            id: 'active',
            name: 'Active',
          },
          {
            id: 'pending',
            name: 'Pending',
          },
          {
            id: 'completed',
            name: 'Completed'
          }
        ]
      }
    }
  }))

