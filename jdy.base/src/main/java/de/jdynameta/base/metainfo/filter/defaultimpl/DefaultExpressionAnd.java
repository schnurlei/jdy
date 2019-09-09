/**
 *
 * Copyright 2011 (C) Rainer Schneider,Roggenburg <schnurlei@googlemail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package de.jdynameta.base.metainfo.filter.defaultimpl;

import de.jdynameta.base.metainfo.filter.AndExpression;
import de.jdynameta.base.metainfo.filter.ExpressionVisitor;
import de.jdynameta.base.metainfo.filter.ObjectFilterExpression;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.ValueObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

/**
 * Filter Expression which defines the Comparision from a Attribute with a Value
 *
 * @author	Rainer Schneider
 */
@SuppressWarnings("serial")
public class DefaultExpressionAnd implements AndExpression
{

    private final List<ObjectFilterExpression> expressionVect;

    /**
     * ValueExpression - Konstruktorkommentar.
     *
     * @param aExprVect
     */
    public DefaultExpressionAnd(List<ObjectFilterExpression> aExprVect)
    {
        super();
        assert (aExprVect.size() > 0);
        expressionVect = aExprVect;
    }

     /* ValueExpression - Konstruktorkommentar.
     *
     * @param aExprVect
     */
    public DefaultExpressionAnd(ObjectFilterExpression ... aExprVect)
    {
        super();
        this.expressionVect = Arrays.asList(aExprVect);
    }

    @Override
    public Iterator<ObjectFilterExpression> getExpressionIterator()
    {
        return expressionVect.iterator();
    }

    @Override
    public <ExpressionType> ExpressionType visit(ExpressionVisitor<ExpressionType> aVisitor) throws JdyPersistentException {

        return aVisitor.visitAndExpression(this);
    }

    @Override
    public boolean matchesObject(ValueObject aModel) throws JdyPersistentException
    {
        boolean matches = true;
        for (Iterator<ObjectFilterExpression> exprEnum = expressionVect.iterator(); matches && exprEnum.hasNext();)
        {
            matches = ((ObjectFilterExpression) exprEnum.next()).matchesObject(aModel);
        }

        return matches;
    }

    /**
     * Convenience Method to create And Expression with 2 Subexpressions
     *
     * @param expr
     * @return
     */
    public static DefaultExpressionAnd createAndExpr(ObjectFilterExpression ... expr)
    {
        ArrayList<ObjectFilterExpression> andExprColl = new ArrayList<>();
        return new DefaultExpressionAnd(expr);
    }

}
