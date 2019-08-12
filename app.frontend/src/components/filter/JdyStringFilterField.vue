<template>
    <div>
        <div v-if="hasDomainValues">
            <v-combobox :label='fieldLabel' clearable :items="primAttr.getType().domainValues" item-text="representation" v-model="fieldValue" item-value="dbValue"></v-combobox>
        </div>
        <div v-else>
            <v-text-field   v-model="fieldValue"
                           :label="fieldLabel" clearable ></v-text-field>
        </div>
    </div>
</template>

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyPrimitiveAttributeInfo, JdyTextType, JdyTextTypeHint} from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyStringFilterField',
        components: {
        }
    })
    export default class JdyStringFilterField extends Vue {

        @Prop({default: null}) primAttr: JdyPrimitiveAttributeInfo | null | undefined;
        @Prop() itemToEdit;
        // property to get/set the value from the itemToEdit, when null use this.primAttr.getInternalName()
        @Prop({default: null}) valueProperty: string | null | undefined;

        get fieldValue() {
            if (this.valueProperty) {
                return (this.itemToEdit) ? this.itemToEdit[this.valueProperty] : "";
            } else {
                return (this.itemToEdit  && this.primAttr) ? this.itemToEdit[this.primAttr.getInternalName()] : "";
            }
        }

        set fieldValue (val) {
            if (this.valueProperty) {
                this.itemToEdit[this.valueProperty] = val;
            } else if (this.itemToEdit  && this.primAttr) {
                this.itemToEdit[this.primAttr.getInternalName()] = val;
            }
        }

        // Lifecycle hook
        created () {
            this.fieldValue = null;
        }

       get fieldLabel ()  {
            let required = (this.primAttr && this.primAttr.getNotNull()) ? '*' : '';
            return (this.primAttr && this.primAttr.getInternalName())? this.primAttr.getInternalName() + required : '';
        };

        get hasDomainValues ()  {

            let textType = (this.primAttr) ? this.primAttr.getType() as JdyTextType : null;
            let domainValues = (textType) ? textType.getDomainValues() : null;
            return !!(domainValues && domainValues.length);
        };

}
</script>
