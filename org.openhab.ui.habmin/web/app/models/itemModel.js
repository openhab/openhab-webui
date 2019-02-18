/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.itemModel', [
    'HABmin.userModel',
    'HABmin.eventModel'
])

    .service('ItemModel', function ($http, $q, $rootScope, UserService, RestService, EventModel) {
        var svcName = "items";
        var svcNameLinks = "links";
        var itemList = [];
        var url = UserService.getServer() + '/rest/items';
        var eventSrc;

        var me = this;

        // Here we add the items list to the rootScope so we can watch for changes.
        // We keep a 'local' copy of the state so we can detect changes.
        // When changes come in from the server, we update both copies.
        // When changes are made locally, we can detect this and send the update to the server.
        // This system allows the item to be updated anywhere in the UI and we will automatically
        // detect the change and send to the server...
        $rootScope.itemList = itemList;
        $rootScope.$watch(function () {
                for (var i = 0; i < itemList.length; i++) {
                    if (itemList[i].stateLocal != itemList[i].state) {
                        itemList[i].stateLocal = itemList[i].state;
                        console.log("We updated", itemList[i].name, "to", itemList[i].state);
                        switch (itemList[i].type) {
                            case "Switch":
                                // TODO: Perform conversions
                                me.sendCommand(itemList[i].name, itemList[i].stateLocal);
                                break;
                            case "Dimmer":
                                me.sendCommand(itemList[i].name, itemList[i].stateLocal);
                                break;
                        }
                    }
                }
            }
            , function (newVal) {
                console.log("Updated to ", newVal);
            }, true);

        this.addOrUpdateItem = function (newItem) {
            // If this is a new thing, add it to the list
            /*            if(itemList[newItem.name] === undefined) {
             itemList[newItem.name] = {};
             }
             var item = itemList[newItem.name];*/

            var item = me.getItem(newItem.name);
            if (item == null) {
                // Item doesn't exist - add it
                item = newItem;
                itemList.push(item);
            }

            if (item.label == null) {
//                                    item.stateDescription = {
//                                        pattern: ""
//                                    };
                item.label = item.name;
//                return;
            }
            var title = item.label;
            var pntStart = item.label.indexOf("[");
            if (pntStart != -1) {
                title = item.label.substr(0, pntStart).trim();
                //    var pntFinish = item.label.lastIndexOf("]");
            }
            item.label = title;

            // Aggregate the data - only update what we've been given
            for (var i in newItem) {
                item[i] = newItem[i];
                if (i == "state") {
                    item['stateLocal'] = newItem[i];
                }
            }

            return item;
        };

        this.listen = function () {
            EventModel.registerEvent('ItemStateEvent', this.itemStateEvent);
            EventModel.registerEvent('ItemUpdatedEvent', this.itemUpdatedEvent);
            EventModel.registerEvent('ItemAddedEvent', this.itemAddedEvent);
            EventModel.registerEvent('ItemCommandEvent', this.itemCommandEvent);
            EventModel.registerEvent('ItemRemovedEvent', this.itemRemovedEvent);
        };

        this.itemStateEvent = function (event, payload) {
            var topic = event.topic.split("/");
            // Broadcast an event so we update any widgets or listeners
            $rootScope.$broadcast(event.topic, payload);
            // Here we actually get value and type
            me.addOrUpdateItem(
                {
                    name: topic[2],
                    state: payload.value,
                    stateLocal: payload.value
                }
            );
        };

        this.itemUpdatedEvent = function (event, payload) {
            me.addOrUpdateItem(payload[0]);
        };

        this.itemAddedEvent = function (event, payload) {
            me.addOrUpdateItem(payload);
        };

        this.itemCommandEvent = function (event, payload) {
        };

        this.itemRemovedEvent = function (event, payload) {
            var topic = event.topic.split("/");
            for (var i = 0; i < itemList.length; i++) {
                if (itemList[i].name == topic[2]) {
                    itemList.splice(i, 1);
                    break;
                }
            }
        };

        this.getList = function (refresh) {
            // Only get the list once, then rely on SSE unless we refresh
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            // TODO: Need to work out how to reconnect
            if (eventSrc == null) {
                me.listen();
            }

            // Just return the current list unless it's empty, or we explicitly want to refresh
            if (itemList.length != 0 && refresh != true) {
                deferred.resolve(itemList);
                return deferred.promise;
            }

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            data = [].concat(data);

                            // Add every item in the root items list to our local copy
                            angular.forEach(data, function (item) {
                                me.addOrUpdateItem(item);
                            });

                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(itemList);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );
            return deferred.promise;
        };

        this.getItem = function (itemName) {
            for (var i = 0; i < itemList.length; i++) {
                if (itemList[i].name == itemName) {
                    return itemList[i];
                }
            }

            return null;
            return itemList[itemName];

            var tStart = new Date().getTime();
            var deferred = $q.defer();

            // First try and get our local copy
            for (var b = 0; b < itemList.length; b++) {
                if (itemList[b].name == itemName) {
                    deferred.resolve(itemList[b]);
                    return deferred.promise;
                }
            }

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url + "/" + itemName)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );
            return deferred.promise;
        };

        this.getGroupMembers = function (group) {
            var members = [];

            for (var i = 0; i < itemList.length; i++) {
                if (itemList[i].groupNames != null && itemList[i].groupNames.indexOf(group) != -1) {
                    members.push(itemList[i]);
                }
            }

            return members;
        };

        this.getParentThingItem = function (item) {
            for (var i = 0; i < itemList.length; i++) {
                if (itemList[i].tags.indexOf("thing") == -1) {
                    continue;
                }
                if (item.groupNames.indexOf(itemList[i].name) != -1) {
                    return itemList[i];
                }
            }

            return null;
        };

        this.putItem = function (item) {
            if (item.tags === undefined) {
                item.tags = [];
            }
            if (item.groups == undefined) {
                item.groups = [];
            }
            var deferred = $q.defer();
            RestService.getService(svcName).then(
                function (url) {
                    $http.put(url + "/" + item.name, item)
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );
            return deferred.promise;
        };

        this.linkItem = function (channel, item) {
            var deferred = $q.defer();
            RestService.getService(svcNameLinks).then(
                function (url) {
                    $http.put(url + "/" + item.name + "/" + channel.uid)
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );
            return deferred.promise;
        };

        this.unlinkItem = function (channel, item) {
            var deferred = $q.defer();
            RestService.getService(svcNameLinks).then(
                function (url) {
                    $http.delete(url + "/" + item.name + "/" + channel.uid)
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );
            return deferred.promise;
        };

        this.deleteItem = function (item) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http['delete'](url + "/" + item.name)
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.sendCommand = function (item, value) {
            if (typeof value === 'number') {
                value = value + '';
            }
            console.log("Sending command", item, value);
            var deferred = $q.defer();
            $http.post(url + "/" + item, value, {
                    headers: {'Content-Type': 'text/plain'}
                }
            ).success(function (data, status) {
                    // Some extra manipulation on data if you want...
                    deferred.resolve([].concat(data));
                }).error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

    });
