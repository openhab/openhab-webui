TODO
- [x] HIGH - Swiper-slide needs to be retrofited with new (https://v6.framework7.io/vue/migration-from-v5#swiper) - base api has not changed for how we use in openhab
- [] HIGH - TODO-V3 comments in code need to be cleaned up / examined
- [x] HIGH - fix remaining lint errors
- [x] HIGH - test startup wizard
- [x] MED - Codemirror - codemirror is basically in place, but many of the addon features need to be added
- [x] LOW - Update storage from vuex to pinia - all done with the exception of model store
- [] LOW - (after vue3 port) Clean up tabs - there's a lot of unecessary code that is handled automatically by vue3 - like @click=switchTab
- [] LOW - (after vue3 port) Convert i18n to non-legacy mode since this is deprecated
- [] LOW - document common coding practices
    - v-?? should show up first in any html element
    - use vue3 principles of reactivity where possible (vs. direct DOM manipulation)
    - new components should use typescript where possible

BUGS
- [x] on item-detail->oh-label-card->oh-trend - the width of the graph is fixed at 300
- [x] back button from settings/items, settings/things, settings/model - the URL in the address bar does not change.
- [x] API Explorer - formatting needs to be fixed
- [x] Blockly tool bar at button not showing up
- [] Blockly multi drag/drop not working - recommend upgrading the library, but it requires blockley v11
- [x] login is flaky

- [x] HIGH - production build scripts and reporting
- [x] HIGH - no babel support - is this needed moving forward? - Vite has built-in support for this.
- [x] HIGH - dynamic imports for i18n, node_modules needs to be looked at - currently hacked to get running
- [x] HIGH - vuetrend does not support vue 3 - vue3trend does exist
- [x] HIGH - Cypress - haven't even looked at this or testing yet - removed
- [] HIGH - Swiper-slide needs to be retrofited with new (https://v6.framework7.io/vue/migration-from-v5#swiper)
- [x] HIGH - decide on prettier or other formatter? which rules (currently I just have used default rules)
- [x] HIGH - Jest --> Vitest
- [x] HIGH - vuex reactive items are not getting updated
- [x] HIGH - add support for Codemirror v6
- [] MED - Codemirror - codemirror is basically in place, but many of the addon features need to be added
- [] MED - Blockly test/update? Haven't looked at yet.
- [x] MED - enable strict for typescript - done, required for building
- [x] MED - Websocket proxy through vite (Developer Tools/Log Viewer) not working
- [] LOW - Update storage from vuex to pinia - all done with the exception of model store

BUGS

- [x] bars theme-filled applied to app class, but does not change navbar style. It seems in vue3 (contrary to documentation that I can find), that f7-app classes will not be applied. So, added code to add to the html element at the top.
- [x] vue3-masonry-css is buggy especially when you change the window width?? I have currently integrated the vue3-masonry-css in the codebase to fix the issue. I have in parallel filed an issue on the github repository to see if the author can fix the issue.
- [x] There are two home pages created in the DOM under the view? Removing the "stacked" setting addresses this, but that breaks other things. (This was fixed by updating the routing mechanism for the root page - adding a beforeEnter)
- [] on item-detail->oh-label-card->oh-trend - the width setting is only correct AFTER the page is display - doesn't seem to be reactive
- [] back button from settings/items, settings/things, settings/model - the URL in the address bar does not change.
- [x] farci i18n file under setup-wizard causes vite json error - { variable names } in json were translated to farci
- [x] fix auto dark mode, import echart dark theme

NOTES

- scope-css - had to update save a local implementation and convert to imports vs. require (any licensing issues??)
