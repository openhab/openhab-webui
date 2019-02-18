/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.designer;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import com.thoughtworks.xstream.annotations.XStreamImplicit;

/**
 * 
 * @author Chris Jackson
 * @since 1.5.0
 *
 */
@XmlRootElement(name="designlist")
public class DesignerListBean {
	@XmlElement(name="designs")
	@XStreamImplicit(itemFieldName="designs")
	public List<DesignerBean> designs = new ArrayList<DesignerBean>();

	public DesignerListBean() {};
}


