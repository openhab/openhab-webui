/**
 * angular-input-modified - Angular.js module to detect and indicate input modifications
 * @version v2.3.1
 * @link https://github.com/betsol/angular-input-modified
 * @license MIT
 *
 * @author Slava Fomin II <s.fomin@betsol.ru>
 */
(function (window, angular) {

  'use strict';

  // Registering Angular.js module.
  angular.module('ngInputModified', [])
    .directive('bsModifiable', ModifiableDirective)
  ;

  /**
   * This directive doesn't add any functionality,
   * it serves as a mere marker for ngModel directive.
   *
   * @constructor
   *
   * @returns {object}
   */
  function ModifiableDirective () {
    return {
      restrict: 'A',
      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        this.isEnabled = function () {
          return ('true' == $attrs.bsModifiable);
        };
      }]
    };
  }

})(window, angular);

(function (window, angular) {

  'use strict';

  // Extending Angular.js module.
  angular.module('ngInputModified')
    .provider('inputModifiedConfig', configProviderFactory)
  ;

  /**
   * Factory that creates configuration service.
   *
   * @returns {object}
   * @constructor
   */
  function configProviderFactory () {

    // Default config.
    var config = {
      enabledGlobally: true,
      modifiedClassName: 'ng-modified',
      notModifiedClassName: 'ng-not-modified'
    };

    return {
      enableGlobally: function () {
        config.enabledGlobally = true;
        return this;
      },
      disableGlobally: function () {
        config.enabledGlobally = false;
        return this;
      },
      setModifiedClassName: function (modifiedClassName) {
        config.modifiedClassName = String(modifiedClassName);
        return this;
      },
      setNotModifiedClassName: function (notModifiedClassName) {
        config.notModifiedClassName = String(notModifiedClassName);
        return this;
      },
      $get: function () {
        return config;
      }
    };
  }

})(window, angular);

