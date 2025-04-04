/*
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

import javax.xml.bind.annotation.adapters.XmlAdapter;

/**
 * Adapter for marshaling CDATA content
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
public class AdapterCDATA extends XmlAdapter<String, String> {

    @Override
    public String unmarshal(String v) throws Exception {
        return String.format("<![CDATA[ {} ]]>", v);
    }

    @Override
    public String marshal(String v) throws Exception {
        return v;
    }
}
