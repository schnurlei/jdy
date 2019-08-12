<template>
    <div>
        <div v-if="hasDomainValues">
            <v-combobox :label='primAttr.getInternalName ()' clearable :items="primAttr.getType().domainValues"></v-combobox>
        </div>
        <div v-else>
            <jdy-numeric :itemToEdit="itemToEdit" :primAttr="primAttr" :valueProperty="valueProperty"
                        :fieldLabel='primAttr.getInternalName()'></jdy-numeric>
        </div>
    </div>
</template>

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyDecimalType, JdyPrimitiveAttributeInfo} from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyDecimalFilterField',
        components: {
        }
    })
    export default class JdyDecimalFilterField extends Vue {

        @Prop({default: null}) primAttr: JdyPrimitiveAttributeInfo | null | undefined;
        @Prop() itemToEdit;
        @Prop({default: null}) valueProperty: string | null | undefined;

        get hasDomainValues ()  {

            let textType = (this.primAttr) ? this.primAttr.getType() as JdyDecimalType : null;
            let domainValues = (textType) ? textType.getDomainValues() : null;
            return !!(domainValues && domainValues.length);
        };

        // Lifecycle hook
        created () {
            if (this.valueProperty) {
                this.itemToEdit[this.valueProperty] = null;
            } else if (this.itemToEdit  && this.primAttr) {
                this.itemToEdit[this.primAttr.getInternalName()] = null;
            }

        }

    };
</script>
