(function () {
	
	var app = angular.module('ngKanban');

	app.factory('chatService', ['globals', '$rootScope', '$q', function (globals, $rootScope, $q) {
		
		function subscribeToConversations(myUserId) {

			firebase.database().ref('chat/conversations/' + myUserId).on('value', function (snapshot) {
			
				var conversations = [];

				snapshot.forEach(function (childSnapshot) {
					conversations.push(childSnapshot.key);
				});
		
				$rootScope.$broadcast('chat-conversations-updated', conversations);
			});
		}	

		function subscribeToMessages(conversationId) {
			
			firebase.database().ref('chat/messages/' + conversationId).on('value', function (snapshot) {
			
				var messages = [];

				snapshot.forEach(function (childSnapshot) {
					messages.push(childSnapshot.val());
				});
		
				$rootScope.$broadcast('chat-messages-updated', {
					conversationId: conversationId,
					messages: messages
				});
			});
		}

		function getConversationId(myUserId, otherUserId) {

			var deferred = $q.defer();
			
			var myConversations = [];
			var otherConversations = [];

			firebase.database().ref('/chat/conversations/' + myUserId).once('value')
				.then(
					function (snapshot) {
						snapshot.forEach(function (childSnapshot) {
							myConversations.push(childSnapshot.key);
						});

						return firebase.database().ref('/chat/conversations/' + otherUserId).once('value');
					}
				)
				.then(
					function (snapshot) {
						snapshot.forEach(function (childSnapshot) {
							otherConversations.push(childSnapshot.key);
						});
						
						myConversations.forEach(function (item) {
							if (otherConversations.indexOf(item) > -1) {
								deferred.resolve(item);
							}
						});
						
						deferred.resolve(null);
					}
				);
			
			return deferred.promise;
		}

		function postMessage(conversationId, myUserId, otherUserId, text) {
			
			var timeStamp = new Date().getTime();
			var messageId = myUserId + '-' + timeStamp;

			firebase.database().ref('/chat/conversations/' + myUserId + '/' + conversationId).set(true);
			firebase.database().ref('/chat/conversations/' + otherUserId + '/' + conversationId).set(true);

			firebase.database().ref('/chat/messages/' + conversationId + '/' + messageId).set({
				timestamp: timeStamp.toString(),
				uid: myUserId,
				text: text
			});
		}
		
		return {
			subscribeToConversations: subscribeToConversations,
			subscribeToMessages: subscribeToMessages,
			getConversationId: getConversationId,
			postMessage: postMessage
		};
	}]);
	
})();