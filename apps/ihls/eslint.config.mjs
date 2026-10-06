import next from "eslint-config-next";

const config = [
  { ignores: [".next/**", "node_modules/**", ".data/**", "next-env.d.ts", "scripts/stubs/**"] },
  ...next,
];

export default config;
