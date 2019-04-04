<template>
<q-carousel color="white" arrows quick-nav class="full-height">
  <q-carousel-slide class="flex flex-center bg-primary text-white text-center">
    <div class="q-display-3"><q-icon name="mdi-human-greeting" /><br />I'm HABot</div>
    <div class="full-width flex flex-center">
      <div>
        <q-chat-message
          avatar="statics/icons/icon-192x192.png"
          :text="['Hi!']"
        />
      </div>
    </div>
    <div class="q-display-1">My mission is to answer queries about your smart home</div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-secondary text-white text-center">
    <div class="full-width flex flex-center q-display-3">
      <q-icon class="q-ma-md" name="computer" />
      <q-icon class="q-ma-md" name="tablet" />
      <q-icon class="q-ma-md" name="smartphone" />
    </div>
    <div class="q-display-1">I run on desktops, tablets and phones...</div>
    <div class="q-display-1">...but my brains are entirely at home, in your openHAB server!</div>
    <div class="full-width flex flex-center q-display-4">
      <q-icon class="q-ma-md" name="mdi-home-automation" />
    </div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-red-2">
    <div class="q-display-1 text-center"><q-icon class="q-display-3 full-width" name="mdi-comment-question-outline" /><br />You can ask me about the state of your items...</div>
    <div class="full-width">
      <div>
        <q-chat-message
          color="secondary" sent="true"
          :text="['what\'s the temperature in the kitchen?']"
        />
      </div>
      <div>
        <q-chat-message
          color="secondary" sent="true"
          :text="['show me the lights in the garage']"
        />
      </div>
      <div>
        <q-chat-message
          color="secondary" sent="true"
          :text="['is the front door open?']"
        />
      </div>
    </div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-deep-purple-2">
    <div class="q-display-1 text-center"><q-icon class="q-display-3 full-width" name="mdi-comment-alert-outline" /><br />...give me simple orders...</div>
    <div class="full-width">
      <div>
        <q-chat-message
          color="secondary" sent="true"
          :text="['turn on the heating on the first floor']"
        />
      </div>
      <div>
        <q-chat-message
          color="secondary" sent="true"
          :text="['set the living room lights to 25%']"
        />
      </div>
      <div>
        <q-chat-message
          color="secondary" sent="true"
          :text="['change the lights in the garden to blue']"
        />
      </div>
    </div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-green-2">
    <div class="q-display-1 text-center"><q-icon class="q-display-3 full-width" name="mdi-comment-plus-outline" /><br />...or make me retrieve historical data</div>
    <div class="full-width">
      <div>
        <q-chat-message
          color="secondary" sent="true"
          :text="['temperature in the bedroom over 2 weeks']"
        />
      </div>
      <div>
        <q-chat-message
          color="secondary" sent="true"
          :text="['show me a chart of the humidity for the last 3 days']"
        />
      </div>
      <div>
        <q-chat-message
          color="secondary" sent="true"
          :text="['give me the power consumption of the past 2 hours']"
        />
      </div>
    </div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-teal-2">
    <div class="q-display-1 text-center"><q-icon class="q-display-3 full-width" name="aspect_ratio" /><br />I will show you cards with information and controls</div>
    <div class="full-width flex flex-center q-pa-md">
      <q-card style="width: 400px" class="bg-white">
        <q-card-title>Downstairs Corridor
          <!-- <span slot="subtitle"></span> -->
        </q-card-title>
        <q-list separator>
          <q-item>
            <q-item-main label="Temperature" sublabel="Temperature_GF_Corridor" />
            <q-item-side right><span class="tutorial-big-value">21.5 °C</span></q-item-side>
          </q-item>
          <q-item>
            <q-item-main label="Heating" sublabel="Heating_GF_Corridor" />
            <q-item-side right><q-toggle /></q-item-side>
          </q-item>
          <q-item>
            <q-item-main label="Lights" sublabel="Lights_GF_Corridor">
              <q-slider />
            </q-item-main>
            <q-item-side right><q-toggle /></q-item-side>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-blue-grey text-white">
    <div class="q-display-1 text-center"><q-icon class="q-display-3 full-width" name="archive" /><br />If you find a card useful, use its <span class="text-no-wrap">
      <q-btn outline round icon="more_vert">
        <q-popover anchor="bottom right" self="top right">
          <q-list link class="no-border">
            <q-item v-close-overlay class="highlight-and-fade">
              <q-item-main label="Add to Card deck" />
            </q-item>
            <q-item v-close-overlay>
              <q-item-main label="Add &amp; bookmark" />
            </q-item>
          </q-list>
        </q-popover>
      </q-btn>
      context menu</span> to add it to your <strong class="text-no-wrap">Card deck <q-icon name="dashboard" /></strong></div>
    <div class="q-headline text-center">I organize cards by objects and locations, but you can <strong class="text-no-wrap">bookmark <q-icon name="bookmark" /></strong> important ones for quick access</div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-brown text-white">
    <!-- <div class="full-width flex flex-center q-display-4">
      <q-icon class="q-ma-md" name="mdi-table-edit" />
    </div> -->
    <div class="q-display-1 text-center"><q-icon class="q-display-3 full-width" name="mdi-table-edit" /><br />You can customize cards from the deck using the <strong class="text-no-wrap">Card Designer</strong></div>
    <div class="q-headline text-center">When asked again about the same objects and/or locations, I will retrieve your customized card and show it to you instead of building one myself</div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-indigo-6 text-white">
    <!-- <div class="full-width flex flex-center q-display-4">
      <q-icon class="q-ma-md" name="mdi-thought-bubble" />
    </div> -->
    <div class="q-display-1 text-center full-width"><q-icon class="q-display-3 full-width" name="mdi-thought-bubble" /><br />To be helpful, I need you to prepare your items first so I can figure out how they are related to your queries</div>
    <div class="q-headline text-center full-width">Read walkthrough series next to learn all about it and more!</div>
    <div class="full-width flex flex-center">
      <q-btn push size="xl" color="secondary" @click="$emit('done')">Close</q-btn>
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
.tutorial-big-value
  font-weight 300
  color black
  font-size 150%
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
