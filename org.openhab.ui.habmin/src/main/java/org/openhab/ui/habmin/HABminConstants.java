package org.openhab.ui.habmin;

public class HABminConstants {
    public final static String HABMIN_DATA_DIR = "/habmin/";
    private final static String USERDATA_DIR_PROG_ARGUMENT = "smarthome.userdata";

    public static String getDataDirectory() {
        final String eshUserDataFolder = System.getProperty(USERDATA_DIR_PROG_ARGUMENT);
        if (eshUserDataFolder != null) {
            return eshUserDataFolder + HABMIN_DATA_DIR;
        }
        return null;
    }
}
