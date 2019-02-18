; (function(angular) {
  'use strict';

  /**
   * Called with an array this acts like map, otherwise it acts like _.mapValues
   * in lodash.
   * @return {Array|Object} The same type as the input argument.
   */
  var mapValues = function(obj, callback) {
    if (angular.isArray(obj))
      return obj.map(callback)

    var ret = {}
    Object.keys(obj).forEach(function(key, val) {
      ret[key] = callback(obj[key], key)
    })
    return ret
  }

  angular.module('ngPromiseExtras', []).config([ '$provide', function($provide) {
    $provide.decorator('$q', [ '$delegate', function($delegate) {
      var $q = $delegate

      $q.allSettled = function(promises) {
        return $q.all(mapValues(promises, function(promiseOrValue) {
          if (! promiseOrValue.then)
            return { state: 'fulfilled', value: promiseOrValue }

          return promiseOrValue.then(function(value) {
            return { state: 'fulfilled', value: value }
          }, function(reason) {
            return { state: 'rejected', reason: reason }
          })
        }))
      }

      $q.map = function(values, callback) {
        return $q.all(mapValues(values, callback))
      }

      $q.mapSettled = function(values, callback) {
        return $q.allSettled(mapValues(values, callback))
      }

      /**
       * Like Bluebird.resolve.
       */
      $q.resolve = function(value) {
        if (value && value.then)
          return value
        else
          return $q(function(resolve) { resolve(value) })
      }

      return $q
    } ])
  } ])

})(window.angular);
