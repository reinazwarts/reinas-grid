;(function ($) {
	'use strict';

	var toggleGuidelines = function () {

		$('.js-toggle-guidelines').on('click', function () {
			$('body').toggleClass('debug');
		});


	};



	function init() {
		toggleGuidelines();
	}

	$(document).ready(init);

})(jQuery);