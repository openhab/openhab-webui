/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
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
