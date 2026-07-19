'use strict';

exports.config = {
    app_name: ['DSA Club'],
    license_key: process.env.NEW_RELIC_LICENSE_KEY,
    logging: {
        level: 'info',
        filepath: 'stdout'
    },
    allow_all_headers: true,
    application_logging: {
        forwarding: {
            enabled: true
        }
    },
    distributed_tracing: {
        enabled: true
    },
    error_collector: {
        enabled: true,
        ignore_status_codes: [404]
    },
    transaction_tracer: {
        enabled: true,
        transaction_threshold: 'apdex_f'
    }
};