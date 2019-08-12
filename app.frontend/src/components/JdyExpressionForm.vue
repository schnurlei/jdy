<template>
    <v-form v-model="valid">
        <v-container grid-list-xl>
            <v-layout wrap>
                <v-flex xs12 md4 >
                    <v-select v-model="selectedAttribute" :items="possibleAttributes" item-text="internalName" :return-object="true" label="Attribute" no-data-text="Select Attribute"></v-select>
                </v-flex>

                <v-flex xs12 md4>
                    <v-select v-model="selectedOperator" :items="possibleOperators" item-text="toString()" :return-object="true" label="Operator" no-data-text="Select Operator"></v-select>
                </v-flex>

                <v-flex xs12 md4>
                    <jdy-primitive :selectedItem="expression" :primitiveAttribute="selectedAttribute"  valueProperty="value"></jdy-primitive>
                </v-flex>
            </v-layout>
        </v-container>
    </v-form>
</template>

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {
        ExpressionPrimitiveOperator,
        JdyAttributeInfo,
        JdyClassInfo,
        JdyEqualOperator,
        JdyGreatorOperator, JdyLessOperator
    } from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyExpressionForm',
        components: {
        }
    })
    export default class JdyExpressionForm extends Vue {

        @Prop({default: null}) classInfo: JdyClassInfo | null | undefined;
        @Prop() expression;
        valid = true;

        get selectedAttribute() {
            return this.expression.attribute;
        }
        set selectedAttribute(value) {
            this.expression.attribute = value;
        }

         get selectedOperator() {
            return this.expression.operator;
        }
        set selectedOperator(value) {
            this.expression.operator = value;
        }

        get exprValues() {
            return this.expression.value;
        }
        set exprValues(value) {
            this.expression.value = value;
        }

        get possibleAttributes() {

            let attributes: JdyAttributeInfo[] = [];
            if (this.classInfo) {

                this.classInfo.forEachAttr(attrInfo => {
                    if (attrInfo.isPrimitive()) {
                        attributes.push(attrInfo);
                    }
                });
            }
            return attributes.sort();
        }

        get possibleOperators(): ExpressionPrimitiveOperator[] {

            return [new JdyEqualOperator(true), new JdyEqualOperator(false), new JdyGreatorOperator(true)
                , new JdyGreatorOperator(false), new JdyLessOperator(true), new JdyLessOperator(false)]
        }

        getInternalName(item) {
            return item.getInternalName();
        }
   };

</script>

