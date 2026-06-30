package com.nutricash.api.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AiWorkerRateLimiter {
    private final long intervalNanos;
    private long nextPermit;

 public AiWorkerRateLimiter(@Value("${app.ai.worker.jobs-per-second:3}")

    double rate)
    {
        intervalNanos = (long) (1_000_000_000D / Math.max(.1D, rate));
    }

    public synchronized void acquire() {
        long wait = Math.max(0, nextPermit - System.nanoTime());
        if (wait > 0)
            try {
                Thread.sleep(wait / 1_000_000, (int) (wait % 1_000_000));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException(e);
            }
        nextPermit = Math.max(System.nanoTime(), nextPermit) + intervalNanos;
    }
}
