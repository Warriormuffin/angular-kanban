(function () {
	
	var app = angular.module('ngKanban');

	app.component('storyList', {
		templateUrl: 'templates/storyList.html',
		controller: storyListController,
		controllerAs: 'sl',
		bindings: {
			list: '<'
		},
		require: {
			board: '^storyBoard'
		}
	});

	app.controller('cardModalController', cardModalController);
	
	storyListController.$inject = ['$scope', '$uibModal', 'storageService', 'guidService', '$timeout'];
	cardModalController.$inject = ['$uibModalInstance', 'card'];

	function storyListController($scope, $uibModal, storageService, guidService, $timeout) {

		var sl = this;
		sl.cards = [];

		console.log('List: ', sl);

		$scope.$on('stories-updated', function (event, data) {
			
			if (data.listId === sl.list.id) {
				
				$timeout(function () {
					$scope.$apply(function () {
						sl.cards = data.stories;
					});
				}, 100);

			}
		});
		
		$scope.$on('edit-story', function (event, data) {
			if (data.listId === sl.list.id) {
				sl.editCard(data);
			}
		});

		sl.editList = function () {
			sl.board.editList(sl.list);
		}

		sl.deleteList = function () {
			sl.board.deleteList(sl.list);
		}

		sl.addCard = function () {
			
			var modalInstance = $uibModal.open({
				templateUrl: 'storyCardModal.html',
				controller: 'cardModalController',
				controllerAs: 'cm',
				resolve: {
					card: function () {
						return null;
					}
				}
			});

			modalInstance.result.then(
				function (newCard) {

					guidService.getGuid().then(
						function (response) {

							newCard.id = response.data;
							newCard.listId = sl.list.id;

							sl.cards = storageService.saveStory(newCard);
						}
					).catch(
						function (err) {
							console.log('Something went wrong: ', err);
						}
						);
				},
				function () {
					// cancelled
				}
			);
		}
		
		sl.editCard = function (card) {
			
			var modalInstance = $uibModal.open({
				templateUrl: 'storyCardModal.html',
				controller: 'cardModalController',
				controllerAs: 'cm',
				resolve: {
					card: function () {
						return angular.copy(card);
					}
				}
			});

			modalInstance.result.then(
				function (updatedCard) {

					sl.cards = storageService.saveStory(updatedCard);
				},
				function () {
					// cancelled
				}
			);
		};

		sl.deleteCard = function (card) {
			sl.cards = storageService.deleteStory(card);
		};

		sl.canDrop = function (event) {
			event.preventDefault();
		}
	}

	function cardModalController($uibModalInstance, card) {

		var cm = this;

		cm.isEdit = card ? true : false;		
		cm.card = card || {
			summary: '',
			detail: ''
		};

		cm.ok = function () {
			$uibModalInstance.close(cm.card);
		};

		cm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};

	}
})();