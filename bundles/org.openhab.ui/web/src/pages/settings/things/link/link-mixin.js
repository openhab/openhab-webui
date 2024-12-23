export default {
  methods: {
    /**
     * Check whether the type of the given Item does match the type of the given channel.
     * @param {object} item
     * @param {object} channel
     * @return {boolean}
     */
    itemTypeIsChannelType (item, channel) {
      if (!channel || !channel.itemType) return true
      if (!item || !item.type) return true
      if (channel.itemType.startsWith('Number')) {
        return item.type.startsWith('Number')
      }
      return channel.itemType === item.type
    },
    /**
     * Check whether the given profileType is compatible with the given Item for the given channel.
     *
     * @param {object} channel
     * @param {object} profileType
     * @param {object} item
     * @return {boolean}
     */
    isProfileTypeCompatible (channel, profileType, item) {
      if (!this.itemTypeIsChannelType(item, channel) && (profileType.uid === 'system:default' || profileType.uid === 'system:follow')) return false
      if (!profileType.supportedItemTypes || profileType.supportedItemTypes.length === 0) return true
      return profileType.supportedItemTypes.includes(item.type.split(':', 1)[0])
    }
  }
}
