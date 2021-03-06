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
package de.jdynameta.persistence.objectlist;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

import de.jdynameta.base.objectlist.ObjectListModel;
import de.jdynameta.base.objectlist.ObjectListModelEvent;
import de.jdynameta.base.objectlist.ObjectListModelListener;
import de.jdynameta.base.objectlist.ProxyResolveException;

/**
 * @author Rainer
 *
 */
@SuppressWarnings("serial")
public class ObjectListFilterAndSortWrapper<TListObject> 
	implements ObjectListModel<TListObject>
{
	private final List<TListObject> allObjects;
	protected final ArrayList<ObjectListModelListener<TListObject>> listenerList;
	private ObjectListModel<TListObject> wrappedObjectList;
	/** comparator for the list, if if should be ordered */
	private Comparator<TListObject> sortComparator;
	private ObjectFilter<TListObject> filter;
	private ObjectListModelListener<TListObject> wrappedListListener;
	
	/**
	 * 
	 */
	public ObjectListFilterAndSortWrapper()
	{
		super();
		this.allObjects = new ArrayList<TListObject>();
		this.listenerList = new ArrayList<ObjectListModelListener<TListObject>>();
		this.wrappedListListener = new ObjectListModelListener<TListObject> ()
		{
			public void contentsChanged(ObjectListModelEvent<TListObject>  aEvent)
			{
				refresh();
			}
			public void intervalAdded(ObjectListModelEvent<TListObject>  aEvent)
			{
				ArrayList<TListObject> newObjects = new ArrayList<TListObject>();
				for( int start = aEvent.getLowerIndex(); start <= aEvent.getLowerIndex(); start++) {
					newObjects.add(wrappedObjectList.get(start));
				}
				
				for (TListObject listObject : newObjects)
				{
					int addIndex;
					if ( sortComparator != null) {
						addIndex = Collections.binarySearch(allObjects, listObject, sortComparator);
						addIndex = (addIndex < 0) ? addIndex * -1 : addIndex;
					} else {
						addIndex = allObjects.size();
					}
					allObjects.add(addIndex, listObject);
					fireIntervalAdded(ObjectListFilterAndSortWrapper.this, addIndex, addIndex);
				}
			}

			public void intervalRemoved(ObjectListModelEvent<TListObject>  aEvent)
			{
				// todo how can we get the removed objects  
				refresh();
			}
			public void intervalUpdated(ObjectListModelEvent<TListObject> aEvent)
			{
				ArrayList<TListObject> changedObjects = new ArrayList<TListObject>();
				for( int start = aEvent.getLowerIndex(); start <= aEvent.getLowerIndex(); start++) {
					changedObjects.add(wrappedObjectList.get(start));
				}
				
				for (TListObject listObject : changedObjects)
				{
					int changeIndex;
					if ( sortComparator != null) {
						changeIndex = Collections.binarySearch(allObjects, listObject, sortComparator);
					} else {
						changeIndex = allObjects.indexOf(listObject);
					}
					fireIntervalUpdated(ObjectListFilterAndSortWrapper.this, changeIndex, changeIndex);
				}
			}
		};
	}

	/** Retrieves the filter.
	 *
	 * @return	The filter currently applied to the model.
	 */
	private ObjectFilter getFilter()
	{
		return filter;
	}

	/**
	 * @return
	 */
	public void setWrappedObjectList(ObjectListModel<TListObject> aObjectList) throws ProxyResolveException
	{
		// do syncronisation
		if (wrappedObjectList != null ) 
		{
			this.wrappedObjectList.removeObjectListModelListener(this.wrappedListListener);	
		}
		this.wrappedObjectList = aObjectList;
		
		if ( this.wrappedObjectList != null) 
		{ 
			this.wrappedObjectList.addObjectListModelListener(this.wrappedListListener);	
		}
		
		refresh();
	}

	/** Sets the model filter and refreshes the model.
	 *
	 * @param filter				The filter to be applied to the model.
	 */
	private void setFilter(ObjectFilter<TListObject> aFilter) throws ProxyResolveException
	{
		this.filter = aFilter;
		refresh();
	}

	/**
	 * Sets the _sortComparator.
	 * @param aSortComparator The _sortComparator to set. if is not null 
	 * 							the list will be sorted according to this comparator
	 */
	public void setSortComparator(Comparator<TListObject> aSortComparator) throws ProxyResolveException
	{
		this.sortComparator = aSortComparator;
		refresh();
	}

	/**	
	 * Refreshes the collection.
	 */
	private void refresh() throws ProxyResolveException
	{
		this.allObjects.clear();
		this.fireContentsChanged(this, 0, this.allObjects.size()-1);
		
		if ( this.wrappedObjectList != null) 
		{
			for(Iterator<TListObject> iterator = this.wrappedObjectList.iterator(); iterator.hasNext();)
			{
				TListObject object = iterator.next();
				if( this.filter == null || this.filter.accept(object))
				{
					this.addToAllObjects(object);
				}
			}
		}

		if(sortComparator != null)
		{
			Collections.sort(this.allObjects, sortComparator);
		}


		this.fireContentsChanged(this, 0, this.allObjects.size()-1);
	}

	/**
	 * Sychronize access to allObjects
	 * @param anObject
	 */
	private synchronized void addToAllObjects(TListObject anObject)
	{
		this.allObjects.add(anObject);
	}
	
	
	/* (non-Javadoc)
	 * @see de.comafra.model.objectlist.ObjectList#get(int)
	 */
	public TListObject get(int index)
	{
		return this.allObjects.get(index);
	}
	
	/* (non-Javadoc)
	 * @see de.comafra.model.objectlist.ObjectList#iterator()
	 */
	public Iterator<TListObject> iterator()
	{
		return this.allObjects.iterator();
	}
	
	/* (non-Javadoc)
	 * @see de.comafra.model.objectlist.ObjectList#size()
	 */
	public int size()
	{
		return this.allObjects.size();
	}

	/* (non-Javadoc)
	 * @see de.comafra.model.objectlist.ObjectList#indexOf(java.lang.Object)
	 */
	public int indexOf(Object anObject)
	{
		return this.allObjects.indexOf(anObject);
	}

	/* (non-Javadoc)
	 * @see de.comafra.model.objectlist.ObjectListModel#addObjectListModelListener(de.comafra.model.objectlist.ObjectListModelListener)
	 */
	public void addObjectListModelListener(ObjectListModelListener<TListObject> aListener)
	{
		listenerList.add(aListener);
	}

	/* (non-Javadoc)
	 * @see de.comafra.model.objectlist.ObjectListModel#removeObjectListModelListener(de.comafra.model.objectlist.ObjectListModelListener)
	 */
	public void removeObjectListModelListener(ObjectListModelListener<TListObject> aListener)
	{
		listenerList.remove(aListener);
	}

	protected void fireContentsChanged(ObjectListModel<TListObject> source, int index0, int index1)
	{
		ObjectListModelEvent<TListObject> event = null;
		for (ObjectListModelListener<TListObject> curListener : listenerList) {
			
			if (event == null) {
				event = new ObjectListModelEvent<TListObject>(source, index0, index1);
			}
			curListener.contentsChanged(event);
		}		
	}
	
	protected void fireIntervalUpdated(ObjectListModel<TListObject> source, int index0, int index1)
	{
		ObjectListModelEvent<TListObject> event = null;
		for (ObjectListModelListener<TListObject> curListener : listenerList) {
			
			if (event == null) {
				event = new ObjectListModelEvent<TListObject>(source, index0, index1);
			}
			curListener.intervalUpdated(event);
		}		
	}
	
	protected void fireIntervalAdded(ObjectListModel<TListObject> source, int index0, int index1)
	{
		ObjectListModelEvent<TListObject> event = null;
		for (ObjectListModelListener<TListObject> curListener : listenerList) {
			
			if (event == null) {
				event = new ObjectListModelEvent<TListObject>(source, index0, index1);
			}
			curListener.intervalAdded(event);
		}		
	}

	protected void fireIntervalRemoved(ObjectListModel<TListObject> source, int index0, int index1)
	{
		ObjectListModelEvent<TListObject> event = null;
		for (ObjectListModelListener<TListObject> curListener : listenerList) {
			
			if (event == null) {
				event = new ObjectListModelEvent<TListObject>(source, index0, index1);
			}
			curListener.intervalRemoved(event);
		}		
	}

	/**
	 * Test if the given list is sorted according to the specified comparator.
	 * @param modelList the list to test
	 * @param aComparator compator to compare to elemets in the list
	 * @return boolean true - the list is sorted
	 */
	public static <Tobject> boolean isSorted( List<Tobject> modelList, Comparator<Tobject> aComparator)
	{
		boolean sorted = true;
		Iterator<Tobject> listIterator = modelList.iterator();
		Tobject prevObject = null;
		
		while(listIterator.hasNext() && sorted){
			Tobject element = listIterator.next();
			if(prevObject != null){
				sorted = aComparator.compare(element, prevObject) >= 0;	
			}	
			prevObject = element;
		}	
		
		return sorted;
	}

}
