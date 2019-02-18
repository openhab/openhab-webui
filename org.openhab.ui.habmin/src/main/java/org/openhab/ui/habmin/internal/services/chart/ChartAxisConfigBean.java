/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.chart;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * This is a java bean that is used with JAXB to serialize items
 * to XML or JSON.
 *  
 * @author Chris Jackson
 * @since 1.4.0
 *
 */
@XmlRootElement(name="axis")
public class ChartAxisConfigBean {

	public Integer axis;
	public String label;
	public String color;
	public String format;
	public Double minimum;
	public Double maximum;
	public String position;
	public String majorColor;
	public Integer majorWidth;
	public String majorStyle;
	public String minorColor;
	public Integer minorWidth;
	public String minorStyle;
}
