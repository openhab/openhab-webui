export default {
  data () {
    return {
      dirty: false
    }
  },
  methods: {
    beforeLeave (resolve, reject) {
      if (this.dirty) {
        this.$f7.dialog.confirm(
          'Do you want to leave this page without saving?',
          'Changes have not been saved',
          function () { resolve() },
          function () { reject() }
        )
      } else {
        resolve()
      }
    }
  }
}
