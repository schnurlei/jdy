<template>
    <v-switch :label='primAttr.getInternalName ()' :readonly="primAttr.isGenerated"></v-switch>
</template>

<script>
export default {

    props: ['selectedItem', 'primAttr'],
    data () {
        return {
            formFields: []
        };
    }
};
</script>
