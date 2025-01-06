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
package org.openhab.ui.internal;

import org.ops4j.pax.web.extender.whiteboard.runtime.DefaultWelcomeFileMapping;
import org.ops4j.pax.web.service.whiteboard.WelcomeFileMapping;
import org.osgi.service.component.annotations.Component;

/**
 * The mapping of files considered as welcome file when there is no file name in requests.
 *
 * @author Wouter Born - Initial contribution
 */
@Component(service = WelcomeFileMapping.class)
public class UIWelcomeFileMapping extends DefaultWelcomeFileMapping {

    public UIWelcomeFileMapping() {
        setRedirect(false);
        setWelcomeFiles(new String[] { "index.html" });
    }
}
