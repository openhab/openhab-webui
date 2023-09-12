<template>
  <f7-page class="developer-dock">
    <f7-col resizable class="display-flex flex-direction-column" style="padding: 0px; border: none; min-width: 50px; background-color: transparent">
      <f7-row resizable style="height: 50%; min-height: 50px">
        <developer-sidebar />
      </f7-row>
      <f7-row resizable style="height: 50%; min-height: 50px">
        <help-sidebar />
      </f7-row>
    </f7-col>    
  </f7-page>
</template>