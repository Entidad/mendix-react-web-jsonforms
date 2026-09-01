import json from "@rollup/plugin-json";

export default args => {
    return args.configDefaultConfig.map(config => {
        // Rollup cannot parse .json imports on its own, and dependencies in this widget's
        // tree ship them. Everything else in this file was copied from Mendix's RichText
        // widget (CKEditor/sanitize-html plumbing) and never ran, so it has been removed.
        config.plugins.push(json());
        return config;
    });
};
