package com.nutricash.api.common.util;

public final class FileUtil {

    private FileUtil() {
    }

    public static String extensionOf(String filename) {
        if (filename == null) {
            return "";
        }
        int separator = filename.lastIndexOf('.');
        return separator < 0 ? "" : filename.substring(separator + 1);
    }
}

