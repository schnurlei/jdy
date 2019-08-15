import { ExpressionPrimitiveOperator, JdyAttributeInfo } from '@/js/jdy/jdy-base';

export interface OperatorExprHolder {
    operator: ExpressionPrimitiveOperator | null;
    attribute: JdyAttributeInfo | null;
    value: any | null;
}
