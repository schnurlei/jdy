<template>
    <div>
        <div v-if="getType() === 'TEXT'">
            <jdy-string-filter :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-string-filter>
        </div>
        <div v-else-if="getType() === 'LONG'">
            <jdy-long-filter :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-long-filter>
        </div>
        <div v-else-if="getType() === 'DECIMAL'">
            <jdy-decimal-filter :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-decimal-filter>
        </div>
        <div v-else-if="getType() === 'TIMESTAMP'">
            <jdy-timestamp-filter :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-timestamp-filter>
        </div>
        <div v-else-if="getType() === 'BOOLEAN'">
            <jdy-boolean-filter :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-boolean-filter>
        </div>
        <div v-else>
            <div>Not Defined</div>
        </div>
    </div>
</template>

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyPrimitiveAttributeInfo} from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyPrimitiveComponentHolder',
        components: {
        }
    })
    export default class JdyPrimitiveComponentHolder extends Vue {
        @Prop({default: null}) primitiveAttribute: JdyPrimitiveAttributeInfo | null | undefined;
        @Prop() selectedItem;
        @Prop({default: null}) valueProperty: string | null | undefined;

        getType () {
            return (this.primitiveAttribute) ? this.primitiveAttribute.getType().getType() : null;
        }

     };

</script>
