import cardGroups from './homecards-grouping'
import { mapState } from 'vuex'

export default {
  computed: mapState({
    model: state => state.model.semanticModel,
    modelReady: state => state.model.semanticModel != null,
    loopError: state => state.model.error
  }),
  methods: {
    cardGroups (type, page) {
      return cardGroups(this.model, type, page)
    }
  }
}
