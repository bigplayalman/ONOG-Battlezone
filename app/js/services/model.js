(function () {
	'use strict';

	angular
		.module('ONOG')
		.factory('Model', Model);

	Model.$inject = ['Users'];
	function Model(Users) {

		return {
			Users: Users
		};
	}
})();
