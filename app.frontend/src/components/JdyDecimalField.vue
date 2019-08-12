<template>
    <div>
        <div v-if="hasDomainValues">
            <v-combobox :label='primAttr.getInternalName ()' clearable :items="primAttr.getType().domainValues" :readonly="primAttr.isGenerated()" :disabled="primAttr.isGenerated()"></v-combobox>
        </div>
        <div v-else>
            <jdy-numeric :itemToEdit="itemToEdit" :primAttr="primAttr" :valueProperty="valueProperty"
                        :fieldLabel='primAttr.getInternalName()' :fieldReadonly="primAttr.isGenerated()" :disabled="primAttr.isGenerated()" :isNotNull="primAttr.getNotNull()"
                         :minValue="primAttr.getType().getMinValue()" :maxValue="primAttr.getType().getMaxValue()" :scale="primAttr.getType().getScale()"></jdy-numeric>
        </div>
    </div>
</template>

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyDecimalType, JdyPrimitiveAttributeInfo} from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyDecimalField',
        components: {
        }
    })
    export default class JdyDecimalField extends Vue {

        @Prop({default: null}) primAttr: JdyPrimitiveAttributeInfo | null | undefined;
        @Prop() itemToEdit;
        @Prop({default: null}) valueProperty: string | null | undefined;

        get hasDomainValues ()  {

            let textType = (this.primAttr) ? this.primAttr.getType() as JdyDecimalType : null;
            let domainValues = (textType) ? textType.getDomainValues() : null;
            return !!(domainValues && domainValues.length);
        };
    };
</script>
