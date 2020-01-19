<template>
  <f7-card expandable :animate="$f7.data.themeOptions.expandableCardAnimation !== 'disabled'" card-tablet-fullscreen v-on:card:opened="cardOpening" v-on:card:closed="cardClosed">
    <f7-card-content :padding="false">
      <!-- <div
        v-if="header === 'image'"
        :style="{background: 'url(https://ksassets.timeincuk.net/wp/uploads/sites/54/2018/07/Nest-Hello-daytime-sample.jpg) no-repeat center top', 'background-size': 'cover', height: '300px'}"
      > -->
      <div v-if="header === 'image'" style="background: #777777">
        <f7-card-header text-color="white">{{title || 'Something'}}</f7-card-header>
        <f7-link
          card-close
          color="white"
          class="card-opened-fade-in"
          :style="{position: 'absolute', right: '15px', top: '15px'}"
          icon-f7="close_round_fill"
        ></f7-link>
        <img src="https://ksassets.timeincuk.net/wp/uploads/sites/54/2018/07/Nest-Hello-daytime-sample.jpg" width="340px" />
      </div>
      <div v-else-if="header === 'player'" :class="`bg-color-${color}`" :style="{height: '300px'}">
        <f7-card-header text-color="white" class="display-block">
          {{title || 'Something'}}
          <br>
          <small :style="{opacity: 0.7}">Pink Floyd - Money</small>
          <br>
          <br>
          <img
            width="100"
            src="https://images-na.ssl-images-amazon.com/images/I/61hw9WloObL._SY355_.jpg"
          >
        </f7-card-header>
        <f7-link
          card-close
          color="white"
          class="card-opened-fade-in"
          :style="{position: 'absolute', right: '15px', top: '15px'}"
          icon-f7="close_round_fill"
        ></f7-link>
      </div>
      <div v-else :class="`bg-color-${color}`" :style="{height: '300px'}">
        <f7-card-header text-color="white" class="display-block">
          {{title || 'Something'}}
          <div><small v-if="subtitle">{{subtitle}}</small></div>
          <br>
          <!-- <small :style="{opacity: 0.7}">Build Mobile Apps</small> -->
          <f7-gauge
            v-if="header==='temperature'"
            type="circle"
            :value="gaugeValue"
            :size="120"
            borderColor="#aaaaaa"
            :borderWidth="10"
            :valueText="`${temperature}°C`"
            :valueFontSize="41"
            valueTextColor="#ffffff"
          />
          <f7-gauge
            v-else-if="header==='gauge'"
            type="circle"
            :value="gaugeValue"
            :size="120"
            borderColor="#aaaaaa"
            :borderWidth="10"
            :valueText="`${gaugeValue * 100}%`"
            :valueFontSize="41"
            valueTextColor="#ffffff"
            labelText="pressure"
            labelTextColor="#ffffff"
          />
          <h1 v-else>State</h1>
          <small v-if="header === 'temperature'">Mode: {{thermostatMode}}</small>
        </f7-card-header>
        <f7-link
          card-close
          color="white"
          class="card-opened-fade-in"
          :style="{position: 'absolute', right: '15px', top: '15px'}"
          icon-f7="close_round_fill"
        ></f7-link>
      </div>
      <div class="card-content-padding" v-if="opened">
        <f7-segmented v-if="header === 'temperature'" tag="p" raised>
          <f7-button
            :color="color"
            :active="temperature === 18"
            @click="() => temperature = 18"
          >18°C</f7-button>
          <f7-button
            :color="color"
            :active="temperature === 19"
            @click="() => temperature = 19"
          >19°C</f7-button>
          <f7-button
            :color="color"
            :active="temperature === 20"
            @click="() => temperature = 20"
          >20°C</f7-button>
          <f7-button
            :color="color"
            :active="temperature === 21"
            @click="() => temperature = 21"
          >21°C</f7-button>
          <f7-button
            :color="color"
            :active="temperature === 22"
            @click="() => temperature = 22"
          >22°C</f7-button>
        </f7-segmented>
        <f7-segmented v-else-if="header === 'gauge'" tag="p" raised>
          <f7-button :color="color" :active="gaugeValue === 0" @click="() => gaugeValue = 0">0%</f7-button>
          <f7-button
            :color="color"
            :active="gaugeValue === 0.25"
            @click="() => gaugeValue = 0.25"
          >25%</f7-button>
          <f7-button :color="color" :active="gaugeValue === 0.5" @click="() => gaugeValue = 0.5">50%</f7-button>
          <f7-button
            :color="color"
            :active="gaugeValue === 0.75"
            @click="() => gaugeValue = 0.75"
          >75%</f7-button>
          <f7-button :color="color" :active="gaugeValue === 1" @click="() => gaugeValue = 1">100%</f7-button>
        </f7-segmented>

        <f7-list v-if="header === 'temperature'">
          <ul>
            <sitemap-widget-generic
              :model="{ type: 'Setpoint', icon: 'temperature', label: 'Setpoint [21]' }"
            />
            <f7-list-item divider title="Mode"></f7-list-item>
            <f7-list-item
              radio
              :color="color"
              checked
              title="Heat"
              name="demo-thermostat-mode"
              @click="thermostatMode = 'HEAT'"
            ></f7-list-item>
            <f7-list-item
              radio
              :color="color"
              title="Cool"
              name="demo-thermostat-mode"
              @click="thermostatMode = 'COOL'"
            ></f7-list-item>
            <f7-list-item
              radio
              :color="color"
              title="Eco"
              name="demo-thermostat-mode"
              @click="thermostatMode = 'ECO'"
            ></f7-list-item>
          </ul>
        </f7-list>
        <f7-list v-else>
          <ul>
            <sitemap-widget-generic
              :model="{ type: 'Slider', icon: 'soundvolume', label: 'Volume [53]' }"
            />
            <sitemap-widget-generic
              :model="{ type: 'Switch', icon: 'soundvolume_mute', label: 'Mute sound [OFF]' }"
            />
            <f7-list-item divider title="Scene"></f7-list-item>
            <f7-list-item radio checked title="Morning" name="demo-radio"></f7-list-item>
            <f7-list-item radio title="Evening" name="demo-radio"></f7-list-item>
            <f7-list-item radio title="Dinner" name="demo-radio"></f7-list-item>
            <f7-list-item radio title="Night" name="demo-radio"></f7-list-item>
            <!-- <f7-list-item link="/form/" title="Another page"></f7-list-item>
            <f7-list-item link="/dynamic-route/blog/45/post/125/?foo=bar#about" title="Dynamic Route"></f7-list-item>-->
            <!-- <f7-list-item link="/load-something-that-doesnt-exist/" title="Default Route (404)"></f7-list-item> -->
            <f7-list-item divider title="Some fake data"></f7-list-item>
            <sitemap-widget-generic
              :model="{ type: 'String', icon: 'sunrise', label: 'Sunrise [07:02]' }"
            />
            <sitemap-widget-generic
              :model="{ type: 'String', icon: 'sunset', label: 'Sunset [17:36]' }"
            />
            <sitemap-widget-generic
              :model="{ type: 'String', icon: 'sun', label: 'Sun Azimuth [131.75 °]' }"
            />
            <sitemap-widget-generic
              :model="{ type: 'String', icon: 'sun', label: 'Sun Elevation [17.05 °]' }"
            />
          </ul>
        </f7-list>

        <!-- <p>Framework7 - is a free and open source HTML mobile framework to develop hybrid mobile apps or web apps with iOS or Android (Material) native look and feel. It is also an indispensable prototyping apps tool to show working app prototype as soon as possible in case you need to. Framework7 is created by Vladimir Kharlampidi (iDangero.us).</p>
        <p>The main approach of the Framework7 is to give you an opportunity to create iOS and Android (Material) apps with HTML, CSS and JavaScript easily and clear. Framework7 is full of freedom. It doesn't limit your imagination or offer ways of any solutions somehow. Framework7 gives you freedom!</p>
        <p>Framework7 is not compatible with all platforms. It is focused only on iOS and Android (Material) to bring the best experience and simplicity.</p>
        <p>Framework7 is definitely for you if you decide to build iOS and Android hybrid app (Cordova or PhoneGap) or web app that looks like and feels as great native iOS or Android (Material) apps.</p>
        -->
        <p>
          <f7-button fill round large card-close :color="color">Close</f7-button>
        </p>
      </div>
    </f7-card-content>
  </f7-card>
</template>

<style lang="stylus">
// .md .card-expandable
//   transition-duration 100ms !important
// .md .card-expandable.card-opening,
// .md .card-expandable.card-closing,
// .md .card-expandable.card-transitioning {
//   transition-duration: 100ms;
// }
// .md .card-expandable.card-opening .card-content {
//   transition-duration: 100ms;
// }
// .md .card-expandable.card-closing .card-content {
//   transition-duration: 100ms;
// }
</style>

<script>
export default {
  props: ['color', 'type', 'header', 'title', 'subtitle'],
  data () {
    return {
      opened: false,
      gaugeValue: 0.75,
      temperature: 21,
      thermostatMode: 'HEAT'
    }
  },
  methods: {
    cardOpening () {
      console.log('card opened')
      setTimeout(() => { this.opened = true }, 200)
    },
    cardClosed () {
      console.log('card closed')
      this.opened = false
    }
  }
}
</script>
