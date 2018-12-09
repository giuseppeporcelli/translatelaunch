'use strict';

angular.module('shineCommerce.common').directive('spinner', ['$timeout',
    function ($timeout) {
        function newSpinner(color, inline, radius) {
            var options = {
                lines: 17,                                      // The number of lines to draw.
                length: 10,                                      // The length of each line.
                width: 3,                                       // The line thickness.
                corners: 1,                                     // Corner roundness (0..1).
                rotate: 77,                                     // The rotation offset.
                direction: 1,                                   // 1: clockwise, -1: counterclockwise.
                color: color || '#000',                         // #rgb or #rrggbb or array of colors.
                speed: 1.5,                                     // Rounds per second.
                trail: 56,                                      // Afterglow percentage.
                shadow: false,                                  // Whether to render a shadow.
                hwaccel: false,                                 // Whether to use hardware acceleration.
                className: 'spinner',                        // The CSS class to assign to the spinner.
                zIndex: 2e9                                     // The z-index (defaults to 2000000000).
            };
    
            if (radius) {
                options.radius = radius;                        // The radius of the inner circle.
            }
            else {
                options.radius = 23;                            // The default radius of the inner circle.
            }
    
            if (inline) {
                (options).position = 'relative';
                options.top = '0';
                options.top = '0';
            }
            else {
                options.top = '50%';                            // Top position relative to parent.
                options.left = '50%';                           // Left position relative to parent.
            }
    
            return new Spinner(options).spin();
        };

        return {
            transclude: true,
            link: (scope, element, attrs, ctrl, transclude) => {
                var color; // spinner colour
                var delay; // delay in milliseconds before entering spinning state; used to avoid flickering
                var fadeClass; // class applied to the content when spinning; typically used to fade content out
                var inline;
                var radius;

                var delayPromise;

                var content;
                var spinner;
                var spinnerContainer;

                transclude(scope, clone => {
                    content = clone;
                    element.append(clone);
                });

                scope.$watch(attrs['delay'], value => {
                    delay = value === void 0 ? 200 : value;
                });

                scope.$watch(attrs['fade'], value => {
                    if (value === true) {
                        fadeClass = 'spinner-fade';
                    }
                    else {
                        fadeClass = value;
                    }
                });

                scope.$watch(attrs['spinnerColor'], value => {
                    color = value;
                });

                scope.$watch(attrs['inline'], value => {
                    inline = value === 'true' ? true : false;
                });

                scope.$watch(attrs['radius'], value => {
                    radius = parseInt(value);
                });

                scope.$watch(attrs['spinner'], value => {
                    value = !!value;
                    if (value) {
                        if (!spinner) {
                            if (!delay) {
                                start();
                            }
                            else if (!delayPromise) {
                                delayPromise = $timeout(start, delay, false);
                            }
                        }
                    }
                    else {
                        stop();
                    }
                });

                scope.$on('$destroy', stop);

                function start() {
                    delayPromise = null;

                    spinner = newSpinner(color, inline, radius);
                    spinnerContainer = $(spinner.el).appendTo(element);

                    if (content && fadeClass) {
                        content.addClass(fadeClass);
                    }
                }

                function stop() {
                    if (delayPromise) {
                        $timeout.cancel(delayPromise);
                        delayPromise = null;
                    }
                    if (spinner) {
                        spinner.stop();
                        spinner = null;
                    }
                    if (spinnerContainer) {
                        spinnerContainer.remove();
                        spinnerContainer = null;
                    }
                    if (content && fadeClass) {
                        content.removeClass(fadeClass);
                    }
                }
            }
        };
    }
]);
