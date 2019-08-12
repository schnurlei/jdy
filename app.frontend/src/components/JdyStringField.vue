<template>
    <div>
        ValueProperty: {{valueProperty}}
        <div v-if="hasDomainValues">
            <v-combobox :label='fieldLabel' clearable :items="primAttr.getType().domainValues" :readonly="isFieldReadonly" item-text="representation" v-model="fieldValue" item-value="dbValue"></v-combobox>
        </div>
        <div v-else>
            <v-text-field  :error-messages="errors.collect('fieldValue')" data-vv-name="fieldValue" v-model="fieldValue" :prepend-icon="prependIcon"
                           v-validate="validationString" :label="fieldLabel" clearable :counter="primAttr.getType().length" :readonly="isFieldReadonly" :disabled="isFieldReadonly"></v-text-field>
        </div>
    </div>
</template>

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyPrimitiveAttributeInfo, JdyTextType, JdyTextTypeHint} from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyStringField',
        components: {
        }
    })
    export default class JdyStringField extends Vue {

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

        get prependIcon () {
            let icon = '';
            let textType = (this.primAttr) ? this.primAttr.getType() as JdyTextType : null;
            if (textType && textType.getTypeHint()=== JdyTextTypeHint.EMAIL) {
                icon += 'alternate_email';
            }
            if (textType && textType.getTypeHint()=== JdyTextTypeHint.URL) {
                icon += 'http';
            }
            if (textType && textType.getTypeHint()=== JdyTextTypeHint.TELEPHONE) {
                icon += 'phone';
            }

            return icon;
        };

        get validationString () {

            let textType = (this.primAttr) ? this.primAttr.getType() as JdyTextType : null;
            let validation = '';
            if (textType && textType.getLength() > 0) {
                validation += 'max:'+ textType.getLength();
            }
            if (this.primAttr && this.primAttr.getNotNull()) {
                if (validation.length > 0) {
                    validation += '|';
                }
                validation += 'required';
            }
            if (textType && textType.getTypeHint()=== JdyTextTypeHint.EMAIL) {
                if (validation.length > 0) {
                    validation += '|';
                }
                validation += 'email';
            }
            if (textType && textType.getTypeHint()=== JdyTextTypeHint.URL) {
                if (validation.length > 0) {
                    validation += '|';
                }
                validation += 'url';
            }

            return validation;
        };

        get fieldLabel ()  {
            let required = (this.primAttr && this.primAttr.getNotNull()) ? '*' : '';
            return (this.primAttr && this.primAttr.getInternalName())? this.primAttr.getInternalName() + required : '';
        };

        get hasDomainValues ()  {

            let textType = (this.primAttr) ? this.primAttr.getType() as JdyTextType : null;
            let domainValues = (textType) ? textType.getDomainValues() : null;
            return !!(domainValues && domainValues.length);
        };

        get isFieldReadonly ()  {

            return (this.primAttr) ? this.primAttr.isGenerated() : false;
        }
}
</script>
