<template>
  <div class="block-preview" ref="blockPreview">
    <code v-if="definitionError" class="definition-error text-color-red" ref="blockPreview">
      {{ definitionError }}
    </code>
    <f7-menu v-if="blocksDefinition && blocksDefinition.slots && blocksDefinition.slots.blocks" style="position: absolute; right: 20px; top: 20px">
      <f7-menu-item style="margin-left: auto" :text="currentBlock" dropdown>
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item
            v-for="block in blocksDefinition.slots.blocks.filter((b) => b.component === 'BlockType')"
            :key="block.config.type"
            @click="displayCurrentBlock(block)"
            href="#"
            :text="block.config.type" />
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
  </div>
</template>

<style lang="stylus">
.block-preview
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  .definition-error
    position absolute
    top calc(2rem + var(--f7-menu-item-height))
    left 1rem
    right 1rem
    z-index 10000
  .current-block-select
    position absolute
    top 20
    right 20
    z-index 10000
  .blocklySvg
    background-color inherit !important
  .blocklyMainBackground
    stroke inherit
.blocklyDropDownDiv
  z-index 9000
</style>

<script>
import Blockly from 'blockly'
import Vue from 'vue'

Vue.config.ignoredElements = ['field', 'block', 'category', 'xml', 'mutation', 'value', 'sep']
export default {
  props: ['blocksDefinition'],
  data () {
    return {
      workspace: null,
      definitionError: null,
      currentBlock: null
    }
  },
  mounted () {
    this.initWorkspace()
    this.defineBlocks()
  },
  watch: {
    blocksDefinition () {
      this.defineBlocks()
    }
  },
  methods: {
    initWorkspace () {
      this.workspace = Blockly.inject(this.$refs.blockPreview, {
        theme: (this.$f7.data.themeOptions.dark === 'dark') ? 'dark' : undefined,
        trashcan: false,
        readOnly: false
      })
    },
    defineBlocks () {
      try {
        this.definitionError = null
        if (this.blocksDefinition && this.blocksDefinition.slots && this.blocksDefinition.slots.blocks) {
          this.blocksDefinition.slots.blocks.forEach((block) => {
            Blockly.Blocks[block.config.type] = {
              init: function () {
                // const blockJson = JSON.stringify(block.config)
                this.jsonInit(block.config)
              }
            }
          })

          this.displayCurrentBlock()
        }
      } catch (e) {
        this.definitionError = e.toString()
      }
    },
    displayCurrentBlock (block) {
      if (block) this.currentBlock = block.config.type
      if (!this.currentBlock) this.currentBlock = this.blocksDefinition.slots.blocks[0].config.type
      let xml = '<xml>'
      xml += `<block type="${this.currentBlock}" deletable="false"></block>`
      xml += '</xml>'
      this.workspace.clear()
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), this.workspace)
    }
  }
}
</script>
