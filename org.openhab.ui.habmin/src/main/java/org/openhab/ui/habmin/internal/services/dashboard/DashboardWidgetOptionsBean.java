/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.dashboard;

import java.net.URI;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * This is a java bean that is used with JAXB to serialize items
 * to XML or JSON.
 *  
 * @author Chris Jackson
 * @since 1.4.0
 *
 */
@XmlRootElement(name="options")
public class DashboardWidgetOptionsBean {

    public URI uri;

	public String chartId;
	public String serviceId;

	public String itemId;
	public Integer barWidth;
	public Integer borderWidth;
	public Integer angle;
	public Integer rotate;
	public Integer barAngle;
	public String lineCap;
	public Integer scaleMin;
	public Integer scaleMax;
	public String title;
	public String units;

	public String group;
	
	public String floorplanId;
}
