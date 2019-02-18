<template>
<q-carousel color="white" arrows quick-nav class="full-height">
  <q-carousel-slide class="flex flex-center bg-green-7 text-white text-center">
    <div class="q-display-3 full-width"><q-icon class="q-display-3 full-width" name="mdi-tag" /><br />Tag your items</div>
    <div class="q-display-1 full-width">I can match items to keywords in your query if they're tagged properly</div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-lime-3 text-center">
    <div class="q-display-1 text-center">My two main notions are</div>
    <div class="q-display-1 text-center full-width">
      <q-chip class="q-display-1 q-pa-sm text-weight-bold" color="secondary">object</q-chip> and <q-chip class="q-display-1 q-pa-sm text-weight-bold" color="secondary">location</q-chip>
    </div>
    <div class="q-headline text-center">I'll try to extract from your queries using machine learning based on my training</div>
    <div class="bg-white flex flex-center full-width q-py-md text-center">
      <div class="q-caption full-width q-my-md">Show me the <q-chip color="secondary" dense>object:temperature</q-chip>
        of the <q-chip color="secondary" dense>location:bedroom</q-chip></div>
      <div class="q-caption full-width q-my-md">Switch off the <q-chip color="secondary" dense>object:light</q-chip>
        in the <q-chip color="secondary" dense>location:kitchen</q-chip></div>
      <div class="q-caption full-width q-my-md">Set the <q-chip color="secondary" dense>object:thermostat</q-chip>
        to 20</div>
    </div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-teal text-white text-center">
    <div class="q-display-1"><q-icon class="q-display-3 full-width" name="mdi-tag-plus" /><br />It's up to you to tell me which items correspond by adding tags prefixed with
      <q-chip class="q-display-1 q-pa-sm text-weight-bold" color="secondary">object:</q-chip> and
      <q-chip class="q-display-1 q-pa-sm text-weight-bold" color="secondary">location:</q-chip>
    </div>
    <div class="full-width flex flex-center">
      <div>
        <q-alert type="negative">Please use only lowercase and don't put spaces before or after the ":" separator</q-alert>
      </div>
    </div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-dark text-grey text-center">
    <div class="q-display-1 full-width">Example .items file:</div>
    <div class="tutorial-code">
      <div class="code-line">
        <span class="text-blue-5">Switch</span> <span class="text-teal-14">Heating_GF_Kitchen</span> <span class="text-orange-4">"Kitchen Heating"</span>
          (<span class="text-teal-14">GF_Kitchen</span>, <span class="text-teal-14">Heating</span>)
          <span class="bg-grey-10">[<span class="text-orange-4">"object:heating"</span>, <span class="text-orange-4">"location:kitchen"</span>]</span> {...}
      </div>
      <div class="code-line">
        <span class="text-blue-5">Rollershutter</span> <span class="text-teal-14">Shutters_GF_Bed</span> <span class="text-orange-4">"Bedroom Shutters"</span>
          (<span class="text-teal-14">FF_Bed</span>, <span class="text-teal-14">Shutters</span>)
          <span class="bg-grey-10">[<span class="text-orange-4">"object:shutters"</span>, <span class="text-orange-4">"location:bedroom"</span>]</span> {...}
      </div>
      <div class="code-line">
        <span class="text-blue-5">Dimmer</span> <span class="text-teal-14">Light_C_Garage</span> <span class="text-orange-4">"Garage Lights"</span>
          (<span class="text-teal-14">FF_Bed</span>, <span class="text-teal-14">Shutters</span>)
          <span class="bg-grey-10">[<span class="text-orange-4">"object:light"</span>, <span class="text-orange-4">"location:garage"</span>]</span> {...}
      </div>
      <div class="code-line">
        <span class="text-blue-5">Number</span> <span class="text-teal-14">Temperature_FF_Bath</span> <span class="text-orange-4">"Bathroom Temperature"</span>
          (<span class="text-teal-14">FF_Bath</span>, <span class="text-teal-14">Temperature</span>)
          <span class="bg-grey-10">[<span class="text-orange-4">"object:temperature"</span>, <span class="text-orange-4">"location:bathroom"</span>,
          <span class="text-orange-4">"location:first floor"</span>]</span> {...}
      </div>
    </div>
    <div class="q-title full-width">(an item can have multiple objects or locations)</div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-purple-9 text-white text-center">
    <div class="q-display-1">Object and location tags are inherited from parent groups</div>
    <div class="q-headline">To avoid having to tag similar items individually, group them by object and location and tag the groups!</div>
    <div class="tutorial-code q-pa-lg q-ma-lg full-width bg-dark">
      <div class="code-line">
        <span class="text-blue-5">Group</span> <span class="text-teal-14">GF</span> <span class="text-orange-4">"Ground Floor"</span>
          <span class="bg-grey-10">[<span class="text-orange-4">"location:ground floor"</span>]</span>
      </div>
      <div class="code-line">
        <span class="text-blue-5">Group</span> <span class="text-teal-14">GF_Kitchen</span> <span class="text-orange-4">"Kitchen"</span>
          (<span class="text-teal-14">GF</span>) <span class="bg-grey-10">[<span class="text-orange-4">"location:kitchen"</span>]</span>
      </div>
      <div class="code-line">
        <span class="text-blue-5">Group</span> <span class="text-teal-14">Lights</span> <span class="text-orange-4">"Lights"</span>
        <span class="bg-grey-10">[<span class="text-orange-4">"object:lights"</span>, <span class="text-orange-4">"object:lighting"</span>]</span>
      </div>
      <div class="code-line">
        <span class="text-green-5">// will inherit "location:ground floor", "location:kitchen", "object:lights" and "object:lighting"</span>
        <br />
        <span class="text-blue-5">Dimmer</span> <span class="text-teal-14">Lights_GF_Kitchen</span> <span class="text-orange-4">"Kitchen Lights"</span>
          (<span class="text-teal-14">GF_Kitchen</span>, <span class="text-teal-14">Lights</span>)
        <br /><br />
      </div>
    </div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-light-green text-white text-center">
    <div class="q-display-1">You may also give me hints on how to show you default controls for an item with <q-chip class="q-display-1 q-pa-sm text-weight-bold" color="secondary">habot:</q-chip> tags</div>
    <div class="text-left">
      <ul>
        <li class="q-mb-md"><q-chip dense color="secondary">habot:switchable</q-chip> on a Dimmer tells me it can also be switched on and off, so I will display a switch along with the slider</li>
        <li class="q-mb-md"><q-chip dense color="secondary">habot:control:knob</q-chip> on a Dimmer tells me you prefer a knob rather than a slider for this item</li>
        <li class="q-mb-md">
          <q-chip dense color="secondary">habot:knob:min:18</q-chip>
          <q-chip dense color="secondary">habot:slider:max:35</q-chip>
          <q-chip dense color="secondary">habot:slider:step:0.1</q-chip>
          <q-chip dense color="secondary">habot:knob:leftIcon:mdi-thermometer</q-chip>
          <q-chip dense color="secondary">habot:switch:color:red</q-chip>
          and others define options for the control (check the documentation for the complete list)</li>
      </ul>
    </div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-indigo-6 text-white">
    <!-- <div class="full-width flex flex-center q-display-4">
      <q-icon class="q-ma-md" name="mdi-tag" />
    </div> -->
    <div class="q-display-1 text-center full-width"><q-icon class="q-display-3 full-width" name="mdi-tag-faces" /><br />That's all you need to know - go tag your items!</div>
    <div class="q-headline text-center">In the next tutorial, I'll explain how to get the most out of this web app</div>
    <div class="full-width flex flex-center">
      <q-btn push size="xl" color="secondary" @click="$emit('go', 'enhanced-features')">Go</q-btn>
      <q-btn flat size="md" color="secondary" @click="$emit('done')">or Close</q-btn>
    </div>
  </q-carousel-slide>

  <q-carousel-control
    slot="control-full"
    slot-scope="carousel"
    position="bottom-left"
    :offset="[18, 22]"
  >
    <q-btn
      round push
      color="amber"
      icon="undo"
      @click="$emit('close')"
    />
  </q-carousel-control>
</q-carousel>
</template>

<style lang="stylus">
.item-subtitle
  font-size 14px !important
  // color rgba(0,0,0,0.4) !important
.tutorial-code
  text-align left
  color white
  font-family monospace
  .code-line
    display block
    margin-top 16px
</style>

<script>
export default {
  data () {
    return {
      colors: [
        'primary',
        'secondary',
        'yellow',
        'red',
        'orange',
        'grey-2'
      ]
    }
  }
}
</script>
