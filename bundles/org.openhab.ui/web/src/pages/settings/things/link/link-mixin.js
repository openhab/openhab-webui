const PROFILES_REQUIRING_TYPE_COMPATIBILITY = ['system:default', 'system:follow']

export default {
  methods: {
    /**
     * Check whether the type of the given Item is compatible with the type of the given channel.
     * @param {object} item
     * @param {object} channel
     * @return {boolean}
     */
    itemTypeCompatibleWithChannelType (item, channel) {
      if (!channel || !channel.itemType) return true
      if (!item || !item.type) return true
      if (channel.itemType === 'Color' && ['Color', 'Switch', 'Dimmer'].includes(item.type)) return true
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
      if (!this.itemTypeCompatibleWithChannelType(item, channel) && PROFILES_REQUIRING_TYPE_COMPATIBILITY.includes(profileType.uid)) return false
      if (!profileType.supportedItemTypes || profileType.supportedItemTypes.length === 0) return true
      return profileType.supportedItemTypes.includes(item.type.split(':', 1)[0])
    }
  }
}
