export default {
  methods: {
    /**
     * Validate the Thing ID against valid characters and
     * if existing Things are available on `this.things`,
     * ensures that the Thing UID doesn't match an existing UID.
     *
     * @param {string} uid The Thing UID to validate
     * @param {string} id The Thing ID to validate
     * @returns {string} The error message if either the ID or the UID are invalid, or an empty string if they are valid.
     */
    validateThingUID (uid, id) {
      if (!/^[A-Za-z0-9_][A-Za-z0-9_-]*$/.test(id)) {
        return 'Required. Must not start with a dash. A-Z,a-z,0-9,_,- only'
      } else if (this.things && this.things.some((thing) => thing.UID === uid)) {
        return `A Thing with '${uid}' UID already exists`
      }
      return ''
    }
  }
}
