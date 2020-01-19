<template>
  <f7-page name="about" class="page-about">
    <f7-navbar title-large="About" title="About" back-link="Back"></f7-navbar>
    <f7-block class="block-narrow after-big-title">
      <f7-row>
        <f7-col>
          <!-- <f7-block-title>About openHAB</f7-block-title> -->
          <f7-block>
            <img src="res/icons/128x128.png" width="96" class="padding float-right">
            <h2 class="block-title-medium">openHAB version {{this.$f7.version}}</h2>
            <p><f7-link external target="_blank" href="https://www.openhab.org/">Home page</f7-link></p>
            <p><f7-link external target="_blank" href="https://www.openhab.org/docs/">Documentation</f7-link></p>
            <p><f7-link external target="_blank" href="https://community.openhab.org/">Community forum</f7-link></p>
          </f7-block>
          <!-- <f7-block>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magni molestiae laudantium dignissimos est nobis delectus nemo ea alias voluptatum architecto, amet similique, saepe iste consectetur in repellat ut minus quibusdam!</p>
            <p>Molestias et distinctio porro nesciunt ratione similique, magni doloribus, rerum nobis, aliquam quae reiciendis quasi modi. Nam a recusandae, fugiat in ea voluptates fuga eius, velit corrupti reprehenderit dignissimos consequatur!</p>
            <p>Blanditiis, cumque quo adipisci. Molestiae, dolores dolorum quos doloremque ipsa ullam eligendi commodi deserunt doloribus inventore magni? Ea mollitia veniam nostrum nihil, iusto doloribus a at! Ea molestiae ullam delectus!</p>
          </f7-block> -->

        </f7-col>
      </f7-row>
      <f7-block-title><h4>Appearance Options (local to this device)</h4></f7-block-title>
      <theme-switcher />
    </f7-block>

    <!-- <f7-button href="/analyzer/?items=MultiSensorSalon_Temperature">Analyzer</f7-button> -->

  </f7-page>
</template>

<script>
import ThemeSwitcher from '../components/theme-switcher.vue'

export default {
  components: {
    ThemeSwitcher
  }
}
</script>