(function (window, angular) {

  'use strict';

  // Extending Angular.js module.
  angular.module('ngInputModified')
    .directive('form', ['$animate', 'inputModifiedConfig', function ($animate, inputModifiedConfig) {
      return formDirectiveFactory($animate, inputModifiedConfig, false);
    }])
    .directive('ngForm', ['$animate', 'inputModifiedConfig', function ($animate, inputModifiedConfig) {
      return formDirectiveFactory($animate, inputModifiedConfig, true);
    }])
  ;

  function formDirectiveFactory ($animate, inputModifiedConfig, isNgForm) {

    // Shortcut.
    var config = inputModifiedConfig;

    return {
      name: 'form',
      restrict: isNgForm ? 'EAC' : 'E',
      require: ['?form'],
      link: function ($scope, $element, attrs, controllers) {

        // Handling controllers.
        var formCtrl = controllers[0];
        var parentFormCtrl = (formCtrl.$$parentForm || $element.parent().controller('form'));

        // Form controller is required for this directive to operate.
        // Parent form is optional.
        if (!formCtrl) {
          return;
        }

        formCtrl.modified = false;
        formCtrl.reset = reset;

        // Modified models.
        formCtrl.modifiedCount = 0;
        formCtrl.modifiedModels = [];
        formCtrl.$$notifyModelModifiedStateChanged = function (modelCtrl) {
          onModifiedStateChanged(modelCtrl, formCtrl.modifiedModels);
        };

        // Modified child forms.
        formCtrl.modifiedChildFormsCount = 0;
        formCtrl.modifiedChildForms = [];
        formCtrl.$$notifyChildFormModifiedStateChanged = function (childFormCtrl) {
          onModifiedStateChanged(childFormCtrl, formCtrl.modifiedChildForms);
        };


        /**
         * Resets all form inputs to it's master values.
         */
        function reset () {

          // Resetting modified models.
          angular.forEach(formCtrl.modifiedModels, function (modelCtrl) {
            modelCtrl.reset();
          });

          // Resetting modified child forms.
          angular.forEach(formCtrl.modifiedChildForms, function (childFormCtrl) {
            childFormCtrl.reset();
          });
        }

        /**
         * This universal function is called when child model or child form is modified
         * by the modified component itself.
         * It will update the corresponding tracking list, the number of modified components
         * and the form itself if required.
         *
         * @param ctrl  The modified model or modified form controller
         * @param list  The tracking list of modified controllers (models or forms)
         */
        function onModifiedStateChanged (ctrl, list) {

          var listIndex = list.indexOf(ctrl);
          var presentInList = (-1 !== listIndex);

          var updateRequired = true;

          if (ctrl.modified && !presentInList) {

            // Adding model to the internal list of modified models.
            list.push(ctrl);

          } else if (!ctrl.modified && presentInList) {

            // Removing model from the internal list of modified models.
            list.splice(listIndex, 1);

          } else {
            // Edge case when update is not required.
            updateRequired = false;
          }

          if (updateRequired) {

            updateModifiedState();

            // Notifying the parent form if it presents.
            if (parentFormCtrl && 'function' === typeof parentFormCtrl.$$notifyChildFormModifiedStateChanged) {
              parentFormCtrl.$$notifyChildFormModifiedStateChanged(formCtrl);
            }

            updateCssClasses();

            // Firing event to parent scopes.
            $scope.$emit('inputModified.formChanged', formCtrl.modified, formCtrl);

          }

        }

        /**
         * Updates form modified state.
         *
         * Form is considered modified when it has at least one
         * modified element or child form.
         */
        function updateModifiedState () {

          formCtrl.modifiedCount = formCtrl.modifiedModels.length;
          formCtrl.modifiedChildFormsCount = formCtrl.modifiedChildForms.length;

          formCtrl.modified =
            (formCtrl.modifiedCount + formCtrl.modifiedChildFormsCount) > 0
          ;
        }

        /**
         * Decorates element with proper CSS classes.
         */
        function updateCssClasses () {
          $animate.addClass($element, (formCtrl.modified ? config.modifiedClassName : config.notModifiedClassName));
          $animate.removeClass($element, (formCtrl.modified ? config.notModifiedClassName : config.modifiedClassName));
        }

      }
    };
  }

})(window, angular);

