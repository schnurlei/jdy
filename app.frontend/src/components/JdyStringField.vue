<template>
    <div>
        <div v-if="primAttr.getType().domainValues">
            <v-combobox :label='primAttr.getInternalName ()' clearable :items="primAttr.getType().domainValues" :readonly="primAttr.isGenerated"></v-combobox>
        </div>
        <div v-else>
            <v-text-field  :prepend-icon="prependIcon" v-validate="validationString" :error-messages="errors.collect('fieldValue')" data-vv-name="fieldValue" v-model="fieldValue" :label='primAttr.getInternalName ()' clearable :counter="primAttr.getType().length" :readonly="primAttr.isGenerated"></v-text-field>
        </div>
    </div>
</template>

<script lang='ts'>

import * as JDY from '../js/jdy/jdy-base';
import Vue from 'vue';

export default Vue.extend({

    props: ['selectedItem', 'primAttr'],
    data () {
        return {
            fieldValue: '',
            formFields: []
        };
    },
    computed: {

        prependIcon () {
            let icon = '';
            if (this.primAttr.getType().getTypeHint()=== JDY.JdyTextTypeHint.EMAIL) {
                icon += 'alternate_email';
            }
            if (this.primAttr.getType().getTypeHint()=== JDY.JdyTextTypeHint.URL) {
                icon += 'http';
            }
            if (this.primAttr.getType().getTypeHint()=== JDY.JdyTextTypeHint.TELEPHONE) {
                icon += 'phone';
            }

            return icon;
        },
        validationString () : string {
            let validation = '';
            if (this.primAttr.getType().length > 0) {
                validation += 'max:'+this.primAttr.getType().length;
            }
            if (this.primAttr.getNotNull()) {
                if (validation.length > 0) {
                    validation += '|';
                }
                validation += 'required';
            }
            if (this.primAttr.getType().getTypeHint()=== JDY.JdyTextTypeHint.EMAIL) {
                if (validation.length > 0) {
                    validation += '|';
                }
                validation += 'email';
            }
            if (this.primAttr.getType().getTypeHint()=== JDY.JdyTextTypeHint.URL) {
                if (validation.length > 0) {
                    validation += '|';
                }
                validation += 'url';
            }

            return validation;
        }
    }
});
</script>
