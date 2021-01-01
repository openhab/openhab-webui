/**
 * Copyright (c) 2010-2021 Contributors to the openHAB project
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
package org.openhab.ui.cometvisu.internal.backend.model.config;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * add two attributes to the pages element that are not defined in the XSD
 * but are necessary e.g for the config editor in CometVisu
 *
 * @author Tobias Bräutigam - Initial contribution
 */
@XmlRootElement(name = "pages")
public class SchemaPages extends Pages {

    @XmlAttribute(name = "noNamespaceSchemaLocation", namespace = "http://www.w3.org/2001/XMLSchema-instance")
    protected String noNamespaceSchemaLocation = "../visu_config.xsd";

    public String getNoNamespaceSchemaLocation() {
        return noNamespaceSchemaLocation;
    }

    public void setNoNamespaceSchemaLocation(String noNamespaceSchemaLocation) {
        this.noNamespaceSchemaLocation = noNamespaceSchemaLocation;
    }
}