(function (window, angular) {

  'use strict';

  // Extending Angular.js module.
  angular.module('ngInputModified')
    .directive('ngModel', ngModelModifiedFactory)
  ;

  /**
   * This directive extends ng-model with modifiable behavior.
   *
   * @constructor
   * @param {object} $animate
   * @param {object} inputModifiedConfig
   * @param {function} $timeout
   * @param {function} $parse
   *
   * @returns {object}
   */
  function ngModelModifiedFactory (
    $animate,
    inputModifiedConfig,
    $timeout,
    $parse
  ) {

    // Shortcut.
    var config = inputModifiedConfig;

    return {
      restrict: 'A',
      require: ['?ngModel', '?^form', '?^bsModifiable'],
      link: function ($scope, $element, attrs, controllers) {

        /**
         * Path to a model variable inside the scope.
         * It can be as simple as: "foo" or as complex as "foo.bar[1].baz.qux".
         */
        var modelPath = attrs.ngModel;

        // We will initialize it later when needed.
        var modelValueSetter;

        // Handling controllers.
        var modelCtrl = controllers[0];
        var formCtrl = controllers[1];
        var bsModifiable = controllers[2];

        // Model controller is required for this directive to operate.
        // Parent form controller is optional.
        if (!modelCtrl) {
          return;
        }

        // This behavior is applied only when form element or
        // one of it's parents has a bsModifiable directive present
        // or when global switch is set.
        var enabled = (bsModifiable ? bsModifiable.isEnabled() : undefined);
        if (
             ( config.enabledGlobally && false === enabled) ||
             (!config.enabledGlobally && true  !== enabled)
        ) {
          return;
        }

        // Flag to indicate that master value was initialized.
        var masterValueIsSet = false;

        // Saving handle to original set-pristine method.
        var originalSetPristine = modelCtrl.$setPristine;

        // Replacing original set-pristine with our own.
        modelCtrl.$setPristine = setPristine;

        modelCtrl.modified = false;

        modelCtrl.masterValue = undefined;

        modelCtrl.reset = reset;

        // Watching for model value changes.
        $scope.$watch(modelPath, onInputValueChanged);


        /**
         * Sets proper modification state for model controller according to
         * current/master value.
         */
        function onInputValueChanged () {

          if (!masterValueIsSet) {
            initializeMasterValue();
          }

          var modified = !compare(modelCtrl.$modelValue, modelCtrl.masterValue);

          // If modified flag has changed.
          if (modelCtrl.modified !== modified) {

            // Setting new flag.
            modelCtrl.modified = modified;

            // Notifying the form.
            if (formCtrl && 'function' === typeof formCtrl.$$notifyModelModifiedStateChanged) {
              formCtrl.$$notifyModelModifiedStateChanged(modelCtrl);
            }

            // Re-decorating the element.
            updateCssClasses();
          }
        }

        /**
         * Initializes master value if required.
         */
        function initializeMasterValue () {

          // Initializing the master value.
          modelCtrl.masterValue = modelCtrl.$modelValue;

          // Initially decorating the element.
          updateCssClasses();

          masterValueIsSet = true;
        }

        /**
         * Decorates element with proper CSS classes.
         */
        function updateCssClasses () {
          $animate.addClass($element, (modelCtrl.modified ? config.modifiedClassName : config.notModifiedClassName));
          $animate.removeClass($element, (modelCtrl.modified ? config.notModifiedClassName : config.modifiedClassName));
        }

        /**
         * Overloading original set-pristine method.
         */
        function setPristine () {

          stabilizeValue(function () {

            // Calling overloaded method.
            originalSetPristine.apply(this, arguments);

            // Updating parameters.
            modelCtrl.masterValue = modelCtrl.$modelValue;
            modelCtrl.modified = false;

            // Notifying the form.
            formCtrl.$$notifyModelModifiedStateChanged(modelCtrl);

            // Re-decorating the element.
            updateCssClasses();

          });

        }

        /**
         * Replaces current input value with a master value.
         */
        function reset () {
          if (!modelValueSetter) {
            modelValueSetter = $parse(modelPath).assign;
          }
          modelValueSetter($scope, modelCtrl.masterValue);
        }

        /**
         * Stabilizes model's value.
         * This is required for directives such as Angular UI TinyMCE.
         */
        function stabilizeValue (callback) {
          var initialValue = modelCtrl.$modelValue;
          modelCtrl.$modelValue = null;
          $timeout(function () {
            modelCtrl.$modelValue = initialValue;
            $timeout(callback, 0);
          }, 0);
        }

      }
    };
  }
  ngModelModifiedFactory.$inject = ['$animate', 'inputModifiedConfig', '$timeout', '$parse'];

  /**
   * Returns true if specified values are equal, false otherwise.
   * Supports dates comparison.
   *
   * @param {*} value1
   * @param {*} value2
   *
   * @returns {boolean}
   */
  function compare (value1, value2) {
    value1 = normalizeValue(value1);
    value2 = normalizeValue(value2);

    if ('object' === typeof value1 && 'object' === typeof value2) {
      if (value1 instanceof Date && value2 instanceof Date) {
        // Comparing two dates.
        return (value1.getTime() === value2.getTime());
      } else {
        // Comparing two objects.
        return angular.equals(value1, value2);
      }
    }

    // In all other cases using weak comparison.
    return (value1 == value2);
  }

  /**
   * Casting all null-like values to actual null for guaranteed comparison.
   *
   * @param {*} value
   *
   * @returns {*}
   */
  function normalizeValue (value) {
    return (undefined === value || '' === value ? null : value);
  }

})(window, angular);
