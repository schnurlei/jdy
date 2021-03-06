/**
 *
 * Copyright 2011 (C) Rainer Schneider,Roggenburg <schnurlei@googlemail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package de.jdynameta.metamodel.metainfo.model.impl;

import de.jdynameta.base.metainfo.PrimitiveType;
import de.jdynameta.base.metainfo.impl.JdyTextType;
import de.jdynameta.metamodel.metainfo.MetaModelRepository;

/**
 * TextTypeModelImpl
 *
 * @author Copyright &copy;  
 * @author Rainer Schneider
 * @version 
 */
@SuppressWarnings("serial")
public  class TextTypeModelImpl extends de.jdynameta.metamodel.metainfo.model.impl.PrimitiveAttributeInfoModelImpl
	implements de.jdynameta.metamodel.metainfo.model.TextTypeModel

{
	private java.lang.Long length;

	/**
	 *Constructor 
	 */
	public TextTypeModelImpl ()
	{
		super(MetaModelRepository.getSingleton().getTextTypeModelInfo());
	}

	/**
	 * Get the length
	 * @generated
	 * @return get the length
	 */
	public Long getLengthValue() 
	{
		return length;
	}

	/**
	 * set the length
	 * @generated
	 * @param length
	 */
	public void setLength( Long aLength) 
	{
		length = aLength;
	}

	public long getLength() 
	{
		return (length == null ) ? 0 : length.intValue();
	}

	public PrimitiveType getType()
	{
		return new JdyTextType((int)getLength());
	}


}