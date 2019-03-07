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
package org.openhab.ui.habmin.internal.services.chart;

import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;



/**
 * This is a java bean that is used with JAXB to serialize items
 * to XML or JSON.
 *  
 * @author Chris Jackson
 * @since 1.4.0
 *
 */
@XmlRootElement(name="chart")
public class ChartConfigBean {
	public Integer id;
	public String name;
	public String title;
	public String icon;
	public Integer period;
	public Boolean legend;

	public List<ChartItemConfigBean> items;
	public List<ChartAxisConfigBean> axis;
}
