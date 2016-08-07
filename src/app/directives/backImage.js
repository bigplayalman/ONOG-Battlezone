angular.module('BattleZone')
  .directive('backImg', function backImg() {
    return function(scope, element, attrs){
      attrs.$observe('backImg', function(value) {
        element.css({
          'background-image': 'url(' + value +')',

        });
      });
    };
  });
