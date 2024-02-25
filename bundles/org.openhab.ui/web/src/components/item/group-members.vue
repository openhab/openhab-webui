<template>
  <f7-card>
    <f7-card-content>
      <f7-list>
        <ul v-if="!editMembers">
          <item
            v-for="member in groupItem.members" :key="member.name"
            :item="member" :link="'/settings/items/' + member.name"
            :context="context" />
          <!-- <f7-list-button @click="enableEditMode" color="blue" title="Add or Remove Members" /> -->
        </ul>
        <item-picker v-if="editMembers" :multiple="true" name="groupMembers" :value="memberNames" title="Members" :editableOnly="true" @input="(members) => memberNames = members" />
      </f7-list>
    </f7-card-content>
    <f7-card-footer>
      <f7-button color="blue" v-if="!editMembers" @click="enableEditMode">
        Change
      </f7-button>
      <f7-button color="blue" v-if="editMembers" fill raised @click="updateMembers">
        Apply
      </f7-button>
      <f7-button color="blue" v-if="editMembers" @click="cancelEditMode">
        Cancel
      </f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<style>

</style>

<script>
import Item from './item'
import ItemPicker from '@/components/config/controls/item-picker.vue'

export default {
  props: ['groupItem', 'context'],
  components: {
    Item,
    ItemPicker
  },
  data () {
    return {
      editMembers: false,
      memberNames: [],
      newMemberNames: []
    }
  },
  methods: {
    enableEditMode () {
      this.memberNames = this.groupItem.members.map((m) => m.name)
      this.editMembers = true
    },
    cancelEditMode () {
      this.editMembers = false
    },
    updateMembers () {
      const itemsToAdd = this.memberNames.filter((n) => this.groupItem.members.findIndex((m) => m.name === n) < 0)
      const itemsToRemove = this.groupItem.members.filter((m) => (this.memberNames.indexOf(m.name) < 0)).map((m) => m.name)

      if (!itemsToAdd.length && !itemsToRemove.length) {
        this.$f7.dialog.alert('Nothing to change')
        return
      }
      if (itemsToAdd.indexOf(this.groupItem.name) >= 0) {
        this.$f7.dialog.alert('Cannot add this group as a member of itself')
        return
      }
      // Note: this routine doesn't check cyclic memberships

      const vm = this
      this.$f7.dialog.confirm(
        `This will add ${itemsToAdd.length} item(s) and remove ${itemsToRemove.length} item(s) from this group. Continue?`,
        'Add or Remove Members',
        () => {
          const promises = [
            ...itemsToAdd.map((item) => this.$oh.api.put(`/rest/items/${vm.groupItem.name}/members/${item}`)),
            ...itemsToRemove.map((item) => this.$oh.api.delete(`/rest/items/${vm.groupItem.name}/members/${item}`))
          ]

          Promise.all(promises)
            .then((d) => {
              vm.$emit('updated')
              vm.$f7.toast.create({
                text: 'Member list updated',
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
              this.editMembers = false
            })
            .catch((err) => {
              vm.$f7.dialog.alert('Error while updating the member list: ' + err)
            })
        }
      )
    }
  }
}
</script>
