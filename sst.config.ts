/// <reference path="./.sst/platform/config.d.ts" />

const CUSTOMER_NAME = "velora";
const APP_NAME = "velora-distribution";
const REGION = "us-east-1";

export default $config({
  app(input) {
    return {
      name: APP_NAME,
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: REGION,
          defaultTags: {
            tags: {
              customer: CUSTOMER_NAME,
              app: APP_NAME,
            }
          },
        },
      },
    };
  },
  async run() {
    const ui = new sst.aws.StaticSite(`${APP_NAME}-ui`, {
      path: "packages/ui",
      build: {
        command: "npm run build",
        output: "dist",
      },
      domain: {
        name: "velora-verifier.wakeuplabs.io",
        aliases: ["velora-verifier.wakeuplabs.link"],
      }
    });

    return {
      ui: ui.url,
    };
  },
});
