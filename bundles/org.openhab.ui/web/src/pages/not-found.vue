<template>
  <f7-page>
    <f7-navbar title="Not found" back-link="Back"></f7-navbar>
    <f7-block strong>
      <p>Sorry</p>
      <p>Requested content not found.</p>
    </f7-block>
    <f7-block strong>
      <p>Debug information</p>
      <ul>
        <li><b>Url:</b> {{$f7route.url}}</li>
        <li><b>Path:</b> {{$f7route.path}}</li>
        <li><b>Hash:</b> {{$f7route.hash}}</li>
        <li><b>Params:</b>
          <ul>
            <li v-for="(value, key) in $f7route.params" :key="key"><b>{{key}}:</b> {{value}}</li>
          </ul>
        </li>
        <li><b>Query:</b>
          <ul>
            <li v-for="(value, key) in $f7route.query" :key="key"><b>{{key}}:</b> {{value}}</li>
          </ul>
        </li>
        <li><b>Route:</b> {{$f7route.route.path}}</li>
      </ul>
    </f7-block>
    <f7-block strong>
      <f7-link @click="$f7router.back()">Go back</f7-link>
    </f7-block>
    <f7-button href="/">Go home</f7-button>
  </f7-page>
</template>
<script>
export default {}
</script>
