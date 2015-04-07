'use strict';

/**
 * @ngdoc function
 * @name branchsterWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the branchsterWebApp
 */
angular.module('branchsterWebApp')
	.config(function(FacebookProvider) {
		 FacebookProvider.init('348703352001630');
	})
  .controller('MainCtrl', ['$scope', '$timeout', 'Facebook', 'utilities', function ($scope, $timeout, Facebook, utilities) {

  	$scope.updateDescription = function() {
    	$scope.description = utilities.getDescription($scope);
    };

  	$scope.init = function() {
  		// available branchster colors
	    $scope.colors = [ '#24A4DD', '#EC6279', '#29B471', '#F69938', '#84268B', '#24CADA', '#FED521', '#9E1623' ];

	    // descriptions of Branchster for each face
	    $scope.descriptions = [
			'$name is a social butterfly. She’s a loyal friend, ready to give you a piggyback ride at a moments notice or greet you with a face lick and wiggle.',
			'Creative and contagiously happy, $name has boundless energy and an appetite for learning about new things. He is vivacious and popular, and is always ready for the next adventure.',
			'$name prefers to work alone and is impatient with hierarchies and politics.  Although he’s not particularly social, he has a razor sharp wit (and claws), and is actually very fun to be around.',
			'Independent and ferocious, $name experiences life at 100 mph. Not interested in maintaining order, he is a fierce individual who is highly effective, successful, and incredibly powerful.',
			'Peaceful, shy, and easygoing, $name takes things at his own pace and lives moment to moment. She is considerate, pleasant, caring, and introspective. She’s a bit nerdy and quiet -- but that’s why everyone loves him.'
		];

		// default name
	    $scope.defaultName = 'Bingles Jingleheimer';

		// selected branchster on load
	    $scope.selectedFaceIndex = 0;
	    $scope.selectedBodyIndex = 0;
	    $scope.selectedColorIndex = 0;
	    $scope.branchsterName = $scope.defaultName;
	    $scope.updateDescription();

	    // Links
	    $scope.phone = '';
	    $scope.smsLink = '';
	    $scope.displayLink = '';
	    $scope.clipboardLink = '';

	    // Interface
        $scope.interfaceResetTime = 3000;
        $scope.smsError = false;
        $scope.showSMSSent = false;
        $scope.loaded = false;
  	};

  	$scope.load = function(data) {
  		// Interface
		$timeout(function() {
			$scope.showEditor = true;
	  		$scope.loaded = true;

	  		// Load Branchster
	  		/*jshint -W069 */
	  		if (data.data) {
	  			var dataObject = JSON.parse(data.data);
				$scope.selectedFaceIndex = dataObject['face_index'];
			    $scope.selectedBodyIndex = dataObject['body_index'];
			    $scope.selectedColorIndex = dataObject['color_index'];
				$scope.branchsterName = dataObject['monster_name'];
				$scope.updateDescription();
				$scope.showEditor = false;
	  		}
			/*jshint +W069 */
		});
  	};

    $scope.switchColor = function(color) {
    	$scope.selectedColorIndex = color;
    };

    $scope.incrementFace = function(amount) {
    	$scope.selectedFaceIndex += utilities.loopIncrement(amount, $scope.selectedFaceIndex, 4);
    	$scope.description = utilities.getDescription($scope);
    };

    $scope.incrementBody = function(amount) {
    	$scope.selectedBodyIndex += utilities.loopIncrement(amount, $scope.selectedBodyIndex, 4);
    };

    $scope.createBranchster = function() {
		$scope.showEditor = false;
		$scope.branchsterName = $scope.branchsterName || $scope.defaultName;
		window.branch.banner({
			title: 'Branchsters',
			description: 'Get the app!',
			icon: 'images/icons/icon3.png'
		}, {
			channel: 'banner',
			feature: 'share',
			tags: [ 'desktop_creator' ],
			data: utilities.linkData($scope)
		});
		$scope.makeLink('display');
    };

    $scope.recreateBranchster = function() {
    	$scope.showEditor = true;
    };

	$scope.onTextClick = function ($event) {
		$event.target.select();
	};

    $scope.makeLink = function(channel) {
    	utilities.resetShows($scope);
    	$scope.interfaceWait = true;
		window.branch.link({
			channel: channel,
			feature: 'share',
			tags: [ 'desktop_creator' ],
			data: utilities.linkData($scope)
		}, function(err, link) {
			$timeout(function() {
				if (channel === 'sms') {
					$scope.showSMS = true;
					$scope.smsLink = link;
				} 
				else if (channel === 'display') {
					$scope.displayLink = link;
				}
				else if (channel === 'clipboard') {
					$scope.showClipboard = true;
					$scope.clipboardLink = link;
				}
				else if (channel === 'twitter') {
					utilities.popup(
						'https://twitter.com/intent/tweet?text=Check%20out%20my%20Branchster%20name%20' + $scope.branchsterName + '&url=' + link + '&original_referer=',
						{
							width: 848,
							height: 645,
							name:'twitter',
						}
					);
				}
				else if (channel === 'pinterest') {
					utilities.popup(
						'http://pinterest.com/pin/create/link/?url=' + link,
						{
							width: 800,
							height: 550,
							name:'pinterest',
						}
					);
				}
				else if (channel === 'facebook') {
					$scope.facebookLink = link;
					Facebook.ui({
						method: 'share_open_graph',
						/*jshint camelcase: false */
						action_type: 'og.likes',
						action_properties: JSON.stringify({
							object: link,
						}),
					}, function(response){ console.log(response); });
				}
				$scope.interfaceWait = false;
			});
		});
    };

    $scope.sendSMS = function() {
    	if ($scope.phone) {
    		$scope.interfaceWait = true;
    		window.branch.sendSMS(
			$scope.phone,
			{ data: utilities.linkData($scope) },
			{
				/*jshint camelcase: false */
				make_new_link: false
			},
			function(err) {
				$timeout(function() {
					if (err) {
						utilities.flashState($scope, 'smsError', $scope.interfaceResetTime);
					}
					else {					
						utilities.flashState($scope, 'showSMSSent', $scope.interfaceResetTime);
					}
				});
			});
    	}
    	else {
    		utilities.flashState($scope, 'smsError', $scope.interfaceResetTime);
    	}
    };

    // Inititate the app
    $scope.init();
    window.branch.init('36930236817866882', function(err, data) {
    	if (!err) {
    		$scope.load(data);
    	}
	});
}]);