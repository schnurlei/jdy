<template>
    <div>
        <div v-if="getType() === 'TEXT'">
            <jdy-string :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-string>
        </div>
        <div v-else-if="getType() === 'LONG'">
            <jdy-long :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-long>
        </div>
        <div v-else-if="getType() === 'DECIMAL'">
            <jdy-decimal :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-decimal>
        </div>
        <div v-else-if="getType() === 'TIMESTAMP'">
            <jdy-timestamp :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-timestamp>
        </div>
        <div v-else-if="getType() === 'BOOLEAN'">
            <jdy-boolean :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-boolean>
        </div>
        <div v-else-if="getType() === 'VARCHAR'">
            <jdy-text :itemToEdit="selectedItem" :primAttr="primitiveAttribute" :valueProperty="valueProperty"></jdy-text>
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
