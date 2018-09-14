<template>
    <div>
        <div v-if="primitiveAttribute.getType().getType() === 'TEXT'">
            <jdy-string :selectedItem="selectedItem" :primAttr="primitiveAttribute">String</jdy-string>
        </div>
        <div v-else-if="primitiveAttribute.getType().getType() === 'LONG'">
            <jdy-long :selectedItem="selectedItem" :primAttr="primitiveAttribute">String</jdy-long>
        </div>
        <div v-else-if="primitiveAttribute.getType().getType() === 'DECIMAL'">
            <jdy-decimal :selectedItem="selectedItem" :primAttr="primitiveAttribute">String</jdy-decimal>
        </div>
        <div v-else-if="primitiveAttribute.getType().getType() === 'TIMESTAMP'">
            <jdy-timestamp :selectedItem="selectedItem" :primAttr="primitiveAttribute">String</jdy-timestamp>
        </div>
        <div v-else-if="primitiveAttribute.getType().getType() === 'BOOLEAN'">
            <jdy-boolean :selectedItem="selectedItem" :primAttr="primitiveAttribute">String</jdy-boolean>
        </div>
        <div v-else-if="primitiveAttribute.getType().getType() === 'VARCHAR'">
            <jdy-text :selectedItem="selectedItem" :primAttr="primitiveAttribute">String</jdy-text>
        </div>
        <div v-else>
            <div>Not Defined</div>
        </div>
    </div>
</template>

<script>

export default {

    // https://gist.github.com/Christilut/1143d453ea070f7e8fa345f7ada1b999
    // https://github.com/paulpv/vuetify-number-field
    props: ['selectedItem', 'primitiveAttribute'],
    data () {
        return {
            formFields: []
        };
    }
};

</script>
