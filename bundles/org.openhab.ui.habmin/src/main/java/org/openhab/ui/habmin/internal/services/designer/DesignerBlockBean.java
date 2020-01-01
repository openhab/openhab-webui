/**
 * Copyright (c) 2010-2020 Contributors to the openHAB project
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
package org.openhab.ui.habmin.internal.services.designer;

import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import com.thoughtworks.xstream.annotations.XStreamImplicit;

/**
 * 
 * @author Chris Jackson
 * @since 1.5.0
 *
 */
@XmlRootElement(name="block")
public class DesignerBlockBean {
	public String type;
	
	public Boolean inline;
	public Boolean moveable;
	public Boolean disabled;
	public Boolean deletable;
	public Boolean editable;
	
	public DesignerCommentBean comment;

	@XStreamImplicit
	public List<DesignerMutationBean> mutation;

	@XStreamImplicit
	public List<DesignerChildBean> children;

	@XStreamImplicit
	public List<DesignerFieldBean> fields;
	
	public DesignerBlockBean next;
}
