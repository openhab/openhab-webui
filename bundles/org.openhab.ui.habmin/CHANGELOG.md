<a name"0.1.6"></a>
### 0.1.6 (2016-06-19)


#### Bug Fixes

* **Bindings:**
  * Remove binding config if binding has no configuration defined ([f2dfe24b](https://github.com/cdjackson/HABmin2/commit/f2dfe24b), closes [#174](https://github.com/cdjackson/HABmin2/issues/174))
* **Chart:**
  * Fix saving of default persistence service ([8b452709](https://github.com/cdjackson/HABmin2/commit/8b452709))
  * Fix error message when chart data can't be loaded ([326927a2](https://github.com/cdjackson/HABmin2/commit/326927a2), closes [#179](https://github.com/cdjackson/HABmin2/issues/179))
* **Dashboard:**
  * Fixed string error with group widget ([93b0d582](https://github.com/cdjackson/HABmin2/commit/93b0d582))
* **Designer:**
  * Fix item registry SCR connection ([7d702900](https://github.com/cdjackson/HABmin2/commit/7d702900))
* **Things:**
  * Fixed error with multiple select dropdown not allowing selection ([a95e02ca](https://github.com/cdjackson/HABmin2/commit/a95e02ca))
  * Fixed default item name to remove dashes ([edcfb932](https://github.com/cdjackson/HABmin2/commit/edcfb932))
* **UI:**
  * Update string loading in chart and rules ([dd2e6f7c](https://github.com/cdjackson/HABmin2/commit/dd2e6f7c))
  * Fix error with Safari not working with edit boxes ([c5664ea5](https://github.com/cdjackson/HABmin2/commit/c5664ea5))


#### Features

* **Bindings:**
  * Add list of thing types supported by binding ([c878517b](https://github.com/cdjackson/HABmin2/commit/c878517b))
* **Extensions:**
  * Added processing of failed commands with growl notification ([10f45372](https://github.com/cdjackson/HABmin2/commit/10f45372))
* **Mobile:**
  * Add server configuration to user preferences ([5dd9cb31](https://github.com/cdjackson/HABmin2/commit/5dd9cb31))
* **Services:**
  * Added interface to configure ESH services ([3e46f6ca](https://github.com/cdjackson/HABmin2/commit/3e46f6ca))
* **Things:**
  * Add search capability to item link dialog ([b1a84775](https://github.com/cdjackson/HABmin2/commit/b1a84775))
* **UI:**
  * Add button to close "Server Offline" message box ([6e828133](https://github.com/cdjackson/HABmin2/commit/6e828133), closes [#104](https://github.com/cdjackson/HABmin2/issues/104))
  * Add Dutch translation ([1aa1a770](https://github.com/cdjackson/HABmin2/commit/1aa1a770))


<a name"0.1.5"></a>
### 0.1.5 (2016-05-24)


#### Bug Fixes

* **Things:**
  * Fixed freeform combobox editor ([cc1f65b9](https://github.com/cdjackson/HABmin2/commit/cc1f65b9))


#### Features

* **Extensions:**
  * Add dynamic feedback of extension install in progress ([f006e359](https://github.com/cdjackson/HABmin2/commit/f006e359))
* **Items:**
  * Add tagging to item editor ([e20c646a](https://github.com/cdjackson/HABmin2/commit/e20c646a))
* **Things:**
  * Add thing property/attribute display ([85173b91](https://github.com/cdjackson/HABmin2/commit/85173b91))
  * Added refresh button to manually refresh the items linked to a thing ([a8c6d2ad](https://github.com/cdjackson/HABmin2/commit/a8c6d2ad))
* **UI:**
  * Add extensions interfaces ([1e58b21c](https://github.com/cdjackson/HABmin2/commit/1e58b21c))
  * Add Swedish translation ([16779e15](https://github.com/cdjackson/HABmin2/commit/16779e15))
* **ZWave:**
  * Improve rendering of device last wakeup time ([f8158ee8](https://github.com/cdjackson/HABmin2/commit/f8158ee8))
  * Add Z-Wave specific attribute template ([b6ee2add](https://github.com/cdjackson/HABmin2/commit/b6ee2add))
  * Add Z-Wave Plus Device Types ([f79fdcaf](https://github.com/cdjackson/HABmin2/commit/f79fdcaf))


<a name="0.1.4"></a>
### 0.1.4 (2016-04-10)


#### Bug Fixes

* **UI**
  * Fixed error handling state conversions


#### Features

* **Things:**
  * Update thing overview to provide channel status and button control
  * Add 'Add All' button to discovery inbox
* **UI**
  * Add Polish translation
  * Add combobox widget for thing configuration


<a name="0.1.3"></a>
### 0.1.3 (2016-03-31)


#### Bug Fixes

* **Rules:**
  * Update folder used for saving rules ([e0930658](git@github.com:cdjackson/HABmin2/commit/e093065800ce31acdd419832568606bf2cdb9b21))


#### Features

* **Things:**
  * Add confirmation dialogs when deleting items ([b9aa20d3](git@github.com:cdjackson/HABmin2/commit/b9aa20d349f5bf69f686bf6993808ced90bfaa72))
  * Add unlink button in channels list ([56cb2765](git@github.com:cdjackson/HABmin2/commit/56cb276581cb28137a964112d0b9c21965bde7ec))
* **UI:**
  * Updated German translations ([be34d1ab](git@github.com:cdjackson/HABmin2/commit/be34d1abdb5e506f2ec36cdae74a9ca183ec27c0))
  * Provide user selection for default persistence ([8290cbdb](git@github.com:cdjackson/HABmin2/commit/8290cbdb7d5c0691b210e232ed7181866f649465))


<a name="0.1.2"></a>
### 0.1.2 (2016-03-26)


#### Bug Fixes

* **Chart:**
  * Fixed selection of persistence service ([bed232b7](git@github.com:cdjackson/HABmin2/commit/bed232b7dd770c569da2b8993518781ceb5fa281))
* **Things:**
  * Fix linking items to channels ([3a78e5f8](git@github.com:cdjackson/HABmin2/commit/3a78e5f81ac9da5ab26fda90d5d923623f798afc))
  * Fix value sent when posting actions ([a27db7a8](git@github.com:cdjackson/HABmin2/commit/a27db7a8d3631a15407a8fa0f3bdeb3ff4eb4e33))
  * Fixed display of advanced/non-advanced actions in tools menu ([77e93087](git@github.com:cdjackson/HABmin2/commit/77e930872a9e2af63f5bbcfbdc1cc7a70f98f310))
  * Remove - sign from automatically generated item names ([ba84b361](git@github.com:cdjackson/HABmin2/commit/ba84b3617fa31eb8e166e39fa3626d57a1958bce))
  * Add error message following failure to get thing data ([e1ab021b](git@github.com:cdjackson/HABmin2/commit/e1ab021b1e9de10652792a260a2c0efe6063886f))
  * Fixed update of item names when channels updated ([a501f524](git@github.com:cdjackson/HABmin2/commit/a501f524083b7a6448b402f3d73f583b9ca7b25d))


#### Features

* **Things:**
  * Added config pending badge ([b9ae4587](git@github.com:cdjackson/HABmin2/commit/b9ae4587fa4cb8ce72b7d1d590cc0fdc6b5783db))
  * Modify actions to send the first option value ([6a8a05a7](git@github.com:cdjackson/HABmin2/commit/6a8a05a731e4c7b275a6e815e78962ee468e64fb))
  * Updated editing and linking of items to channels ([494a922c](git@github.com:cdjackson/HABmin2/commit/494a922c04fb2c33b8667909c3f104999dfe67b2))
  * Hide thing types that are not marked as listed ([03375c67](git@github.com:cdjackson/HABmin2/commit/03375c6745de9b4297f5b867946d109f83b0e578))
  * Don't show channels tab if there are none ([ad1c5d40](git@github.com:cdjackson/HABmin2/commit/ad1c5d40a31111a5521aef20ad82c5fcc4758ed0))
* **UI:**
  * Update Italian translation ([39a24b6e](git@github.com:cdjackson/HABmin2/commit/39a24b6ee803f8d38f1e91e784682639899558ad))
* **ZWave:**
  * Added inclusion message display to log processor ([331f32d3](git@github.com:cdjackson/HABmin2/commit/331f32d3705fe9bfb230460b56b9ce9681b55efe))
  * Add support for security class in log viewer ([8205aaca](git@github.com:cdjackson/HABmin2/commit/8205aaca8fdef23ed1eabc4931bb5b5ce8b67a44))



<a name="0.1.1"></a>
### 0.1.1 (2016-03-06)


#### Bug Fixes

* **Chart:**
  * Fix bug with ESH chart requests ([447f918d](git@github.com:cdjackson/HABmin2/commit/447f918dae17ab9570e8d85cb863e21d917bd92b))
  * Fixed bug displaying charts with no data ([d8343245](git@github.com:cdjackson/HABmin2/commit/d83432457e86b96829cbe3fbdf1167fc2d1592b3), closes [#63](git@github.com:cdjackson/HABmin2/issues/63))
* **Dashboard:**
  * Fixed error loading dashboard image ([50929fd8](git@github.com:cdjackson/HABmin2/commit/50929fd860e2ae697a00c7b0a82101554270af3c))
  * Fixed display issue when dashboard in mobile display ([4cdf7025](git@github.com:cdjackson/HABmin2/commit/4cdf7025b9cf29de451f8b7796eac31e4c89fb20))
  * Fixed bug where sometimes a new dashboard is created when saved ([c631ceef](git@github.com:cdjackson/HABmin2/commit/c631ceef2474423c4fdc4b5e957b730f521a6217), closes [#45](git@github.com:cdjackson/HABmin2/issues/45))
* **Floorplan:**
  * Fix bug saving floorplan images ([fb5bad98](git@github.com:cdjackson/HABmin2/commit/fb5bad9824c349ab9af7aea14c695cb713cdc2d5))
  * Highlight hotspots when value updated ([9e477059](git@github.com:cdjackson/HABmin2/commit/9e4770599c29ddf4ee85a7e5f73bac218c2ed1bf))
* **Items:**
  * Fixed item delete URL ([791cb185](git@github.com:cdjackson/HABmin2/commit/791cb185c285c7cf2f621c651ef8dfaeb9eafc3b))
* **Sitemap:**
  * Fixed slider when sending 0% level fixes #79 ([a502f62f](git@github.com:cdjackson/HABmin2/commit/a502f62f44808b281112b0ce02ad746f5d8ed967))
  * Fix value displayed in sitemap Text widget ([8455995b](git@github.com:cdjackson/HABmin2/commit/8455995b00ebf723a2ede653be8a5c036ca05732))
* **Things:**
  * Fixed issue saving channel items and improved reporting ([aea65242](git@github.com:cdjackson/HABmin2/commit/aea6524262dc28f62f5634de2e1f740aa8767647))
  * Fixed errors with handling of different types of config data ([bacd17f9](git@github.com:cdjackson/HABmin2/commit/bacd17f9aa2c29eb89dd08495433d3ce072118fe))
  * Fix handling of BOOLEAN configuration types ([5aaf184c](git@github.com:cdjackson/HABmin2/commit/5aaf184c045a0bdba4187faacc3f94a8e040e513))
  * Display channel numbers to account for dynamic channels ([175c73d0](git@github.com:cdjackson/HABmin2/commit/175c73d0fe0d6cc58a3a34f1cc0b125109498f3d))
  * Fixed saving of items linked to channels ([1c9d3de6](git@github.com:cdjackson/HABmin2/commit/1c9d3de628cde87a67bdfa1db3413c34cd0fd47f))
  * Fix error updating thing status ([cd2b16eb](git@github.com:cdjackson/HABmin2/commit/cd2b16eb498fa23b489f9faa14978ca86fc2b9aa))
  * Limit thing description to one line ([b79111c6](git@github.com:cdjackson/HABmin2/commit/b79111c6cab5e3912a0303519af144e9efdee652))
  * Fix  of advanced groups in thing configuration editor ([011c34aa](git@github.com:cdjackson/HABmin2/commit/011c34aa2a70156a78134c33a23f71b5dc7f9346), closes [#69](git@github.com:cdjackson/HABmin2/issues/69))
  * Fix loading icon when loading things configuration list ([dc7d6d46](git@github.com:cdjackson/HABmin2/commit/dc7d6d4612cf6723df028dcd4d1fbb1a2c54b5c9), closes [#65](git@github.com:cdjackson/HABmin2/issues/65))
  * Stopped bridge label showing UID when bridge selected ([3772c338](git@github.com:cdjackson/HABmin2/commit/3772c3387541c1654b92b9a28644117d35f013c7), closes [#61](git@github.com:cdjackson/HABmin2/issues/61))
  * Ensure "No things found" warning is removed when thing added ([b2917150](git@github.com:cdjackson/HABmin2/commit/b29171505438822472b9fdad789d942fe05a6e04), closes [#31](git@github.com:cdjackson/HABmin2/issues/31))
  * Fix bug adding new thing when no thing is displayed ([99a20aee](git@github.com:cdjackson/HABmin2/commit/99a20aeef31f5dfc8f56a352f84a67c590e06838), closes [#53](git@github.com:cdjackson/HABmin2/issues/53))
* **UI:**
  * Fix compilation so that HABmin css overrides default classes ([4a153a1e](git@github.com:cdjackson/HABmin2/commit/4a153a1e429c6d5a379ff5a5bfa82e826457bbfd))
  * Fix layout issue in properties forms ([35b722d2](git@github.com:cdjackson/HABmin2/commit/35b722d24da5a1b40269c2dd008634c63483e139))
  * Set default language for time translation to English ([da3dae41](git@github.com:cdjackson/HABmin2/commit/da3dae416e36034df026f1c6cd88990b4e39c9ed), closes [#62](git@github.com:cdjackson/HABmin2/issues/62))


#### Features

* **Chart:**
  * Update charting to use ESH persistence resource ([c4b6b6b9](git@github.com:cdjackson/HABmin2/commit/c4b6b6b9a4c65ac3bef5935100612f7103dee025))
  * Add menu button to delete current chart ([f52cadfd](git@github.com:cdjackson/HABmin2/commit/f52cadfdf76b4df5855879a5f1a8d36435991ef6))
  * Add refresh button to chart toolbar to update current chart ([36013a6a](git@github.com:cdjackson/HABmin2/commit/36013a6a308635b7fa28c3f0962e4c28b7512c02))
  * Make chart display full width and add dropdown for item selection ([0f860f6e](git@github.com:cdjackson/HABmin2/commit/0f860f6ee65398a44602bc0b92651205bc4e4c72))
* **Floorplan:**
  * Added dirty checking and SAVE button highlighting ([e7d517a9](git@github.com:cdjackson/HABmin2/commit/e7d517a90c6eef2f1739058cf608fc46ac314406))
  * Don't display hotspots until image loaded ([aca3e846](git@github.com:cdjackson/HABmin2/commit/aca3e84685ca9b6dec6fbf54f578ff57dbb1b6b2))
  * Add support for uploading floorplan images ([360d54d5](git@github.com:cdjackson/HABmin2/commit/360d54d5b4a3ef6e494eb7ef90ecbc3371772c59))
* **Items:**
  * Added function to delete an item ([ea09b1a7](git@github.com:cdjackson/HABmin2/commit/ea09b1a7261d82a14f2c55010eaf757a2e64f223))
  * Add filter to item edit list ([88105d6a](git@github.com:cdjackson/HABmin2/commit/88105d6ade0d8f0137c2d421e953ea9d5b3df693))
  * Add thing name to item in item list ([ad0ec6a7](git@github.com:cdjackson/HABmin2/commit/ad0ec6a7752f7b553cf7cbfcd964202e6a4875dc))
* **Sitemap:**
  * Add switch mappings. ([5028e13e](git@github.com:cdjackson/HABmin2/commit/5028e13e905a8c1cbdbde9ebfac77eb85cadc43c), closes [#92](git@github.com:cdjackson/HABmin2/issues/92))
  * Add color picker widget to sitemap ([866f1b28](git@github.com:cdjackson/HABmin2/commit/866f1b280a64184acbbc8e20eaca27c9e82f90c3))
  * Update sitemap widgets to use SSE ([199a706e](git@github.com:cdjackson/HABmin2/commit/199a706ed9eacb9a33a2b36f1878d28bb399a7cf))
* **Things:**
  * Updated UI to allow thing UID to be manually specified ([de728fce](git@github.com:cdjackson/HABmin2/commit/de728fce1f47883993d5d2926de0ebf802e0bba2))
  * Send default value for config actions ([b75656f9](git@github.com:cdjackson/HABmin2/commit/b75656f93692fa608c72f1cc861210fccf242238))
  * Improved handling of default values in parameters ([5ca14b9d](git@github.com:cdjackson/HABmin2/commit/5ca14b9d77a307c438979c2f75c78ee7c8a596cf))
  * Provide function for editing channel configuration ([12f8472a](git@github.com:cdjackson/HABmin2/commit/12f8472a5ed8205e766d093ae9184237cf733290))
  * Add button to copy item name to clipboard ([9eddbca8](git@github.com:cdjackson/HABmin2/commit/9eddbca89b43379b0f245cd72dc9b8c0877eb534))
  * Added ability to force delete a thing if it's got no thingType ([b2edefe0](git@github.com:cdjackson/HABmin2/commit/b2edefe0bdd9dd81b3e0dd79cdf96e6ed18eb6eb))
  * Disable things that cannot be configured (e.g. have no thingType) ([272c7e82](git@github.com:cdjackson/HABmin2/commit/272c7e82d75a6feb470745e12e209c6568a76d49))
  * Add new Thing configuration wizard ([96b3db95](git@github.com:cdjackson/HABmin2/commit/96b3db95a34e3960c5bc58ddc8f870ec1ada10df))
  * Improved saving of things and notification of completion ([88c110ac](git@github.com:cdjackson/HABmin2/commit/88c110ac51eaa24a9682b74dc4690517c4038817))
  * Update saving of config to use new REST endpoint ([7a97b623](git@github.com:cdjackson/HABmin2/commit/7a97b62360bdbf33046d3af7eccbb13255f4ffea))
  * Select default bridge when creating thing if there's only a single bridge ([bdc8240e](git@github.com:cdjackson/HABmin2/commit/bdc8240ed81c714f0ecb1cdbfb62e3ef9c457e09), closes [#64](git@github.com:cdjackson/HABmin2/issues/64))
  * Provide default thing name when adding new thing ([8109054b](git@github.com:cdjackson/HABmin2/commit/8109054b3223596d0bb44c26431df69d47d9a731))
* **UI:**
  * Add Italian translation ([942c5f06](git@github.com:cdjackson/HABmin2/commit/942c5f06cd5e0beb19aa970e81a219ffda80d581))
  * Add 'clear inbox' button to inbox list ([8014fa1d](git@github.com:cdjackson/HABmin2/commit/8014fa1d2d72b1280811cab0cc68cdba5c11d33c))
  * Add tooltips to navbar menu icons ([6052799b](git@github.com:cdjackson/HABmin2/commit/6052799b154063653f920c69e98e3e916b67c1a0))
  * Add clock to taskbar ([90140949](git@github.com:cdjackson/HABmin2/commit/901409497c17730675e1512eb0280f51613b7f1f))
  * Add full screen mode ([67af4319](git@github.com:cdjackson/HABmin2/commit/67af4319acd03955c462ef7b1ca718aba943a2ce))
  * Updated icon fonts ([ec6d36d4](git@github.com:cdjackson/HABmin2/commit/ec6d36d413d0b887b340ef0ab07464644ebade66))
  * Disable 'show all' checkbox in new thing notification if no ignored things ([4259a5e1](git@github.com:cdjackson/HABmin2/commit/4259a5e17ce2eec927a17c471a5809013d75893c))
* **User:**
  * Update user configuration form to use new layout ([0eb54e4b](git@github.com:cdjackson/HABmin2/commit/0eb54e4b526412c17fd1904075f8a7411df7a459))
* **ZWave:**
  * Add network diagram for OH2 binding ([4704ff44](git@github.com:cdjackson/HABmin2/commit/4704ff446f5ca0236e50ee6c64d49e257d451d30))


<a name="0.0.15"></a>
### 0.0.15 (2015-06-19)


#### Bug Fixes

* **Chart:**
  * Fix item buttons and persistence selection tick position ([a393fb96](git@github.com:cdjackson/HABmin2/commit/a393fb9645303788d1e873b2773c21d40f8d5d64), closes [#59](git@github.com:cdjackson/HABmin2/issues/59))
  * Fixed default vertical axis title colour ([f26a9133](git@github.com:cdjackson/HABmin2/commit/f26a913353ab8b4410a5ba40bd199e1154590a4e), closes [#55](git@github.com:cdjackson/HABmin2/issues/55))
  * Fixed highlighting of selected chart ([2647fd52](git@github.com:cdjackson/HABmin2/commit/2647fd52c234503e24a8dd6ab4be23bd5e699139))
  * Allow a chart to be reselected to reloaded ([6153a3b3](git@github.com:cdjackson/HABmin2/commit/6153a3b3e128235b5b4e2a3720ffad27b5e065f9), closes [#22](git@github.com:cdjackson/HABmin2/issues/22))
  * Fixed error selecting items to chart ([7ced8658](git@github.com:cdjackson/HABmin2/commit/7ced8658e3359e3d4e5a814ac925caa98840a692), closes [#50](git@github.com:cdjackson/HABmin2/issues/50))
* **Things:**
  * Fix initialisation error displaying thing configuration ([cbcf69af](git@github.com:cdjackson/HABmin2/commit/cbcf69afc973809872bd1f55c7f8703c34b0db87))
  * Fixed rendering of thing name when adding a thing ([84264d51](git@github.com:cdjackson/HABmin2/commit/84264d51bb26b3c8950d9eecfd6b5e4215234d5b))
  * Fixed button rendering in thing config editor ([7b4e969c](git@github.com:cdjackson/HABmin2/commit/7b4e969c67a7a46ca83f405f6ec7b3e3fd4d22f0))
* **UI:**
  * Add German translation for time data ([64350c30](git@github.com:cdjackson/HABmin2/commit/64350c30387641f0accbe818942d4ff578d05138), closes [#58](git@github.com:cdjackson/HABmin2/issues/58))
  * Fix apply error in panel resizing ([3ff4f4c7](git@github.com:cdjackson/HABmin2/commit/3ff4f4c7a35fa5b6d322b546d02a82c0e6bf970d))


#### Features

* **Scheduler:**
  * Add timeline view to scheduler ([298d8fdf](git@github.com:cdjackson/HABmin2/commit/298d8fdfbc27bd2c031c377e859319841818e15b))
* **Things:**
  * By default hide ignored things from inbox popup ([2d24cc33](git@github.com:cdjackson/HABmin2/commit/2d24cc338af938bcf1d85b4ac00ff6159f2d2f36))
* **UI:**
  * Add notification dialog if server is offline ([03d5b0f7](git@github.com:cdjackson/HABmin2/commit/03d5b0f776ec8581f1c44594ba6db4ee0d56f589))


<a name="0.0.14"></a>
### 0.0.14 (2015-05-25)


#### Bug Fixes

* **Chart:**
  * Fix panel resizing when switching between chart and item view ([ce7b57b4](git@github.com:cdjackson/HABmin2/commit/ce7b57b48f4e669d49c7e6d07c0859224a56df47))
* **Dashboard:**
  * Ensure gauge value is always a number ([d9fa4736](git@github.com:cdjackson/HABmin2/commit/d9fa47360dea0e7ec43a8f7fe13c49729dc0fd70), closes [#44](git@github.com:cdjackson/HABmin2/issues/44))
  * Fixed updating of text items ([5649b01a](git@github.com:cdjackson/HABmin2/commit/5649b01ad5cfb2bf311ba506c4e38d2c6cb8c1b5))
  * Fix dashboard menu format when no dashboards saved ([4668dcde](git@github.com:cdjackson/HABmin2/commit/4668dcde6923ebf0700a8e3271e66d348771c9f0))
  * Ensure all items can be selected in dashboard ([fcf16e0d](git@github.com:cdjackson/HABmin2/commit/fcf16e0dee118f47101598d27add47c8ff7574c1))
  * Fixed selection of item used in gauge widget #35 ([95324996](git@github.com:cdjackson/HABmin2/commit/9532499642f21c8aab94282fbc48c1f6ffb8e96b))
* **Things:**
  * Disable SAVE button when no thing loaded #21 ([d988bdae](git@github.com:cdjackson/HABmin2/commit/d988bdaea0112c26f3e89ad00814229cd86bc320))
* **UI:**
  * Fix display of selected language with localised characters #36 ([d13bfba5](git@github.com:cdjackson/HABmin2/commit/d13bfba5a309c700e28d07353c7045dca95097f0))
  * Fix bug in localisation handler when loading multiple locales ([d5faf685](git@github.com:cdjackson/HABmin2/commit/d5faf6855ee940cf30107ab8ec9f221efdc76936))


#### Features

* **Chart:**
  * Add notification if no persistence services available ([ff524984](git@github.com:cdjackson/HABmin2/commit/ff524984534c13b391119f51b8a45aecc53ef0b8))
  * Remove persistence service selection if only 1 option available ([b26ed771](git@github.com:cdjackson/HABmin2/commit/b26ed77161601e710edafeceade9b662cd606370))
* **Dashboard:**
  * Highlight SAVE button when dashboard has been changed ([706c8efb](git@github.com:cdjackson/HABmin2/commit/706c8efb27afeb66d3a0e076510950c6129dd0f8))
  * Update gauges dynamically when state changes ([a135cc1e](git@github.com:cdjackson/HABmin2/commit/a135cc1ea12434149e7ddfcc182eb0612f525597))
  * Add group control widget ([34b0e98a](git@github.com:cdjackson/HABmin2/commit/34b0e98aa427e3dd7d3881f12a25d433dcffe985))
  * Display widget configuration dialog after adding new widget ([0565a1c3](git@github.com:cdjackson/HABmin2/commit/0565a1c354e431198826adf8ac3a346d803d663c))
  * Add category to dashboard config to enable menu icon ([61c66fce](git@github.com:cdjackson/HABmin2/commit/61c66fceeebebefafd16d7de82ac2d7fc9d52b09))
  * Add image widget to dashboard ([640ffbab](git@github.com:cdjackson/HABmin2/commit/640ffbab9b664032b2400d8c155594f5c8e83c20))
  * Allow dashboards to be hidden from the menu #34 ([94a5f6a0](git@github.com:cdjackson/HABmin2/commit/94a5f6a093f4664f4e04f8f80dab01bdb7357470))
* **OpenHAB2:**
  * Change chart resource to use OH2 native persistence ([5fc19233](git@github.com:cdjackson/HABmin2/commit/5fc192339eaaffe607e8c362dcde4bee8147c1f8))
* **Things:**
  * Manage save/cancel buttons in Thing configuration ([a3115cd8](git@github.com:cdjackson/HABmin2/commit/a3115cd84ebf18e1735fe89743e07f03179081ae))
  * Updated thing configuration to support new ESH groups ([7fa4a07c](git@github.com:cdjackson/HABmin2/commit/7fa4a07cc7b77483057a4eb4f758fb2b4a89331e))
* **UI:**
  * Inhibit display until load and layout is complete ([5cafa1eb](git@github.com:cdjackson/HABmin2/commit/5cafa1eb2fa903d549ece63943448602c2f32ce8))
  * Add support for new OpenHAB dashboard service ([1571f0b7](git@github.com:cdjackson/HABmin2/commit/1571f0b7e7e1cb3fa28fce3e40f58a0610050972))
  * Add error notification if server can't be reached ([df709730](git@github.com:cdjackson/HABmin2/commit/df709730ecf3eea1d478a84475ee095066f0e53d))


<a name="0.0.13"></a>
### 0.0.13 (2015-05-03)


#### Bug Fixes

* **OpenHAB2:**
  * Updated REST interfaces to new definition ([c865a258](git@github.com:cdjackson/HABmin2/commit/c865a258e6fc9d7f80da9f292d803d862c497211))
* **UI:**
  * Fix error reloading SmartHome data types ([1c8a6bcc](git@github.com:cdjackson/HABmin2/commit/1c8a6bcc787c0c119bfd83bbe7345a2e15368842))


#### Features

* **Things:**
  * Add advanced settings option ([42cf0b8b](git@github.com:cdjackson/HABmin2/commit/42cf0b8bb710245dcea919ee710866ade49bb397))
  * Updated thing list to display thing-type label ([a005d79d](git@github.com:cdjackson/HABmin2/commit/a005d79d8e7888fd8b9164b36e5636ef595f416f))
  * Updated editing/deleting/updating of things/items ([d37185df](git@github.com:cdjackson/HABmin2/commit/d37185df218bcbb64c717943b64a85c9af13f103))
* **UI:**
  * Add help dialog box and ellipsis for long help strings and support HTML ([e21b60ee](git@github.com:cdjackson/HABmin2/commit/e21b60ee7d106daab6bca4d03e8ce3dbd30f4704))


<a name="0.0.12"></a>
### 0.0.12 (2015-04-22)


#### Bug Fixes

* **Things:**
  * Fixed binding filter in thing list ([f9b147f5](git@github.com:cdjackson/HABmin2/commit/f9b147f51cce01cfe9a711f1b4015300d974cd2a))
* **UI:**
  * Add EventSource pollyfill to allow use on IE11 ([30a8f7c6](git@github.com:cdjackson/HABmin2/commit/30a8f7c6ae29fd7b001ad1827c4df5a9bafb682d))


#### Features

* **Items:**
  * Add item edit dialog ([3ab81e95](git@github.com:cdjackson/HABmin2/commit/3ab81e9526937ad838a4efb18b8afb270fccd499))
* **Thing:**
  * Updated thing configuration to support extended status ([466f5fe9](git@github.com:cdjackson/HABmin2/commit/466f5fe96a8054037d89c8ec92c47b98f06667e2))
* **Things:**
  * Add ability to delete a thing ([10d408fc](git@github.com:cdjackson/HABmin2/commit/10d408fc15883178928229d4526171fe116110bd))
  * Update items when channels enabled/disabled ([db262970](git@github.com:cdjackson/HABmin2/commit/db262970d0eefcac1438418335ec74147af44775))
  * Add list of items associated with a channel ([9300568e](git@github.com:cdjackson/HABmin2/commit/9300568e73050f73a4dc589dff9f74718c3b548d))
* **UI:**
  * Add icons to represent item types ([9e63bb48](git@github.com:cdjackson/HABmin2/commit/9e63bb48d3f5ece95de4544c26c6ee2de666e3c2))
  * Add item category icons ([951f9830](git@github.com:cdjackson/HABmin2/commit/951f9830e6e93c21ea52e55c7a8e1a94c6517cef))


<a name="0.0.11"></a>
### 0.0.11 (2015-04-13)


#### Bug Fixes

* **Chart:**
  * Fixed restore of saved chart list in OH2 ([b89de089](git@github.com:cdjackson/HABmin2/commit/b89de0890ed27f3b8ae80a51624f517ec579ba03))


#### Features

* **Bindings:**
  * Initial implementation of binding properties for OH2 ([f1670902](git@github.com:cdjackson/HABmin2/commit/f1670902f9458a60350b3f120131d72c7449f519))
* **Dashboard:**
  * Add theme concept for predefined gauge types ([aae60191](git@github.com:cdjackson/HABmin2/commit/aae60191be0fc62a78907a5dfa88eed084ef5d6e))
* **Items:**
  * Add initial item information display interface ([9470caaa](git@github.com:cdjackson/HABmin2/commit/9470caaabd9358d26f0fbf5fa3c0d01ad9c68fc2))
* **Things:**
  * Added more icons for channel categories ([45f8e6d6](git@github.com:cdjackson/HABmin2/commit/45f8e6d6005ce5f4777363354421a1a718decb19))
* **ZWave:**
  * Added support for OpenHAB1 ZWave binding configuration ([a95cfa00](git@github.com:cdjackson/HABmin2/commit/a95cfa0008a1590604babb876bc99e7aa1ed720e))
* **UI:**
  * Add initial German translation ([c2913bbe](git@github.com:cdjackson/HABmin2/commit/c2913bbec9b296da529e7862b249d2cac77b6415))
  * Add support for international characters in locale names ([1f28b113](git@github.com:cdjackson/HABmin2/commit/1f28b1130b1ed1317000bc65750490e4b70b2460))
  * Add country flags in language selection list ([bf4d61c4](git@github.com:cdjackson/HABmin2/commit/bf4d61c4bc354251862b6603992d2bf6cbb3253b))
  * Incorporate native Bootstrap select box ([5b4c1250](git@github.com:cdjackson/HABmin2/commit/5b4c12506749d50304b2399d61f4a7e4b3050801))


<a name="0.0.10"></a>
### 0.0.10 (2015-04-06)


#### Bug Fixes

* **Chart:**
  * Fix bug filtering item names in chart item list ([f312cb38](git@github.com:cdjackson/HABmin2/commit/f312cb38cae87691aa21d33f5583a7748c74d1c6))
  * Fixed positioning of chart tools dropdown menu ([4f98b40e](git@github.com:cdjackson/HABmin2/commit/4f98b40eb7605adb4b11b2d1e8e1a0f6d09cddf7))
  * Remove loading spinner if loading chart fails ([7fd53638](git@github.com:cdjackson/HABmin2/commit/7fd536387618bb1f97b83f7967cbd0d7011dd735))
  * Fix exception thrown if no persistence services available ([ec844ed6](git@github.com:cdjackson/HABmin2/commit/ec844ed66e17bcd2bb6b404141fe7d442b90eb87))
* **Dashboard:**
  * Fixed editing of gauge widget parameters ([fe5dc43a](git@github.com:cdjackson/HABmin2/commit/fe5dc43a6d04e720e6281950df16c4bc210f317e))
  * Fixed dashboard listing error ([211caaff](git@github.com:cdjackson/HABmin2/commit/211caaffedb35bc61733dad03b23af68d723b3ac))
  * Update text formatting of gauge ([71f1cba5](git@github.com:cdjackson/HABmin2/commit/71f1cba514928ccb1712c684e165fddaafa9e3da))
  * Fix default height of chart in dashboard ([c169e9ab](git@github.com:cdjackson/HABmin2/commit/c169e9ab81ef0e1f3583f3a48abdb96ab82d9fca))
* **Mobile:**
  * Update server icon in login screen ([02333f62](git@github.com:cdjackson/HABmin2/commit/02333f62ff3749de31f2fd794e8e7e91b27a73b6))
* **Sitemap:**
  * Fix asynchronous updating of sitemap data ([fb8578c1](git@github.com:cdjackson/HABmin2/commit/fb8578c149524b7b452d93467f5f61c577de00bb))
* **UI:**
  * Update icons in binding menu ([b672df21](git@github.com:cdjackson/HABmin2/commit/b672df219566206d337eca1386a0aace18f8ec67))
  * Fix coding of UTF-8 language definitions ([1973c6f0](git@github.com:cdjackson/HABmin2/commit/1973c6f05403427a2e1b8cde9be097da6ec22e94))
  * Improved checking of user credentials in login screen ([9f8055eb](git@github.com:cdjackson/HABmin2/commit/9f8055eb28bf5a2faf0b738f6eb80bd51cdbcd0c))
  * Fix error setting theme if restored theme is invalid ([bbce5a7e](git@github.com:cdjackson/HABmin2/commit/bbce5a7ec5c6ab066c61ee58579ecc8e99cab936))
  * Fix resize handles in dashboard panels ([72a2c44b](git@github.com:cdjackson/HABmin2/commit/72a2c44b826b9b9e62289a591b1c4ae57c4d8596))
  * Fix sitemap setpoint widget buttons ([81133bf4](git@github.com:cdjackson/HABmin2/commit/81133bf43c1a2219f204489027cd1517ea40f438))
* **ZWave:**
  * Fixed error listing nodes when only a single node exists ([49a8572f](git@github.com:cdjackson/HABmin2/commit/49a8572f9a61d53913761e031499ea347ae1391f))


#### Features

* **Chart:**
  * Add option to hide legend on chart ([31212479](git@github.com:cdjackson/HABmin2/commit/31212479b46d8f22852a7524e3e499ca7e503f20))
  * If no charts are defined then default to the items view ([16369a60](git@github.com:cdjackson/HABmin2/commit/16369a60bb5d36dbb6999cf18c9a5a5ded0b3462))
* **Dashboard:**
  * Internationalise dashboard ([3fb644b4](git@github.com:cdjackson/HABmin2/commit/3fb644b4d88fbf9e25c937008a12be404b25f01c))
* **OpenHAB2:**
  * Add functions to manually add a thing ([deed8f72](git@github.com:cdjackson/HABmin2/commit/deed8f723bada578c064d4a12e64e6d0371fa7d8))
* **UI:**
  * Add icons in confirmation dialog boxes ([443376cb](git@github.com:cdjackson/HABmin2/commit/443376cb4ad6795d530f4a28e3e98fa22fbdd33a))
* **ZWave:**
  * Add command to hard reset zwave network ([871ebb88](git@github.com:cdjackson/HABmin2/commit/871ebb88268304bb1c9ab6b31db159d4e9c95884))


<a name="0.0.9"></a>
### 0.0.9 (2015-03-20)


#### Bug Fixes

* **OpenHAB1:**
  * Fixed error loading binding information ([eeebdd88](git@github.com:cdjackson/HABmin2/commit/eeebdd88d9a8959254310bd0d8da699ce8efcd31))
* **Rules:**
  * Fix error loading rules if service not supported ([e2e7db9f](git@github.com:cdjackson/HABmin2/commit/e2e7db9fcdca6578259642a914836558ab0ffbc0))
  * Fix rendering of rule source when changing tab ([8936684b](git@github.com:cdjackson/HABmin2/commit/8936684b616c4eac4fb658bbbd6c6bf642db63f7))
* **Sitemap:**
  * Fixed rendering of groups with only one widget ([69394fe7](git@github.com:cdjackson/HABmin2/commit/69394fe79be5f5f8739ca8fb26396ec139499111))


#### Features

* **Chart:**
  * Add localisation for chart times ([56c882a4](git@github.com:cdjackson/HABmin2/commit/56c882a4f110d489f847d39cee4e348112da0f36))
  * Add support for bar graph ([f516340b](git@github.com:cdjackson/HABmin2/commit/f516340bc6d12e6bd771dd53e5bc7df807ec4b4e))
  * Add chart name to notification messages ([b391dcd2](git@github.com:cdjackson/HABmin2/commit/b391dcd256b143cf9e9b90d9744cc43ec4ed3f6f))
* **OpenHAB2:**
  * Handle enable/disable of channels ([dfff0c83](git@github.com:cdjackson/HABmin2/commit/dfff0c83b16c5ef95ef137f9c4a9f463ffe68961))
  * Add support for editing things ([2fcef047](git@github.com:cdjackson/HABmin2/commit/2fcef0478df05e369ef751bcc59c25157d9a6b5e))
  * Added discovery inbox handler ([7eb81163](git@github.com:cdjackson/HABmin2/commit/7eb811638c7184636fc74bf577a3ed753330addd))
  * Add binding and discovery service detection ([4a7655f0](git@github.com:cdjackson/HABmin2/commit/4a7655f0bda4a88a82bc04842a824d61f5a54f9c))
* **UI:**
  * Update to latest PAPER theme ([3a4a1f94](git@github.com:cdjackson/HABmin2/commit/3a4a1f94c140b5848149281990e38e6436fcf66e))
  * Change time-ago to use moment.js. Support for French localisation ([c715ad96](git@github.com:cdjackson/HABmin2/commit/c715ad9662bc582f11ffa6b184774a7f888469c9))
  * Add browser icon ([277d5c67](git@github.com:cdjackson/HABmin2/commit/277d5c6727ace100cacc71b8ae81dba921caed40))
  * Added French language ([c836ef2](git@github.com:cdjackson/HABmin2/commit/c836ef230c2f623c3397208fce3d45c98337e6f7))
  * Added German language option in user settings ([5f47dae9](git@github.com:cdjackson/HABmin2/commit/5f47dae93f92acd82ae8023bf70545a262189d11))
  * Added hierarchical incremental localisation ([c5d2c26a](git@github.com:cdjackson/HABmin2/commit/c5d2c26ae5e5029cba826e1464154431b4dba005))
  * Add support for user language selection ([1ec2a8c4](git@github.com:cdjackson/HABmin2/commit/1ec2a8c40e2ca0779f8098b491a2ef1c7b69e75c))


<a name="0.0.8"></a>
### 0.0.8 (2015-03-08)


#### Bug Fixes

* **UI:**
  * Fixed display of things if no things are actually listed ([97273001](git@github.com:cdjackson/HABmin2/commit/97273001c254f3fa7c996406a070b5d55695fd64))
  * Improved handling of inbox popup ([cb670829](git@github.com:cdjackson/HABmin2/commit/cb670829e7020949dc5218d3d7be0abee9b90e73))
  * Fix error messages when saving chart ([8c4accca](git@github.com:cdjackson/HABmin2/commit/8c4accca07cac6219baacc442fb03a34ec75e47c))
  * Fixed updating rule list following save ([40302911](git@github.com:cdjackson/HABmin2/commit/403029110e3944763170ba918731e0672ad982d6))
  * Fixed inbox popup template to color code lines ([f4fcf4c7](git@github.com:cdjackson/HABmin2/commit/f4fcf4c744d25a5e5c8fe28b376219e94873ef39))
  * Fix default username entry when not previously set ([bd90b906](git@github.com:cdjackson/HABmin2/commit/bd90b9064c410edeb0c4b98e6632ef8a1ba4ca24))
  * Fixed error handling if no rules are returned ([109f1c52](git@github.com:cdjackson/HABmin2/commit/109f1c5236bc6f051f9765981247ee289eba5d82))


#### Features

* **Rules:**
  * Add support for editing rule files in openHAB2 ([bd5d8736](git@github.com:cdjackson/HABmin2/commit/bd5d87360b0ed2e93e9a3e418d57647997ee6931))
* **UI:**
  * Login box is now displayed if no login has been completed ([bbafd881](git@github.com:cdjackson/HABmin2/commit/bbafd8819debe6fee8e3c133c9f3bbf169152d7a))
  * Fix error deleting chart in OH2 ([9022ae15](git@github.com:cdjackson/HABmin2/commit/9022ae1528ea8838e4d63f7375bcb00327bf9a5c))
  * Handle chart items for both OH1 and OH2 interfaces ([82921d0f](git@github.com:cdjackson/HABmin2/commit/82921d0ff9df57efa91f4a1d414cbed1eebef13a))
  * Handle differences between OH1 and OH2 sitemaps ([444d0ac4](git@github.com:cdjackson/HABmin2/commit/444d0ac42bdbd85d0ef3934b0b0f14980cc5dd79))
  * Add support for openhab inbox for new device notifications ([c8a91430](git@github.com:cdjackson/HABmin2/commit/c8a91430049f7d80bc0c6cb04d76478f23c1c5d4))
  * Display rule type icon in rule list ([2dd31189](git@github.com:cdjackson/HABmin2/commit/2dd3118953de1089be63f6f0f5b48a186d29b584))
* **ZWave:**
  * Log Reader - display security command class ([de5b9f0f](git@github.com:cdjackson/HABmin2/commit/de5b9f0f29dabcf67496ad7ac6925d6ecbcbfe46))


<a name="0.0.7"></a>
### 0.0.7 (2015-02-22)


#### Bug Fixes

* **UI:**
  * Fixed selection of persistence service ([03fa03fb](git@github.com:cdjackson/HABmin2/commit/03fa03fb815ffae1ca67d389b1eb661e8e5268e4))
  * Fix error saving password to local cache ([c10ce94c](git@github.com:cdjackson/HABmin2/commit/c10ce94cde7b99e4f1adb7a0d22353be88b128b9))
* **ZWave:**
  * Log Reader - fix error formatting command class if command id unknown ([8f4e760e](git@github.com:cdjackson/HABmin2/commit/8f4e760ef57c0b2f0f3fc67e01837d873f5c0fdc))
  * Log Reader - avoid duplicate item definitions ([303312d5](git@github.com:cdjackson/HABmin2/commit/303312d5c08106c07a361da1192d93d4318dc29f))
  * Log Reader - fixed handling of sensor alarm types ([c4193f6a](git@github.com:cdjackson/HABmin2/commit/c4193f6a24773a6d7c5c5f796a495579fecdfcdd))


#### Features

* **ZWave:**
  * Log Reader - added general packet statistics information ([9f92a281](git@github.com:cdjackson/HABmin2/commit/9f92a281604eb6515d84d5e80bec1e1027674600))
  * Log Reader - add processing of CONFIGURATION class ([5c75e2de](git@github.com:cdjackson/HABmin2/commit/5c75e2dea0a2c2b0d4bc602fbf427bdff1d6ceea))
  * Log Reader - process sensor packets ([0a072b50](git@github.com:cdjackson/HABmin2/commit/0a072b5078a8a2aa9e165747bbd3a594d2235678))
  * Log Reader - show commands in log ([ded27845](git@github.com:cdjackson/HABmin2/commit/ded27845faf6e774ccd10690ecf440338bc23aa6))
  * Log Reader - default to showing binding info ([6e7c5b47](git@github.com:cdjackson/HABmin2/commit/6e7c5b47d63da8db682c0a6c0d16e95593c3e959))
  * Log Reader - add processing of endpoints and endpoint classes ([383e7aae](git@github.com:cdjackson/HABmin2/commit/383e7aaeceb03e66aaaa1f6a4f920dcc00754724))
  * Log Reader - decode and display control classes ([16ffb3b5](git@github.com:cdjackson/HABmin2/commit/16ffb3b5a49e6832980458dede209863decb6638))
  * Display information on device class ([5ae8be74](git@github.com:cdjackson/HABmin2/commit/5ae8be7476ee75b9c22f505805a5178d336c2473))
  * Log Reader - Process the association group report ([82a767df](git@github.com:cdjackson/HABmin2/commit/82a767dfe968d588a2a0c0111945ecc8df880b1b))


<a name="0.0.6"></a>
### 0.0.6 (2015-02-01)


#### Bug Fixes

* **UI:**
  * Fix notification template to remove invalid button background ([3828d99d](git@github.com:cdjackson/HABmin2/commit/3828d99d18b33a1d6a7c7bf8872a168a50ab3c3e))
* **ZWave:**
  * Don't reload parameters if reselecting the current device ([fd6f99a0](git@github.com:cdjackson/HABmin2/commit/fd6f99a0ccf2cbdf02d69442bfba18001eaae6c9))
  * Poll node information after setting Name/Location to update 'pending' flag ([0cb84b4f](git@github.com:cdjackson/HABmin2/commit/0cb84b4fc8a94fe31adccdd30e60f095e8534de8))
  * Log Reader - fix processing of failed node message ([4eb68c75](git@github.com:cdjackson/HABmin2/commit/4eb68c75f1f522e8cafb12124274e5d05ee31a6f))
  * Log Reader - check controller is known before checking wakeup node ([c993c5e7](git@github.com:cdjackson/HABmin2/commit/c993c5e7fc452806cbb72750b6d3b88eebcf7cdd))
  * Log Reader - fix bug processing unknown command classes ([e5f5729a](git@github.com:cdjackson/HABmin2/commit/e5f5729ae405714f31feeb82563bee6711fbba17))
  * Log Reader - fix node number display ([f5d418f0](git@github.com:cdjackson/HABmin2/commit/f5d418f010b2f34c6333cc6d370579dd5457f5a4))
  * Fix incorrect reporting of unresponsive node ([597ded6c](git@github.com:cdjackson/HABmin2/commit/597ded6c060e26bc098928d99894dbbbd576510f))


#### Features

* **ZWave:**
  * Add help button to configuration items ([e7e0878b](git@github.com:cdjackson/HABmin2/commit/e7e0878b38475e9dfd6ed04a202eb72247ac7d92))
  * Highlight currently select panel in node editor ([0d54267d](git@github.com:cdjackson/HABmin2/commit/0d54267da45cf0dbb7d61a21986c20baac48a639))
  * Log Reader - keep track of node command classes ([5f2284df](git@github.com:cdjackson/HABmin2/commit/5f2284df23744f81654c6be8a46b945d1fc38373))
  * Log Reader - add processing for SENSOR_ALARM class ([10126fe9](git@github.com:cdjackson/HABmin2/commit/10126fe9116530414f97bf82898bd3fc5b61fc0b))
  * Consolidate log messages where command class function is known ([413b1515](git@github.com:cdjackson/HABmin2/commit/413b1515c32cf36dcefb180fc8fbfb3a355f8688))
  * Grey backgrounds of non-listening nodes in network diagram ([5a69df71](git@github.com:cdjackson/HABmin2/commit/5a69df71bca67c5c105e9b96d1a8b01e14a0d3b0))
  * Change HEAL icon state colours so SUCCESS = GREEN ([7a09f4bc](git@github.com:cdjackson/HABmin2/commit/7a09f4bcac122aeaa16b338c40a146e4d7869809))
  * Log Reader - analyse neighbours to check network quality ([ac5b131e](git@github.com:cdjackson/HABmin2/commit/ac5b131ef81c0a4a34aa86d4775b6ba9e1f03cda))
  * Log Reader - add messages sent/retry statistics ([cb3e33ea](git@github.com:cdjackson/HABmin2/commit/cb3e33eaea0e1bfee346af86c2ab4abd5597d8a1))
  * Refactor log reader as a service so log data remains persistent ([1f867593](git@github.com:cdjackson/HABmin2/commit/1f867593b0327b9f9aa4609cf369d307a851d2c1))
  * Log Reader - count protocol errors with controller ([2af0d027](git@github.com:cdjackson/HABmin2/commit/2af0d027ef8404797e0ba599ad1323faf523dab0))
  * Log Reader - display association group in requests/responses ([910582d5](git@github.com:cdjackson/HABmin2/commit/910582d590c6a73726739e8d0343ac5c1ddc8718))
  * Log Reader - added warnings for slow response and timeouts ([4ea90439](git@github.com:cdjackson/HABmin2/commit/4ea90439ebd2f8dafbebc47c8ea5309f777ce315))
  * Log Reader - added node warnings and errors ([0c20549a](git@github.com:cdjackson/HABmin2/commit/0c20549a4c081b049d453746dd1c1353ab8f5cc0))
  * Order devices by node number in device list ([e53f7bc8](git@github.com:cdjackson/HABmin2/commit/e53f7bc8420d3da2c54499d0c4a93bf1b2c02ee8))
  * Log Reader - Count number of times the device wakes up ([bdbc50ec](git@github.com:cdjackson/HABmin2/commit/bdbc50ecdc33a7400e92f03d5312f7b174a3c64f))
  * Log Reader - annotate multicast and broadcast messages ([65acbbf0](git@github.com:cdjackson/HABmin2/commit/65acbbf0e555422a26943ea4fc7810ec4a73073c))
  * Log Reader - add heal state information ([11dbe97a](git@github.com:cdjackson/HABmin2/commit/11dbe97a2038cb83e85884ae90845dfa58d00921))

<a name="0.0.5"></a>
### 0.0.5 (2015-01-18)


#### Bug Fixes

* **Mobile:**
  * Fix routing of persistence services to use server setting ([192368d5](git@github.com:cdjackson/HABmin2/commit/192368d5e32d9d520466f90061a253cf156698d2))
  * Fix error saving and using server address on Android ([4f402e12](git@github.com:cdjackson/HABmin2/commit/4f402e126a63a3384022e30f2c6cfee7cde288a5))
* **UI:**
  * Fix error loading models with a single return #1 ([ce9677d2](git@github.com:cdjackson/HABmin2/commit/ce9677d2d8d4aad6a13b7eb707d52ba96f654034))
  * Fixed error displaying sitemaps when only 1 sitemap defined ([3b79ed69](git@github.com:cdjackson/HABmin2/commit/3b79ed69599ab04805cfa1b73b1d2fcbe864fbfd))
  * Don't set Auth headers if no password/user specified ([867a8f60](git@github.com:cdjackson/HABmin2/commit/867a8f602170e8577341d0977782356672e0d674))
  * Fix error in rule template ([207985f0](git@github.com:cdjackson/HABmin2/commit/207985f0c4657ebd73578d38268986b9f484af91))
  * Fix positioning of title bar on small screens ([93186a52](git@github.com:cdjackson/HABmin2/commit/93186a52c0f3eb2bf8ab2980656bef24e6e5dbbe))
  * Fix initialisation of collapsed panel configuration ([373a4c47](git@github.com:cdjackson/HABmin2/commit/373a4c47ffdd96fe9eb7dd6d15061bc67fdcd3f5))
  * Fix error handling panels when changing from single to multi panel view ([06e76dcb](git@github.com:cdjackson/HABmin2/commit/06e76dcbdc229f9e247e1b34d4da3f52af84fd66))
  * Update blockly flyout style ([bbe889a2](git@github.com:cdjackson/HABmin2/commit/bbe889a2231fc4076285ff5f78426fc9e6362e73))
  * Remove loading spinner when updating data following a change of zoom level ([5574fdde](git@github.com:cdjackson/HABmin2/commit/5574fdde970c3192938cf0600600ae1fe66b79b4))
  * Update resize directive to not resize when element is hidden ([d63930c6](git@github.com:cdjackson/HABmin2/commit/d63930c68049dcce4a2def48039bde7ca07a3d61))
  * Send authenticated event if using cached data ([fe8db276](git@github.com:cdjackson/HABmin2/commit/fe8db27698f74d9c07b3714f5d62c80962e86c11))
  * Fix error getting config data from server if logging in from cached password ([e31d5aa8](git@github.com:cdjackson/HABmin2/commit/e31d5aa856ae891c4500df20a336f09b24bee378))
  * Improve styling of sitemaps to make better use of space ([010aa210](git@github.com:cdjackson/HABmin2/commit/010aa210c994b5ac996b012526df8b05146d68e7))
  * Fix navbar formatting when collapsing on small screens ([29c3dcdf](git@github.com:cdjackson/HABmin2/commit/29c3dcdfa01967c51b5ae370b758a044d9f65d18))
  * Fix sitemap title bar style ([a6a39378](git@github.com:cdjackson/HABmin2/commit/a6a393787b8b3a0fddf4d2cecaaa16ece52b9ff6))
  * Fix error with login and authorisation window ([9a0be091](git@github.com:cdjackson/HABmin2/commit/9a0be09157f7f7a5133e3615fed49d7260fc8753))
  * Update chart series icon styles ([64485dc5](git@github.com:cdjackson/HABmin2/commit/64485dc535987d0918ea34b0fcc11ee597eef6fb))
* **ZWave:**
  * Log Reader - fix SENSOR_BINARY commands ([dfe50885](git@github.com:cdjackson/HABmin2/commit/dfe5088542d6f5c410aeaa2213b832e3d946b2dd))
  * Log Reader - trigger screen re-layout when changing views ([0afe39e4](git@github.com:cdjackson/HABmin2/commit/0afe39e45f13b88a923aa7729f05df22f8579af7))
  * Log reader made tolerant of wider range of log formats ([f570d19e](git@github.com:cdjackson/HABmin2/commit/f570d19ea0bf442d1cdcc6f5f4b689df251f8ff6))
  * Fix rendering of network diagram ([2c66ad52](git@github.com:cdjackson/HABmin2/commit/2c66ad52cddfd04f1fce8a68c05b8a95b793e4c9))
  * Fix device status if retries is greater than 100% ([5a48ff92](git@github.com:cdjackson/HABmin2/commit/5a48ff92333c21f8d5af3e18d3f82374609cab89))
  * Fix battery icon colour when battery level <40% ([1aa5fdd9](git@github.com:cdjackson/HABmin2/commit/1aa5fdd9976188607813c20dd3917453fd2b0ab7))
  * Fix network diagram resizing ([b875d206](git@github.com:cdjackson/HABmin2/commit/b875d206c744a512322e6d47a33b7517fb60d50f))


#### Features

* **Mobile:**
  * Present login screen if no server set when app starts ([83e3551b](git@github.com:cdjackson/HABmin2/commit/83e3551b61075465e9504640dd1dc7b0cc31b048))
  * Reduce gutter on narrow width screens to provide more real-estate ([14c001a6](git@github.com:cdjackson/HABmin2/commit/14c001a69d58decb92d448c5e8bebe3cc9316d2c))
  * Persist server address to local storage ([8a619066](git@github.com:cdjackson/HABmin2/commit/8a61906618494091e1d01accf1a04a140b4b2eaf))
  *  Initial addition of native mobile versions of HABmin ([d9a403ac](git@github.com:cdjackson/HABmin2/commit/d9a403acdc2b2ac16107e1b0aa3af60b6f3b8269))
* **UI:**
  * Log Reader - Add node information display ([bfc89195](git@github.com:cdjackson/HABmin2/commit/bfc8919564c0a525ce560df782599eaf94a6bfad))
  * Add tools menu & ZWave Log Reader menu ([622cce45](git@github.com:cdjackson/HABmin2/commit/622cce45292dee874c51e7d98a74fee05e8f5b7b))
  * Add SETPOINT widget to sitemap ([befb708f](git@github.com:cdjackson/HABmin2/commit/befb708fb30ebda6f59ff9362923265fb540b83c))
  * Improve sitemap layout ([d5cb2825](git@github.com:cdjackson/HABmin2/commit/d5cb2825bf292551a78648688cb6f8c4656bd3dc))
  * Add swipe functionality to change panes easier on mobile device ([ab27c4b0](git@github.com:cdjackson/HABmin2/commit/ab27c4b07ec43454ec2a15961cce8295e4de2fcb))
  * Make rule and schedule templates multi panel for more responsive on phones ([ca49372c](git@github.com:cdjackson/HABmin2/commit/ca49372cf05c6a7c57bab698b8463c0d297eba98))
  * Hide multiple panel switch button when Sitemap displayed ([c0945ec5](git@github.com:cdjackson/HABmin2/commit/c0945ec566c678ea3df7988e102f266dac0cf12b))
  * Add responsive sidebar when in small window (mobile) ([ceae2583](git@github.com:cdjackson/HABmin2/commit/ceae2583fdba9295dd53b3892312d583ead3f0af))
  * Add chart loading spinner to bottom left of chart area ([c89d825a](git@github.com:cdjackson/HABmin2/commit/c89d825a496bfa1db06509d73909c8af34a130cb))
  * Remove some text to improve layout on small screens ([1f247234](git@github.com:cdjackson/HABmin2/commit/1f2472344505c01c433b3e15f46c79c6c473662d))
  * Remove graph button text on medium screens ([8f1aa8e8](git@github.com:cdjackson/HABmin2/commit/8f1aa8e89e3a8433a6f28d26fc99568177f5a181))
  * Remove graph button text on small screens ([fe65e8a9](git@github.com:cdjackson/HABmin2/commit/fe65e8a9dda7fed97d5401fe3af6d1031347b9db))
  * Add shadow to sitemap frame headings ([190425a6](git@github.com:cdjackson/HABmin2/commit/190425a63ea4257073f1e9f37bc1fcd320c3b8fc))
  * Remove icons from growl notifications ([7ce7615a](git@github.com:cdjackson/HABmin2/commit/7ce7615afbfa8b3b5762cfbd86fdaffffbda2c6b))
  * Improve authentication and reload of data when server or user changes ([80f057b7](git@github.com:cdjackson/HABmin2/commit/80f057b73c94812c4ce1251a0e4148638d711c71))
  * Make sitemap titlebar full width ([fe3256dc](git@github.com:cdjackson/HABmin2/commit/fe3256dcb677176bcb6a16801caa5fedb91eedd6))
  * Close navbar when selection made on small screens ([829f0538](git@github.com:cdjackson/HABmin2/commit/829f0538d78b116bf62e9a6e49e7b989cbc7c1d0))
  * Hide some navbar text on smaller screens ([f7e3b3ae](git@github.com:cdjackson/HABmin2/commit/f7e3b3ae29de68d6d4a175f936795935906bda2a))
  * Improve login form and add internationalisation ([b074f31e](git@github.com:cdjackson/HABmin2/commit/b074f31ed9fecdbc238ed299733c48fab0e79849))
  * Improve styling of sitemap widgets ([de1896cb](git@github.com:cdjackson/HABmin2/commit/de1896cb4b86946c5d4a80d75a07884526718332))
  * Add weather-icons ([ae1ce462](git@github.com:cdjackson/HABmin2/commit/ae1ce462eb54e0a8690ae761c709eebfe2079a41))
  * Persist user theme choice to local storage and reset on startup ([2ce3952b](git@github.com:cdjackson/HABmin2/commit/2ce3952bbe5da9cbee822687937d24c6ae782b82))
  * Add theme switching ([eebb64d3](git@github.com:cdjackson/HABmin2/commit/eebb64d371f7a36a5a45ae3820c83fff46aedf65))
* **ZWave:**
  * Log Reader - add heal state information ([11dbe97a](git@github.com:cdjackson/HABmin2/commit/11dbe97a2038cb83e85884ae90845dfa58d00921))
  * Log Reader - sorted nodes in filter list ([ce2b3794](git@github.com:cdjackson/HABmin2/commit/ce2b3794b2e3f82f2a6d76ba5c961926b344e564))
  * Log Reader - Process multi_instance report ([68c33e06](git@github.com:cdjackson/HABmin2/commit/68c33e06036806cdec425b44575c1fe140d5eb21))
  * Log Reader - add SUC-ID display handler ([379e9786](git@github.com:cdjackson/HABmin2/commit/379e9786410665c3d1f329857b463692a3cc905f))
  * Log Reader - add processing of ApplicationUpdate message ([71f7fcf1](git@github.com:cdjackson/HABmin2/commit/71f7fcf196185ee19d9c039accdbcdd9e455d084))
  * Log Reader - add BASIC command class names ([b22b3b97](git@github.com:cdjackson/HABmin2/commit/b22b3b973b4d10a5d45298ad5f269f0b59de8f4e))
  * Log Reader - add processing of neighbour and routing frames ([34672151](git@github.com:cdjackson/HABmin2/commit/34672151799b97fec8f0a331638e839a7081d7d8))
  * Log Reader - process node discovery message ([e98517f9](git@github.com:cdjackson/HABmin2/commit/e98517f956c18825fdfe60e9ea3892f0dd085bb6))
  * Log Reader - process system and node identify frames ([204cc084](git@github.com:cdjackson/HABmin2/commit/204cc08462eb92766f5228526b6c79cae077616a))
  * Added MANUFACTURER and VERSION logging classes ([fbcbe9f6](git@github.com:cdjackson/HABmin2/commit/fbcbe9f6495c5b67af9bdfed78dd4529a98f3776))
  * Add error/warning annotations to log entries ([a8bac573](git@github.com:cdjackson/HABmin2/commit/a8bac573e988bb4f4c7da053244059a9e7773819))
  * Log viewer added annotations for completed transaction ([036686c4](git@github.com:cdjackson/HABmin2/commit/036686c44f66887d672b9654ab26170428769d5b))
  * Make log viewer parse files without date ([6aed0864](git@github.com:cdjackson/HABmin2/commit/6aed086400b8326b4999fc9f170a071178f21071))
  * Add processing of controller commands in Log Reader ([5d8a8e3a](git@github.com:cdjackson/HABmin2/commit/5d8a8e3ae11faaaa9e8bca23c5f6187671b8a045))
  * Add popover to provide specific information on log entry ([0064284c](git@github.com:cdjackson/HABmin2/commit/0064284c56a0648761d83296c30b3078fcb10949))
  * Add zwave log viewer ([7ad0094f](git@github.com:cdjackson/HABmin2/commit/7ad0094f1c74429c332a8488cdf8a29bcb3fe765))
  * Add icon and processing for SECURE_KEYPAD_DOOR_LOCK class ([aae19184](git@github.com:cdjackson/HABmin2/commit/aae191849d95b528d67563b9bcba2d35f8d20490))


<a name="0.0.4"></a>
### 0.0.4 (2015-01-09)


#### Bug Fixes

* **UI:**
  * Don't set Auth headers if no password/user specified ([867a8f60](git@github.com:cdjackson/HABmin2/commit/867a8f602170e8577341d0977782356672e0d674))
  * Fix error in rule template ([207985f0](git@github.com:cdjackson/HABmin2/commit/207985f0c4657ebd73578d38268986b9f484af91))
  * Fix positioning of title bar on small screens ([93186a52](git@github.com:cdjackson/HABmin2/commit/93186a52c0f3eb2bf8ab2980656bef24e6e5dbbe))
  * Fix initialisation of collapsed panel configuration ([373a4c47](git@github.com:cdjackson/HABmin2/commit/373a4c47ffdd96fe9eb7dd6d15061bc67fdcd3f5))
  * Fix error handling panels when changing from single to multi panel view ([06e76dcb](git@github.com:cdjackson/HABmin2/commit/06e76dcbdc229f9e247e1b34d4da3f52af84fd66))
* **ZWave:**
  * Fix rendering of network diagram ([2c66ad52](git@github.com:cdjackson/HABmin2/commit/2c66ad52cddfd04f1fce8a68c05b8a95b793e4c9))


#### Features

* **UI:**
  * Add tools menu & ZWave Log Reader menu ([622cce45](git@github.com:cdjackson/HABmin2/commit/622cce45292dee874c51e7d98a74fee05e8f5b7b))
  * Add SETPOINT widget to sitemap ([befb708f](git@github.com:cdjackson/HABmin2/commit/befb708fb30ebda6f59ff9362923265fb540b83c))
  * Improve sitemap layout ([d5cb2825](git@github.com:cdjackson/HABmin2/commit/d5cb2825bf292551a78648688cb6f8c4656bd3dc))
* **ZWave:**
  * Add popover to provide specific information on log entry ([0064284c](git@github.com:cdjackson/HABmin2/commit/0064284c56a0648761d83296c30b3078fcb10949))
  * Add zwave log viewer ([7ad0094f](git@github.com:cdjackson/HABmin2/commit/7ad0094f1c74429c332a8488cdf8a29bcb3fe765))


<a name="0.0.3"></a>
### 0.0.3 (2015-01-02)


#### Bug Fixes

* **Mobile:**
  * Fix routing of persistence services to use server setting ([192368d5](git@github.com:cdjackson/HABmin2/commit/192368d5e32d9d520466f90061a253cf156698d2))
  * Fix error saving and using server address on Android ([4f402e12](git@github.com:cdjackson/HABmin2/commit/4f402e126a63a3384022e30f2c6cfee7cde288a5))
* **UI:**
  * Update blockly flyout style ([bbe889a2](git@github.com:cdjackson/HABmin2/commit/bbe889a2231fc4076285ff5f78426fc9e6362e73))
  * Remove loading spinner when updating data following a change of zoom level ([5574fdde](git@github.com:cdjackson/HABmin2/commit/5574fdde970c3192938cf0600600ae1fe66b79b4))
  * Update resize directive to not resize when element is hidden ([d63930c6](git@github.com:cdjackson/HABmin2/commit/d63930c68049dcce4a2def48039bde7ca07a3d61))
  * Send authenticated event if using cached data ([fe8db276](git@github.com:cdjackson/HABmin2/commit/fe8db27698f74d9c07b3714f5d62c80962e86c11))
  * Fix error getting config data from server if logging in from cached password ([e31d5aa8](git@github.com:cdjackson/HABmin2/commit/e31d5aa856ae891c4500df20a336f09b24bee378))
  * Improve styling of sitemaps to make better use of space ([010aa210](git@github.com:cdjackson/HABmin2/commit/010aa210c994b5ac996b012526df8b05146d68e7))
  * Fix navbar formatting when collapsing on small screens ([29c3dcdf](git@github.com:cdjackson/HABmin2/commit/29c3dcdfa01967c51b5ae370b758a044d9f65d18))
  * Fix sitemap title bar style ([a6a39378](git@github.com:cdjackson/HABmin2/commit/a6a393787b8b3a0fddf4d2cecaaa16ece52b9ff6))
  * Fix error with login and authorisation window ([9a0be091](git@github.com:cdjackson/HABmin2/commit/9a0be09157f7f7a5133e3615fed49d7260fc8753))
  * Update chart series icon styles ([64485dc5](git@github.com:cdjackson/HABmin2/commit/64485dc535987d0918ea34b0fcc11ee597eef6fb))
* **ZWave:**
  * Fix device status if retries is greater than 100% ([5a48ff92](git@github.com:cdjackson/HABmin2/commit/5a48ff92333c21f8d5af3e18d3f82374609cab89))
  * Fix battery icon colour when battery level <40% ([1aa5fdd9](git@github.com:cdjackson/HABmin2/commit/1aa5fdd9976188607813c20dd3917453fd2b0ab7))
  * Fix network diagram resizing ([b875d206](git@github.com:cdjackson/HABmin2/commit/b875d206c744a512322e6d47a33b7517fb60d50f))


#### Features

* **Mobile:**
  * Present login screen if no server set when app starts ([83e3551b](git@github.com:cdjackson/HABmin2/commit/83e3551b61075465e9504640dd1dc7b0cc31b048))
  * Reduce gutter on narrow width screens to provide more real-estate ([14c001a6](git@github.com:cdjackson/HABmin2/commit/14c001a69d58decb92d448c5e8bebe3cc9316d2c))
  * Persist server address to local storage ([8a619066](git@github.com:cdjackson/HABmin2/commit/8a61906618494091e1d01accf1a04a140b4b2eaf))
  *  Initial addition of native mobile versions of HABmin ([d9a403ac](git@github.com:cdjackson/HABmin2/commit/d9a403acdc2b2ac16107e1b0aa3af60b6f3b8269))
* **UI:**
  * Add swipe functionality to change panes easier on mobile device ([ab27c4b0](git@github.com:cdjackson/HABmin2/commit/ab27c4b07ec43454ec2a15961cce8295e4de2fcb))
  * Make rule and schedule templates multi panel for more responsive on phones ([ca49372c](git@github.com:cdjackson/HABmin2/commit/ca49372cf05c6a7c57bab698b8463c0d297eba98))
  * Hide multiple panel switch button when Sitemap displayed ([c0945ec5](git@github.com:cdjackson/HABmin2/commit/c0945ec566c678ea3df7988e102f266dac0cf12b))
  * Add responsive sidebar when in small window (mobile) ([ceae2583](git@github.com:cdjackson/HABmin2/commit/ceae2583fdba9295dd53b3892312d583ead3f0af))
  * Add chart loading spinner to bottom left of chart area ([c89d825a](git@github.com:cdjackson/HABmin2/commit/c89d825a496bfa1db06509d73909c8af34a130cb))
  * Remove some text to improve layout on small screens ([1f247234](git@github.com:cdjackson/HABmin2/commit/1f2472344505c01c433b3e15f46c79c6c473662d))
  * Remove graph button text on medium screens ([8f1aa8e8](git@github.com:cdjackson/HABmin2/commit/8f1aa8e89e3a8433a6f28d26fc99568177f5a181))
  * Remove graph button text on small screens ([fe65e8a9](git@github.com:cdjackson/HABmin2/commit/fe65e8a9dda7fed97d5401fe3af6d1031347b9db))
  * Add shadow to sitemap frame headings ([190425a6](git@github.com:cdjackson/HABmin2/commit/190425a63ea4257073f1e9f37bc1fcd320c3b8fc))
  * Remove icons from growl notifications ([7ce7615a](git@github.com:cdjackson/HABmin2/commit/7ce7615afbfa8b3b5762cfbd86fdaffffbda2c6b))
  * Improve authentication and reload of data when server or user changes ([80f057b7](git@github.com:cdjackson/HABmin2/commit/80f057b73c94812c4ce1251a0e4148638d711c71))
  * Make sitemap titlebar full width ([fe3256dc](git@github.com:cdjackson/HABmin2/commit/fe3256dcb677176bcb6a16801caa5fedb91eedd6))
  * Close navbar when selection made on small screens ([829f0538](git@github.com:cdjackson/HABmin2/commit/829f0538d78b116bf62e9a6e49e7b989cbc7c1d0))
  * Hide some navbar text on smaller screens ([f7e3b3ae](git@github.com:cdjackson/HABmin2/commit/f7e3b3ae29de68d6d4a175f936795935906bda2a))
  * Improve login form and add internationalisation ([b074f31e](git@github.com:cdjackson/HABmin2/commit/b074f31ed9fecdbc238ed299733c48fab0e79849))
  * Improve styling of sitemap widgets ([de1896cb](git@github.com:cdjackson/HABmin2/commit/de1896cb4b86946c5d4a80d75a07884526718332))
  * Add weather-icons ([ae1ce462](git@github.com:cdjackson/HABmin2/commit/ae1ce462eb54e0a8690ae761c709eebfe2079a41))
  * Persist user theme choice to local storage and reset on startup ([2ce3952b](git@github.com:cdjackson/HABmin2/commit/2ce3952bbe5da9cbee822687937d24c6ae782b82))
  * Add theme switching ([eebb64d3](git@github.com:cdjackson/HABmin2/commit/eebb64d371f7a36a5a45ae3820c83fff46aedf65))
* **ZWave:**
  * Add icon and processing for SECURE_KEYPAD_DOOR_LOCK class ([aae19184](git@github.com:cdjackson/HABmin2/commit/aae191849d95b528d67563b9bcba2d35f8d20490))
