package com.nutricash.api.common.util;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class DateTimeUtil {

    private DateTimeUtil() {
    }

    public static ZonedDateTime atZone(Instant instant, ZoneId zoneId) {
        return instant.atZone(zoneId);
    }
}

