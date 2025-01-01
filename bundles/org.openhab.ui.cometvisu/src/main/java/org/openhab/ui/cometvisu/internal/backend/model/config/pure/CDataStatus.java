/**
 * Copyright (c) 2010-2025 Contributors to the openHAB project
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
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 * Adapter for marshaling status with CDATA content
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "status", propOrder = { "value" })
public class CDataStatus extends Status {

    @XmlJavaTypeAdapter(AdapterCDATA.class)
    protected String value;
}
