/**
 * Copyright (c) 2010-2023 Contributors to the openHAB project
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
package org.openhab.ui.cometvisu.internal.backend.model.config.pure;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlValue;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 * Adapter for marshaling label with CDATA content
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "label", propOrder = { "value" })
public class CDataLabel extends Label {

    @XmlJavaTypeAdapter(AdapterCDATA.class)
    @XmlValue
    protected String value;

    /**
     * Gets the value of the value property.
     *
     * @return
     *         possible object is
     *         {@link String }
     *
     */
    public String getValue() {
        return value;
    }

    /**
     * Sets the value of the value property.
     *
     * @param value
     *            allowed object is
     *            {@link String }
     *
     */
    public void setValue(String value) {
        this.value = value;
    }
}
